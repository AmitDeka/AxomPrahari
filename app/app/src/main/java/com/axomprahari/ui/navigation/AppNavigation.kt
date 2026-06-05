package com.axomprahari.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.axomprahari.viewmodel.MainViewModel
import com.axomprahari.viewmodel.MainUiState
import com.axomprahari.ui.screens.*
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.core.tween

@Composable
fun RootNavigationGraph(viewModel: MainViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val navController = rememberNavController()

    when (val state = uiState) {
        is MainUiState.Loading -> {
            SplashScreen(onAnimationComplete = { viewModel.onSplashComplete() })
        }
        is MainUiState.OnboardingRequired -> {
            NavHost(
                navController = navController,
                startDestination = "onboarding",
                enterTransition = { slideInHorizontally(initialOffsetX = { it }) + fadeIn(animationSpec = tween(300)) },
                exitTransition = { slideOutHorizontally(targetOffsetX = { -it }) + fadeOut(animationSpec = tween(300)) },
                popEnterTransition = { slideInHorizontally(initialOffsetX = { -it }) + fadeIn(animationSpec = tween(300)) },
                popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) + fadeOut(animationSpec = tween(300)) }
            ) {
                composable("onboarding") {
                    OnboardingScreen(onFinishOnboarding = { viewModel.completeOnboarding() })
                }
            }
        }
        is MainUiState.Unauthenticated -> {
            NavHost(
                navController = navController,
                startDestination = "request_otp",
                enterTransition = { slideInHorizontally(initialOffsetX = { it }) + fadeIn(animationSpec = tween(300)) },
                exitTransition = { slideOutHorizontally(targetOffsetX = { -it }) + fadeOut(animationSpec = tween(300)) },
                popEnterTransition = { slideInHorizontally(initialOffsetX = { -it }) + fadeIn(animationSpec = tween(300)) },
                popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) + fadeOut(animationSpec = tween(300)) }
            ) {
                composable("request_otp") {
                    RequestOtpScreen(
                        onNavigateToVerify = { phone ->
                            navController.navigate("verify_otp/$phone")
                        },
                        onRequestOtp = { phone -> viewModel.requestOtp(phone) },
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
                        onVerifyOtp = { p, otp -> viewModel.verifyOtp(p, otp) },
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
                    val tempToken by viewModel.tempAuthToken.collectAsStateWithLifecycle()
                    CompleteProfileScreen(
                        onCompleteProfile = { fullName, email, username ->
                            viewModel.completeProfile(
                                token = tempToken ?: "",
                                fullName = fullName,
                                email = email,
                                username = username
                            )
                        },
                        onRegistrationSuccess = { token ->
                            viewModel.login(token)
                        },
                        onNavigateToGuidelineFaq = {
                            navController.navigate("guideline_faq")
                        },
                        onNavigateToPrivacyPolicy = {
                            navController.navigate("privacy_policy")
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
            val reportsList by viewModel.reportsList.collectAsStateWithLifecycle()
            val userProfile by viewModel.userProfile.collectAsStateWithLifecycle()
            val reportStats by viewModel.reportStats.collectAsStateWithLifecycle()
            val violationsList by viewModel.violationsList.collectAsStateWithLifecycle()
            NavHost(
                navController = navController,
                startDestination = "dashboard",
                enterTransition = { slideInHorizontally(initialOffsetX = { it }) + fadeIn(animationSpec = tween(300)) },
                exitTransition = { slideOutHorizontally(targetOffsetX = { -it }) + fadeOut(animationSpec = tween(300)) },
                popEnterTransition = { slideInHorizontally(initialOffsetX = { -it }) + fadeIn(animationSpec = tween(300)) },
                popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) + fadeOut(animationSpec = tween(300)) }
            ) {
                composable("dashboard") {
                    DashboardScreen(
                        navController = navController,
                        reportsList = reportsList,
                        userProfile = userProfile,
                        reportStats = reportStats,
                        violationsList = violationsList,
                        onReportSubmit = { vId, mPath, lName, lat, lon, vNum, msg, onResult -> 
                            viewModel.submitReport(vId, mPath, lName, lat, lon, vNum, msg, onResult)
                        },
                        onLogout = { viewModel.logout() },
                        onNavigateToFaq = { navController.navigate("guideline_faq") },
                        onFeedbackSubmit = { category, message, imageUrl, onResult -> 
                            viewModel.submitFeedback(category, message, imageUrl = imageUrl, onResult = onResult)
                        }
                    )
                }
                composable("report") {
                    ReportScreen(
                        navController = navController,
                        reportsList = reportsList,
                        userProfile = userProfile,
                        onRefresh = { viewModel.refreshReports() },
                        onLogout = { viewModel.logout() },
                        onNavigateToFaq = { navController.navigate("guideline_faq") },
                        onFeedbackSubmit = { category, message, imageUrl, onResult -> 
                            viewModel.submitFeedback(category, message, imageUrl = imageUrl, onResult = onResult)
                        }
                    )
                }
                composable("profile") {
                    val reportStats by viewModel.reportStats.collectAsStateWithLifecycle()
                    ProfileScreen(
                        navController = navController,
                        reportsList = reportsList,
                        userProfile = userProfile,
                        reportStats = reportStats,
                        onLogout = { viewModel.logout() },
                        onNavigateToFaq = { navController.navigate("guideline_faq") },
                        onUpdateProfile = { name, email, username, onResult ->
                            viewModel.updateProfile(name, email, username, onResult)
                        },
                        onFeedbackSubmit = { category, message, imageUrl, onResult -> 
                            viewModel.submitFeedback(category, message, imageUrl = imageUrl, onResult = onResult)
                        }
                    )
                }
                composable("violations") {
                    val violationsList by viewModel.violationsList.collectAsStateWithLifecycle()
                    ViolationsScreen(
                        navController = navController,
                        userProfile = userProfile,
                        violationsList = violationsList,
                        onRefresh = { viewModel.refreshViolations() },
                        onLogout = { viewModel.logout() },
                        onNavigateToFaq = { navController.navigate("guideline_faq") },
                        onFeedbackSubmit = { category, message, imageUrl, onResult -> 
                            viewModel.submitFeedback(category, message, imageUrl = imageUrl, onResult = onResult)
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
                composable("report_detail/{reportId}") { backStackEntry ->
                    val reportId = backStackEntry.arguments?.getString("reportId") ?: ""
                    val report = reportsList.find { it.id.toString() == reportId }
                    if (report != null) {
                        ReportDetailScreen(
                            report = report,
                            onBack = { navController.popBackStack() }
                        )
                    } else {
                        androidx.compose.runtime.LaunchedEffect(Unit) {
                            navController.popBackStack()
                        }
                    }
                }
            }
        }
    }
}
