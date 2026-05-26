package com.axomprahari.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.axomprahari.data.PreferencesManager
import com.axomprahari.data.model.TrafficReport
import com.axomprahari.data.model.ReportStatus
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
    private val preferencesManager: PreferencesManager
) : ViewModel() {

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
}
