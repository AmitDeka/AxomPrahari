package com.axomprahari.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.axomprahari.data.PreferencesManager
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
