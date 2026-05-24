package com.axomprahari.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.axomprahari.viewmodel.MainViewModel
import com.axomprahari.viewmodel.MainUiState
import com.axomprahari.ui.screens.*

@Composable
fun RootNavigationGraph(viewModel: MainViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()

    when (val state = uiState) {
        is MainUiState.Loading -> {
            SplashScreen(onAnimationComplete = { viewModel.onSplashComplete() })
        }
        is MainUiState.OnboardingRequired -> {
            NavHost(navController = navController, startDestination = "onboarding") {
                composable("onboarding") {
                    OnboardingScreen(onFinishOnboarding = { viewModel.completeOnboarding() })
                }
            }
        }
        is MainUiState.Unauthenticated -> {
            NavHost(navController = navController, startDestination = "request_otp") {
                composable("request_otp") {
                    RequestOtpScreen(
                        onNavigateToVerify = { phone ->
                            navController.navigate("verify_otp/$phone")
                        },
                        onNavigateToGuidelineFaq = {
                            navController.navigate("guideline_faq")
                        },
                        onNavigateToPrivacyPolicy = {
                            navController.navigate("privacy_policy")
                        },
                        onNavigateToTermsOfService = {
                            navController.navigate("terms_of_service")
                        }
                    )
                }
                composable("verify_otp/{phone}") { backStackEntry ->
                    val phone = backStackEntry.arguments?.getString("phone") ?: ""
                    VerifyOtpScreen(
                        phone = phone,
                        onLoginSuccess = { token ->
                            viewModel.login(token)
                        },
                        onNavigateToProfile = {
                            navController.navigate("complete_profile")
                        },
                        onNavigateBack = {
                            navController.popBackStack()
                        },
                        onNavigateToPrivacyPolicy = {
                            navController.navigate("privacy_policy")
                        },
                        onNavigateToTermsOfService = {
                            navController.navigate("terms_of_service")
                        }
                    )
                }
                composable("complete_profile") {
                    CompleteProfileScreen(
                        onRegistrationSuccess = { token ->
                            viewModel.login(token)
                        }
                    )
                }
                composable("guideline_faq") {
                    GuidelineFaqScreen(
                        onBack = { navController.popBackStack() }
                    )
                }
                composable("privacy_policy") {
                    PrivacyPolicyScreen(
                        onBack = { navController.popBackStack() }
                    )
                }
                composable("terms_of_service") {
                    TermsOfServiceScreen(
                        onBack = { navController.popBackStack() }
                    )
                }
            }
        }
        is MainUiState.Authenticated -> {
            NavHost(navController = navController, startDestination = "dashboard") {
                composable("dashboard") {
                    DashboardScreen(
                        onLogout = { viewModel.logout() },
                        onNavigateToFaq = { navController.navigate("guideline_faq") }
                    )
                }
                composable("guideline_faq") {
                    GuidelineFaqScreen(
                        onBack = { navController.popBackStack() }
                    )
                }
            }
        }
    }
}
