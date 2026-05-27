package com.axomprahari.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.axomprahari.data.PreferencesManager
import com.axomprahari.data.model.TrafficReport
import com.axomprahari.data.model.ReportStatus
import com.axomprahari.data.remote.dto.VerifyOtpResponse
import com.axomprahari.data.remote.dto.UserProfile
import com.axomprahari.data.remote.dto.ViolationDto
import com.axomprahari.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface MainUiState {
    object Loading : MainUiState
    object OnboardingRequired : MainUiState
    object Unauthenticated : MainUiState
    object Authenticated : MainUiState
}

@HiltViewModel
class MainViewModel @Inject constructor(
    private val preferencesManager: PreferencesManager,
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _userProfile = MutableStateFlow<UserProfile?>(null)
    val userProfile: StateFlow<UserProfile?> = _userProfile.asStateFlow()

    private val _violationsList = MutableStateFlow<List<ViolationDto>>(emptyList())
    val violationsList: StateFlow<List<ViolationDto>> = _violationsList.asStateFlow()

    private var currentToken: String? = null

    init {
        viewModelScope.launch {
            preferencesManager.userToken.collect { token ->
                currentToken = token
                if (!token.isNullOrEmpty()) {
                    fetchDashboard(token)
                    fetchViolations(token)
                } else {
                    _userProfile.value = null
                    _violationsList.value = emptyList()
                }
            }
        }
    }

    fun refreshViolations() {
        currentToken?.let { token ->
            fetchViolations(token)
        }
    }

    fun fetchDashboard(token: String) {
        viewModelScope.launch {
            authRepository.getCitizenDashboard(token).onSuccess { response ->
                _userProfile.value = response.data.user
            }.onFailure {
                // Fail silently or keep existing
            }
        }
    }

    fun fetchViolations(token: String) {
        viewModelScope.launch {
            authRepository.getCitizenViolations(token).onSuccess { response ->
                _violationsList.value = response.data
            }.onFailure {
                // Fail silently or keep existing
            }
        }
    }

    /** Holds the short-lived JWT for new users who need to complete their profile */
    private val _tempAuthToken = MutableStateFlow<String?>(null)
    val tempAuthToken: StateFlow<String?> = _tempAuthToken.asStateFlow()

    private val _reportsList = MutableStateFlow<List<TrafficReport>>(
        listOf(
            TrafficReport("1", "No Helmet", "G.S. Road, Near Christian Basti, Guwahati", "Today, 09:30 AM", 100, ReportStatus.VERIFIED),
            TrafficReport("2", "Triple Riding", "Jorhat Bypass, Jorhat", "Yesterday, 04:15 PM", 150, ReportStatus.VERIFIED),
            TrafficReport("3", "Wrong Side Driving", "AT Road, Dibrugarh", "2 days ago, 11:45 AM", 200, ReportStatus.UNDER_REVIEW),
            TrafficReport("4", "Red Light Jump", "Six Mile Intersection, Guwahati", "3 days ago, 08:10 PM", 0, ReportStatus.REJECTED)
        )
    )
    val reportsList: StateFlow<List<TrafficReport>> = _reportsList.asStateFlow()

    fun addReport(report: TrafficReport) {
        _reportsList.value = listOf(report) + _reportsList.value
    }

    private val _isSplashFinished = MutableStateFlow(false)

    val uiState: StateFlow<MainUiState> = combine(
        preferencesManager.hasCompletedOnboarding,
        preferencesManager.userToken,
        _isSplashFinished
    ) { completedOnboarding, token, isSplashFinished ->
        if (!isSplashFinished) {
            MainUiState.Loading
        } else if (!completedOnboarding) {
            MainUiState.OnboardingRequired
        } else if (token.isNullOrEmpty()) {
            MainUiState.Unauthenticated
        } else {
            MainUiState.Authenticated
        }
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = MainUiState.Loading
    )

    fun onSplashComplete() {
        _isSplashFinished.value = true
    }

    fun completeOnboarding() {
        viewModelScope.launch {
            preferencesManager.setCompletedOnboarding(true)
        }
    }

    fun login(token: String) {
        viewModelScope.launch {
            preferencesManager.saveUserToken(token)
        }
    }

    fun logout() {
        viewModelScope.launch {
            preferencesManager.saveUserToken(null)
        }
    }

    // ── Auth API calls ────────────────────────────────────────

    suspend fun requestOtp(phoneNumber: String): Result<String> =
        authRepository.requestOtp(phoneNumber)

    suspend fun verifyOtp(phoneNumber: String, otp: String): Result<VerifyOtpResponse> {
        val result = authRepository.verifyOtp(phoneNumber, otp)
        // Cache the short-lived token for new users who will proceed to CompleteProfile
        result.onSuccess { response ->
            if (response.isNewUser) {
                _tempAuthToken.value = response.token
            }
        }
        return result
    }

    suspend fun completeProfile(
        token: String,
        fullName: String,
        email: String,
        username: String
    ): Result<String> = authRepository.completeProfile(token, fullName, email, username)
}
