package com.axomprahari.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.axomprahari.ui.theme.*
import androidx.navigation.NavController
import com.axomprahari.data.remote.dto.CitizenReportDto
import androidx.compose.ui.res.stringResource
import com.axomprahari.R





@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    reportsList: List<CitizenReportDto>,
    userProfile: com.axomprahari.data.remote.dto.UserProfile?,
    reportStats: com.axomprahari.data.remote.dto.ReportStats?,
    violationsList: List<com.axomprahari.data.remote.dto.ViolationDto>,
    onReportSubmit: (Int, String, String, Double, Double, String, String?, (Result<String>) -> Unit) -> Unit,
    onLogout: () -> Unit,
    onNavigateToFaq: () -> Unit = {},
    onFeedbackSubmit: (String, String, String?, (Result<String>) -> Unit) -> Unit
) {
    val context = LocalContext.current
    val isDark = isSystemInDarkTheme()
    val scope = rememberCoroutineScope()
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    var showFeedbackPage by remember { mutableStateOf(false) }

    var isReportingOffence by remember { mutableStateOf(false) }



    AppDrawer(
        drawerState = drawerState,
        navController = navController,
        currentRoute = "dashboard",
        userProfile = userProfile,
        onLogout = onLogout,
        onNavigateToFaq = onNavigateToFaq,
        onSendFeedbackClick = { showFeedbackPage = true }
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Scaffold(
                topBar = {
                    CenterAlignedTopAppBar(
                        title = {
                            Text(
                                text = if (showFeedbackPage) stringResource(R.string.axom_prahari_title) else stringResource(R.string.axom_prahari_title),
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            )
                        },
                        navigationIcon = {
                            val isReporting = isReportingOffence
                            val isFeedback = showFeedbackPage
                            val showBack = isReporting || isFeedback
                            IconButton(onClick = {
                                if (isReporting) {
                                    isReportingOffence = false
                                } else if (isFeedback) {
                                    showFeedbackPage = false
                                } else {
                                    scope.launch { drawerState.open() }
                                }
                            }) {
                                Icon(
                                    imageVector = if (showBack) Icons.AutoMirrored.Filled.ArrowBack else Icons.Default.Menu,
                                    contentDescription = if (showBack) stringResource(R.string.go_back_desc) else stringResource(R.string.open_nav_drawer_desc),
                                    tint = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        },
                        colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                },
                bottomBar = {
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.surface,
                        tonalElevation = 8.dp
                    ) {
                        NavigationBarItem(
                            selected = true,
                            onClick = {
                                isReportingOffence = false
                            },
                            icon = { Icon(Icons.Default.Dashboard, contentDescription = stringResource(R.string.nav_dashboard)) },
                            label = { Text(stringResource(R.string.nav_dashboard), fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary,
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                            )
                        )
                        NavigationBarItem(
                            selected = false,
                            onClick = {
                                navController.navigate("report") {
                                    popUpTo("dashboard") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(Icons.AutoMirrored.Filled.Assignment, contentDescription = stringResource(R.string.nav_reports)) },
                            label = { Text(stringResource(R.string.nav_reports), fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary,
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                            )
                        )
                        NavigationBarItem(
                            selected = false,
                            onClick = {
                                navController.navigate("profile") {
                                    popUpTo("dashboard") { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(Icons.Default.AccountCircle, contentDescription = stringResource(R.string.nav_profile)) },
                            label = { Text(stringResource(R.string.nav_profile), fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = MaterialTheme.colorScheme.primary,
                                selectedTextColor = MaterialTheme.colorScheme.primary,
                                indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                            )
                        )
                    }
                },
                containerColor = MaterialTheme.colorScheme.background
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                ) {
                    // Main content (Dashboard/Report Offence)
                    if (isReportingOffence) {
                        BackHandler(enabled = true) {
                            isReportingOffence = false
                        }
                        ReportOffenceScreen(
                            violations = violationsList,
                            onReportSubmit = { vId, mPath, lName, lat, lon, vNum, msg, onResult ->
                                onReportSubmit(vId, mPath, lName, lat, lon, vNum, msg) { result ->
                                    if (result.isSuccess) {
                                        isReportingOffence = false
                                    }
                                    onResult(result)
                                }
                            },
                            onCancel = {
                                isReportingOffence = false
                            }
                        )
                    } else {
                        DashboardTab(
                            reportsList = reportsList,
                            userProfile = userProfile,
                            reportStats = reportStats,
                            onReportClick = { report ->
                                navController.navigate("report_detail/${report.id}")
                            },
                            onReportSpotClick = {
                                isReportingOffence = true
                            }
                        )
                    }

                    // Feedback Page Overlay (Inside Scaffold)
                    AnimatedVisibility(
                        visible = showFeedbackPage,
                        enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
                        exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
                    ) {
                        BackHandler(enabled = showFeedbackPage) {
                            showFeedbackPage = false
                        }
                        FeedbackScreen(
                            onSubmit = { category, message, imageUri, onResult ->
                                onFeedbackSubmit(category, message, imageUri?.toString()) { result ->
                                    if (result.isSuccess) {
                                        showFeedbackPage = false
                                        Toast.makeText(context, context.getString(R.string.feedback_submitted_success), Toast.LENGTH_SHORT).show()
                                    } else {
                                        Toast.makeText(context, result.exceptionOrNull()?.message ?: "Error", Toast.LENGTH_SHORT).show()
                                    }
                                    onResult(result)
                                }
                            }
                        )
                    }
                }
            }


        }
    }
}

// ==========================================
// 1. Dashboard Tab Content Composable
// ==========================================
@Composable
fun DashboardTab(
    reportsList: List<CitizenReportDto>,
    userProfile: com.axomprahari.data.remote.dto.UserProfile?,
    reportStats: com.axomprahari.data.remote.dto.ReportStats?,
    onReportClick: (CitizenReportDto) -> Unit,
    onReportSpotClick: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val scrollState = rememberScrollState()
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Stats Card (simplified gradient card)
        UserStatsCard(userProfile = userProfile, reportStats = reportStats)

        // Report Offence Card (large white/surface card with red camera icon, NO LIVE badge)
        Card(
            onClick = onReportSpotClick,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = androidx.compose.foundation.BorderStroke(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Red camera shutter container (WITHOUT the LIVE badge)
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.size(110.dp)
                ) {
                    // Main red circle
                    Box(
                        modifier = Modifier
                            .size(92.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.error),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lens,
                            contentDescription = stringResource(R.string.camera_lens_desc),
                            tint = Color.White.copy(alpha = 0.3f),
                            modifier = Modifier.size(60.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.PhotoCamera,
                            contentDescription = stringResource(R.string.camera_shutter_desc),
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = stringResource(R.string.report_offence_title),
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = stringResource(R.string.report_offence_subtitle),
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    ),
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
            }
        }

        // Two stats grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Reward Points Card
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = stringResource(R.string.points_desc),
                            tint = MaterialTheme.colorScheme.onPrimaryContainer,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = userProfile?.rewardPoints?.toString() ?: "0",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = stringResource(R.string.reward_points_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }

            // Pending Reports Card
            Card(
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f)),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.errorContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Assignment,
                            contentDescription = stringResource(R.string.pending_reports_desc),
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = reportStats?.pending?.toString() ?: "0",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = stringResource(R.string.pending_reports_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
        }

        // Recent Activity Title & List
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.recent_submissions_title),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                )
                Icon(
                    imageVector = Icons.Default.History,
                    contentDescription = stringResource(R.string.history_desc),
                    tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f)
                )
            }

            // Display top 2 reports on Dashboard without nested LazyColumn
            val recentReports = reportsList.take(2)
            if (recentReports.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = stringResource(R.string.no_submissions_text),
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                        )
                    )
                }
            } else {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    recentReports.forEach { report ->
                        Card(
                            onClick = { onReportClick(report) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = androidx.compose.foundation.BorderStroke(
                                width = 1.dp,
                                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                            )
                        ) {
                            Box(modifier = Modifier.padding(8.dp)) {
                                ReportItemCardContent(report = report)
                            }
                        }
                    }
                }
            }
        }
    }
}

// Tab contents moved to separate ReportScreen.kt and ProfileScreen.kt files


// Inner helper content to show report items cleanly
@Composable
fun ReportItemCardContent(report: CitizenReportDto) {
    val isDark = isSystemInDarkTheme()
    val statusColor = if (isDark) {
        when (report.status) {
            "accepted" -> MaterialTheme.colorScheme.primaryContainer
            "pending" -> MaterialTheme.colorScheme.secondaryContainer
            "rejected" -> MaterialTheme.colorScheme.errorContainer
            else -> MaterialTheme.colorScheme.secondaryContainer
        }
    } else {
        when (report.status) {
            "accepted" -> MaterialTheme.colorScheme.primaryContainer
            "pending" -> MaterialTheme.colorScheme.secondaryContainer
            "rejected" -> MaterialTheme.colorScheme.errorContainer
            else -> MaterialTheme.colorScheme.secondaryContainer
        }
    }

    val statusTextColor = if (isDark) {
        when (report.status) {
            "accepted" -> MaterialTheme.colorScheme.onPrimaryContainer
            "pending" -> MaterialTheme.colorScheme.onSecondaryContainer
            "rejected" -> MaterialTheme.colorScheme.onErrorContainer
            else -> MaterialTheme.colorScheme.onSecondaryContainer
        }
    } else {
        when (report.status) {
            "accepted" -> MaterialTheme.colorScheme.onPrimaryContainer
            "pending" -> MaterialTheme.colorScheme.onSecondaryContainer
            "rejected" -> MaterialTheme.colorScheme.onErrorContainer
            else -> MaterialTheme.colorScheme.onSecondaryContainer
        }
    }

    val statusText = when (report.status) {
        "accepted" -> stringResource(R.string.status_verified)
        "pending" -> stringResource(R.string.status_pending)
        "rejected" -> stringResource(R.string.status_rejected)
        else -> stringResource(R.string.status_unknown)
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = when (report.offenceName) {
                    "No Helmet" -> Icons.Default.Warning
                    "Triple Riding" -> Icons.Default.Info
                    else -> Icons.Default.Warning
                },
                contentDescription = stringResource(R.string.violation_icon_desc),
                tint = MaterialTheme.colorScheme.primary
            )
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = report.offenceName ?: stringResource(R.string.unknown_offence_text),
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusColor)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = statusTextColor,
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = report.locationName ?: stringResource(R.string.unknown_location_text),
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                ),
                maxLines = 1
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${report.incidentDate ?: ""} ${report.incidentTime ?: ""}".trim(),
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                        fontSize = 12.sp
                    )
                )
            }
        }
    }
}

@Composable
fun UserStatsCard(
    userProfile: com.axomprahari.data.remote.dto.UserProfile?,
    reportStats: com.axomprahari.data.remote.dto.ReportStats?
) {
    val isDark = isSystemInDarkTheme()

    // Card colours: dark slate in both modes (looks premium on light & dark)
    val cardBg = if (isDark) Color(0xFF0F1C1B) else Color(0xFF0D1F1E)
    val accentGreen = MaterialTheme.colorScheme.secondary
    val subtleWhite = Color.White.copy(alpha = 0.55f)
    val dividerColor = Color.White.copy(alpha = 0.08f)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(MaterialTheme.colorScheme.primary, MaterialTheme.colorScheme.primaryContainer)
                )
            )
            .padding(horizontal = 22.dp, vertical = 20.dp)
    ) {
        // Subtle decorative circle top-right
        Box(
            modifier = Modifier
                .size(100.dp)
                .offset(x = 30.dp, y = (-30).dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            MaterialTheme.colorScheme.secondary.copy(alpha = 0.12f),
                            Color.Transparent
                        )
                    ),
                    shape = CircleShape
                )
                .align(Alignment.TopEnd)
        )

        Column {
            // ── Welcome row ──
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.welcome_back_text),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = subtleWhite,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 0.3.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = userProfile?.fullName ?: stringResource(R.string.guest_name_text),
                        style = MaterialTheme.typography.titleLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = (-0.3).sp
                        )
                    )
                }

                // User ID pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50.dp))
                        .background(Color.White.copy(alpha = 0.07f))
                        .border(
                            width = 1.dp,
                            color = accentGreen.copy(alpha = 0.3f),
                            shape = RoundedCornerShape(50.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = userProfile?.citizenId ?: "APC-XXXXXX",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = accentGreen,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp,
                            fontSize = 10.sp
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))
            HorizontalDivider(color = dividerColor, thickness = 1.dp)
            Spacer(modifier = Modifier.height(16.dp))

            // ── Stats row ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(0.dp)
            ) {
                StatPill(
                    label = stringResource(R.string.stat_reports_label),
                    value = reportStats?.total?.toString() ?: "0",
                    accentColor = accentGreen,
                    modifier = Modifier.weight(1f)
                )
                // Vertical separator
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(40.dp)
                        .background(dividerColor)
                        .align(Alignment.CenterVertically)
                )
                StatPill(
                    label = stringResource(R.string.stat_verified_label),
                    value = reportStats?.accepted?.toString() ?: "0",
                    accentColor = accentGreen,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(40.dp)
                        .background(dividerColor)
                        .align(Alignment.CenterVertically)
                )
                StatPill(
                    label = stringResource(R.string.stat_rejected_label),
                    value = reportStats?.rejected?.toString() ?: "0",
                    accentColor = MaterialTheme.colorScheme.error,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
fun StatPill(
    label: String,
    value: String,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(horizontal = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium.copy(
                color = Color.White,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = (-0.5).sp
            )
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(
                color = Color.White.copy(alpha = 0.4f),
                fontWeight = FontWeight.Bold,
                fontSize = 9.sp,
                letterSpacing = 0.6.sp
            )
        )
    }
}



