package com.axomprahari.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.axomprahari.data.PreferencesManager
import com.axomprahari.data.model.TrafficReport
import com.axomprahari.data.model.ReportStatus
import com.axomprahari.data.remote.dto.VerifyOtpResponse
import com.axomprahari.data.remote.dto.UserProfile
import com.axomprahari.data.remote.dto.ViolationDto
import com.axomprahari.data.remote.dto.CitizenReportDto
import com.axomprahari.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import com.google.gson.Gson
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

    private val _reportStats = MutableStateFlow<com.axomprahari.data.remote.dto.ReportStats?>(null)
    val reportStats: StateFlow<com.axomprahari.data.remote.dto.ReportStats?> = _reportStats.asStateFlow()

    private val _violationsList = MutableStateFlow<List<ViolationDto>>(emptyList())
    val violationsList: StateFlow<List<ViolationDto>> = _violationsList.asStateFlow()

    private var currentToken: String? = null

    init {
        viewModelScope.launch {
            try {
                val cachedUser = preferencesManager.cachedUserProfile.firstOrNull()
                if (cachedUser != null) _userProfile.value = Gson().fromJson(cachedUser, UserProfile::class.java)
                
                val cachedStats = preferencesManager.cachedReportStats.firstOrNull()
                if (cachedStats != null) _reportStats.value = Gson().fromJson(cachedStats, com.axomprahari.data.remote.dto.ReportStats::class.java)
                
                val cachedReports = preferencesManager.cachedReportsList.firstOrNull()
                if (cachedReports != null) {
                    val type = object : com.google.gson.reflect.TypeToken<List<CitizenReportDto>>() {}.type
                    _reportsList.value = Gson().fromJson(cachedReports, type)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        viewModelScope.launch {
            preferencesManager.userToken.collect { token ->
                currentToken = token
                if (!token.isNullOrEmpty()) {
                    fetchDashboard(token)
                    fetchViolations(token)
                    fetchReports(token)
                } else {
                    _userProfile.value = null
                    _violationsList.value = emptyList()
                    _reportsList.value = emptyList()
                    _reportStats.value = null
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
                _reportStats.value = response.data.reportStats
                try {
                    preferencesManager.saveCachedUserProfile(Gson().toJson(response.data.user))
                    preferencesManager.saveCachedReportStats(Gson().toJson(response.data.reportStats))
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }.onFailure { error ->
                if (error.message?.contains("401") == true) {
                    logout()
                }
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

    fun fetchReports(token: String) {
        viewModelScope.launch {
            authRepository.getCitizenReports(token).onSuccess { response ->
                _reportsList.value = response.data.reports
                try {
                    preferencesManager.saveCachedReportsList(Gson().toJson(response.data.reports))
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }.onFailure {
                // Fail silently or keep existing
            }
        }
    }

    /** Holds the short-lived JWT for new users who need to complete their profile */
    private val _tempAuthToken = MutableStateFlow<String?>(null)
    val tempAuthToken: StateFlow<String?> = _tempAuthToken.asStateFlow()

    private val _reportsList = MutableStateFlow<List<CitizenReportDto>>(emptyList())
    val reportsList: StateFlow<List<CitizenReportDto>> = _reportsList.asStateFlow()

    fun refreshReports() {
        currentToken?.let { token ->
            fetchReports(token)
        }
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

    fun updateProfile(
        fullName: String,
        email: String,
        username: String,
        onResult: (Result<UserProfile>) -> Unit
    ) {
        val token = currentToken
        if (token.isNullOrEmpty()) {
            onResult(Result.failure(Exception("Not authenticated")))
            return
        }
        viewModelScope.launch {
            authRepository.updateProfile(token, fullName, email, username)
                .onSuccess { updatedUser ->
                    _userProfile.value = updatedUser
                    // Refresh dashboard after profile update to get correct status
                    fetchDashboard(token)
                    onResult(Result.success(updatedUser))
                }
                .onFailure { error ->
                    onResult(Result.failure(error))
                }
        }
    }

    fun addReport(report: com.axomprahari.data.remote.dto.CitizenReportDto) {
        _reportsList.value = listOf(report) + _reportsList.value
    }

    fun submitFeedback(
        category: String,
        message: String,
        imageKey: String? = null,
        imageUrl: String? = null,
        onResult: (Result<String>) -> Unit
    ) {
        val token = currentToken
        val profile = _userProfile.value
        if (token.isNullOrEmpty() || profile == null) {
            onResult(Result.failure(Exception("Not authenticated or profile missing")))
            return
        }
        viewModelScope.launch {
            var finalImageKey = imageKey
            var finalImageUrl = imageUrl
            
            // Upload image if it is a local URI
            if (imageUrl != null && imageUrl.startsWith("content://")) {
                val uploadResult = authRepository.uploadMedia(token, imageUrl)
                if (uploadResult.isSuccess) {
                    finalImageKey = uploadResult.getOrNull()?.first
                    finalImageUrl = uploadResult.getOrNull()?.second
                } else {
                    onResult(Result.failure(uploadResult.exceptionOrNull() ?: Exception("Upload failed")))
                    return@launch
                }
            }

            val result = authRepository.submitFeedback(
                token = token,
                citizenId = profile.citizenId,
                category = category,
                message = message,
                imageKey = finalImageKey,
                imageUrl = finalImageUrl
            )
            onResult(result)
        }
    }
}
