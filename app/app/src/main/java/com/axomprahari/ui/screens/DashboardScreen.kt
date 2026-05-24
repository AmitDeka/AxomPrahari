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

data class TrafficReport(
    val id: String,
    val type: String,
    val location: String,
    val timestamp: String,
    val points: Int,
    val status: ReportStatus
)

enum class ReportStatus {
    VERIFIED,
    UNDER_REVIEW,
    REJECTED
}

@Composable
fun DrawerMenuItem(
    icon: ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val containerColor = if (isSelected) {
        if (isDark) MaterialTheme.colorScheme.primaryContainer else Color(0xFFE2F9F3)
    } else {
        Color.Transparent
    }
    
    val contentColor = if (isSelected) {
        if (isDark) MaterialTheme.colorScheme.onPrimaryContainer else Color(0xFF006A66)
    } else {
        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(containerColor)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = contentColor,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = contentColor
            )
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogout: () -> Unit,
    onNavigateToFaq: () -> Unit = {}
) {
    val context = LocalContext.current
    val isDark = isSystemInDarkTheme()
    val scope = rememberCoroutineScope()
    
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    var showFeedbackPage by remember { mutableStateOf(false) }

    // 1. Unified State for Citizen Reports
    var reportsList by remember {
        mutableStateOf(
            listOf(
                TrafficReport("1", "No Helmet", "G.S. Road, Near Christian Basti, Guwahati", "Today, 09:30 AM", 100, ReportStatus.VERIFIED),
                TrafficReport("2", "Triple Riding", "Jorhat Bypass, Jorhat", "Yesterday, 04:15 PM", 150, ReportStatus.VERIFIED),
                TrafficReport("3", "Wrong Side Driving", "AT Road, Dibrugarh", "2 days ago, 11:45 AM", 200, ReportStatus.UNDER_REVIEW),
                TrafficReport("4", "Red Light Jump", "Six Mile Intersection, Guwahati", "3 days ago, 08:10 PM", 0, ReportStatus.REJECTED)
            )
        )
    }

    // Tab state (0: Dashboard, 1: Reports, 2: Profile, 3: Violations)
    var selectedTab by remember { mutableStateOf(0) }
    var isReportingOffence by remember { mutableStateOf(false) }

    // Navigation and workflow overlays
    var showCamera by remember { mutableStateOf(false) }
    var showSubmitFlow by remember { mutableStateOf(false) }
    var showSubmittingProgress by remember { mutableStateOf(false) }
    var showSuccessScreen by remember { mutableStateOf(false) }
    var selectedReport by remember { mutableStateOf<TrafficReport?>(null) }

    // Violation report inputs
    var selectedViolationType by remember { mutableStateOf("No Helmet") }
    var inputLocation by remember { mutableStateOf("G.S. Road, Guwahati") }
    var inputDescription by remember { mutableStateOf("") }

    // Permission tracking
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (isGranted) {
            showCamera = true
        } else {
            Toast.makeText(context, "Camera permission is required to spot violations", Toast.LENGTH_LONG).show()
        }
    }



    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                drawerContainerColor = MaterialTheme.colorScheme.surface,
                drawerShape = RoundedCornerShape(topEnd = 24.dp, bottomEnd = 24.dp),
                modifier = Modifier.width(320.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp)
                ) {
                    // Header
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = "Profile Photo",
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Rahul Sharma",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .size(16.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.primary),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Verified",
                                        tint = MaterialTheme.colorScheme.onPrimary,
                                        modifier = Modifier.size(10.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(4.dp))
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                  Text(
                                    text = "XAZAG NAGARIK",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = MaterialTheme.colorScheme.primary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 9.sp
                                    )
                                  )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Citizen ID Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "VERIFIED CITIZEN ID",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    )
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "APc-12u321",
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.Fingerprint,
                                contentDescription = "Fingerprint",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Total Rewards Counter Card
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = "Rewards",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "450 Reward Points",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Menu items
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        DrawerMenuItem(
                            icon = Icons.Default.Dashboard,
                            label = "Dashboard",
                            isSelected = selectedTab == 0,
                            onClick = {
                                selectedTab = 0
                                isReportingOffence = false
                                scope.launch { drawerState.close() }
                            }
                        )
                        DrawerMenuItem(
                            icon = Icons.Default.Traffic,
                            label = "Traffic Violations",
                            isSelected = selectedTab == 3,
                            onClick = {
                                selectedTab = 3
                                isReportingOffence = false
                                scope.launch { drawerState.close() }
                            }
                        )
                        DrawerMenuItem(
                            icon = Icons.Default.Person,
                            label = "Account",
                            isSelected = selectedTab == 2,
                            onClick = {
                                selectedTab = 2
                                isReportingOffence = false
                                scope.launch { drawerState.close() }
                            }
                        )
                        DrawerMenuItem(
                            icon = Icons.AutoMirrored.Filled.Help,
                            label = "FAQ",
                            isSelected = false,
                            onClick = {
                                scope.launch { drawerState.close() }
                                onNavigateToFaq()
                            }
                        )
                        DrawerMenuItem(
                            icon = Icons.Default.Feedback,
                            label = "Send Feedback",
                            isSelected = false,
                            onClick = {
                                scope.launch { drawerState.close() }
                                showFeedbackPage = true
                            }
                        )
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f))
                    Spacer(modifier = Modifier.height(16.dp))

                    // Footer
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                scope.launch { drawerState.close() }
                                onLogout()
                            }
                            .padding(vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Logout",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = "Logout",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = MaterialTheme.colorScheme.error,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "v1.0.0",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                        ),
                        modifier = Modifier.align(Alignment.Start)
                    )
                }
            }
        }
    ) {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            text = if (showFeedbackPage) "Xazag Axom" else "Axom Prahari",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = if (isSystemInDarkTheme()) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36)
                            )
                        )
                    },
                    navigationIcon = {
                        val isReporting = isReportingOffence && selectedTab == 0
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
                                contentDescription = if (showBack) "Go back" else "Open navigation drawer",
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
                        selected = selectedTab == 0,
                        onClick = {
                            selectedTab = 0
                            isReportingOffence = false
                        },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = "Dashboard") },
                        label = { Text("Dashboard", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Icon(Icons.AutoMirrored.Filled.Assignment, contentDescription = "Reports") },
                        label = { Text("Reports", fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Icon(Icons.Default.AccountCircle, contentDescription = "Profile") },
                        label = { Text("Profile", fontSize = 11.sp) },
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
            // Main Tab Host
            Crossfade(targetState = selectedTab, label = "Tab Transition") { tab ->
                when (tab) {
                    0 -> {
                        if (isReportingOffence) {
                            ReportOffenceScreen(
                                reportsList = reportsList,
                                onReportSubmitted = { newReport ->
                                    reportsList = listOf(newReport) + reportsList
                                    isReportingOffence = false
                                },
                                onCancel = {
                                    isReportingOffence = false
                                }
                            )
                        } else {
                            DashboardTab(
                                reportsList = reportsList,
                                onReportClick = { selectedReport = it },
                                onReportSpotClick = {
                                    isReportingOffence = true
                                }
                            )
                        }
                    }
                    1 -> ReportsTab(
                        reportsList = reportsList,
                        onReportClick = { selectedReport = it }
                    )
                    2 -> ProfileTab(
                        onLogout = onLogout
                    )
                    3 -> ViolationsTab()
                }
            }

            // Fullscreen CameraX Overlay
            AnimatedVisibility(
                visible = showCamera,
                enter = slideInVertically(initialOffsetY = { it }) + fadeIn(),
                exit = slideOutVertically(targetOffsetY = { it }) + fadeOut()
            ) {
                CameraView(
                    onPhotoCaptured = {
                        showCamera = false
                        showSubmitFlow = true
                    },
                    onClose = {
                        showCamera = false
                    }
                )
            }

            // Submit Violation Sheet Overlay
            AnimatedVisibility(
                visible = showSubmitFlow,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.6f))
                        .clickable { /* block interaction */ },
                    contentAlignment = Alignment.BottomCenter
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp)
                        ) {
                            Text(
                                text = "Submit Violation Report",
                                style = MaterialTheme.typography.headlineSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Provide details for verification process.",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            )
                            Spacer(modifier = Modifier.height(20.dp))

                            // Violation Type Chips
                            Text(
                                text = "Violation Type",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                val types = listOf("No Helmet", "Triple Riding", "Wrong Side")
                                types.forEach { type ->
                                    val isSelected = selectedViolationType == type
                                    FilterChip(
                                        selected = isSelected,
                                        onClick = { selectedViolationType = type },
                                        label = { Text(type) },
                                        shape = RoundedCornerShape(20.dp),
                                        colors = FilterChipDefaults.filterChipColors(
                                            selectedContainerColor = MaterialTheme.colorScheme.primary,
                                            selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                                        )
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Location TextField
                            OutlinedTextField(
                                value = inputLocation,
                                onValueChange = { inputLocation = it },
                                label = { Text("Violation Location") },
                                leadingIcon = {
                                    Icon(Icons.Default.LocationOn, contentDescription = "Location")
                                },
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth()
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            // Description (Optional)
                            OutlinedTextField(
                                value = inputDescription,
                                onValueChange = { inputDescription = it },
                                label = { Text("Additional Description (Optional)") },
                                placeholder = { Text("e.g. Red SUV ignored light...") },
                                shape = RoundedCornerShape(10.dp),
                                modifier = Modifier.fillMaxWidth(),
                                maxLines = 3
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            // CTA Buttons
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                OutlinedButton(
                                    onClick = { showSubmitFlow = false },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("Discard")
                                }

                                Button(
                                    onClick = {
                                        showSubmitFlow = false
                                        showSubmittingProgress = true
                                        scope.launch {
                                            delay(1800) // Simulating network upload
                                            showSubmittingProgress = false
                                            showSuccessScreen = true
                                        }
                                    },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(48.dp),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Text("Submit Report")
                                }
                            }
                        }
                    }
                }
            }

            // Submitting Dialog Overlay
            if (showSubmittingProgress) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.7f)),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        modifier = Modifier.padding(32.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(20.dp))
                            Text(
                                text = "Submitting Report",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Uploading image and location coordinates to Assam Police base station...",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                                    textAlign = TextAlign.Center
                                )
                            )
                        }
                    }
                }
            }

            // Success Overlay
            AnimatedVisibility(
                visible = showSuccessScreen,
                enter = fadeIn() + scaleIn(),
                exit = fadeOut()
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(MaterialTheme.colorScheme.background),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(120.dp)
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.08f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = "Success",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(80.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(28.dp))

                        Text(
                            text = "Report Received!",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = "Thank you for performing your sentinel duty. Once verified, you will receive points and help Assam Traffic secure order.",
                            style = MaterialTheme.typography.bodyLarge.copy(
                                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                                textAlign = TextAlign.Center,
                                lineHeight = 24.sp
                            ),
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )

                        Spacer(modifier = Modifier.height(40.dp))

                        Button(
                            onClick = {
                                // Add new report to list state
                                val newReport = TrafficReport(
                                    id = (reportsList.size + 1).toString(),
                                    type = selectedViolationType,
                                    location = inputLocation,
                                    timestamp = "Just Now",
                                    points = 100,
                                    status = ReportStatus.UNDER_REVIEW
                                )
                                reportsList = listOf(newReport) + reportsList
                                showSuccessScreen = false
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text(
                                text = "Done",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                        }
                    }
                }
            }

            // Report Details Fullscreen Overlay
            AnimatedVisibility(
                visible = selectedReport != null,
                enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
                exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
            ) {
                selectedReport?.let { report ->
                    ReportDetailScreen(
                        report = report,
                        onBack = { selectedReport = null }
                    )
                }
            }

            // Feedback Page Fullscreen Overlay
            AnimatedVisibility(
                visible = showFeedbackPage,
                enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
                exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
            ) {
                FeedbackScreen(
                    onSubmit = { category, message ->
                        showFeedbackPage = false
                        Toast.makeText(context, "Feedback submitted successfully!", Toast.LENGTH_SHORT).show()
                    }
                )
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
    reportsList: List<TrafficReport>,
    onReportClick: (TrafficReport) -> Unit,
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
        SentinelStatsCard()

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
                            .background(Color(0xFFB01A1A)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Lens,
                            contentDescription = "Camera Lens",
                            tint = Color.White.copy(alpha = 0.3f),
                            modifier = Modifier.size(60.dp)
                        )
                        Icon(
                            imageVector = Icons.Default.PhotoCamera,
                            contentDescription = "Camera Shutter",
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Report Offence",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Capture real-time evidence for immediate civic intervention.",
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
                            .background(if (isDark) MaterialTheme.colorScheme.primaryContainer else Color(0xFFE2F9F3)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Points",
                            tint = if (isDark) MaterialTheme.colorScheme.onPrimaryContainer else Color(0xFF006A66),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "450",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "REWARD POINTS",
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
                            .background(if (isDark) MaterialTheme.colorScheme.errorContainer else Color(0xFFFFECE9)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.Assignment,
                            contentDescription = "Pending Reports",
                            tint = if (isDark) MaterialTheme.colorScheme.onErrorContainer else Color(0xFFDC2626),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "2",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "PENDING REPORTS",
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
                    text = "Recent Submissions",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                )
                Icon(
                    imageVector = Icons.Default.History,
                    contentDescription = "History",
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
                        text = "No submissions yet. Start reporting!",
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

// ==========================================
// 2. Reports Tab Content Composable
// ==========================================
@Composable
fun ReportsTab(
    reportsList: List<TrafficReport>,
    onReportClick: (TrafficReport) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedFilter by remember { mutableStateOf("All") } // "All", "Verified", "Reviewing", "Rejected"

    val filteredReports = remember(reportsList, searchQuery, selectedFilter) {
        reportsList.filter { report ->
            // Search filter
            val matchesSearch = report.type.contains(searchQuery, ignoreCase = true) ||
                    report.location.contains(searchQuery, ignoreCase = true)

            // Status filter
            val matchesFilter = when (selectedFilter) {
                "Verified" -> report.status == ReportStatus.VERIFIED
                "Reviewing" -> report.status == ReportStatus.UNDER_REVIEW
                "Rejected" -> report.status == ReportStatus.REJECTED
                else -> true
            }

            matchesSearch && matchesFilter
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search by type or location...") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Filter chips row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val filters = listOf("All", "Verified", "Reviewing", "Rejected")
            filters.forEach { filter ->
                val isSelected = selectedFilter == filter
                FilterChip(
                    selected = isSelected,
                    onClick = { selectedFilter = filter },
                    label = { Text(filter) },
                    shape = RoundedCornerShape(20.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = MaterialTheme.colorScheme.primary,
                        selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Filtered List
        if (filteredReports.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No matching reports found.",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f),
                        textAlign = TextAlign.Center
                    )
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 24.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(filteredReports, key = { it.id }) { report ->
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

// ==========================================
// 3. Profile Tab Content Composable
// ==========================================
@Composable
fun ProfileTab(
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    var fullName by remember { mutableStateOf("Amit Deka") }
    var email by remember { mutableStateOf("amit.deka@axomprahari.org") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        // Digital Citizen ID Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color.Transparent)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF1E293B), // Slate Dark
                                Color(0xFF0F172A)  // Slate Darker
                            )
                        )
                    )
                    .padding(24.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "ASSAM TRAFFIC SENTINEL",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = Color(0xFFFFD700), // Gold
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.5.sp
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "CITIZEN ID CARD",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = Color.White.copy(alpha = 0.5f),
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Sentinel Logo",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(36.dp))

                    Text(
                        text = fullName,
                        style = MaterialTheme.typography.titleLarge.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "ID: APC-8K9A2M",
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = Color.White.copy(alpha = 0.8f),
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "Joined: May 2026",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color.White.copy(alpha = 0.5f)
                            )
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Edit Profile Form
        Text(
            text = "Edit Profile Details",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            modifier = Modifier.padding(bottom = 12.dp)
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = androidx.compose.foundation.BorderStroke(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
            )
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("Full Name") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = "Name") },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email Address") },
                    leadingIcon = { Icon(Icons.Default.Email, contentDescription = "Email") },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        Toast.makeText(context, "Profile details updated locally", Toast.LENGTH_SHORT).show()
                    },
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    Text("Save Changes", fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Danger Zone
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = androidx.compose.foundation.BorderStroke(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Button(
                    onClick = onLogout,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    Text(
                        text = "Sign Out",
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// Inner helper content to show report items cleanly
@Composable
fun ReportItemCardContent(report: TrafficReport) {
    val isDark = isSystemInDarkTheme()
    val statusColor = if (isDark) {
        when (report.status) {
            ReportStatus.VERIFIED -> Color(0xFF003724)
            ReportStatus.UNDER_REVIEW -> Color(0xFF3E2D00)
            ReportStatus.REJECTED -> Color(0xFF3F0006)
        }
    } else {
        when (report.status) {
            ReportStatus.VERIFIED -> Color(0xFFE2F9F3)
            ReportStatus.UNDER_REVIEW -> Color(0xFFFFF7E6)
            ReportStatus.REJECTED -> Color(0xFFFFECE9)
        }
    }

    val statusTextColor = if (isDark) {
        when (report.status) {
            ReportStatus.VERIFIED -> Color(0xFF5DF2B8)
            ReportStatus.UNDER_REVIEW -> Color(0xFFFFC043)
            ReportStatus.REJECTED -> Color(0xFFFF898F)
        }
    } else {
        when (report.status) {
            ReportStatus.VERIFIED -> Color(0xFF00875A)
            ReportStatus.UNDER_REVIEW -> Color(0xFFD97706)
            ReportStatus.REJECTED -> Color(0xFFDC2626)
        }
    }

    val statusText = when (report.status) {
        ReportStatus.VERIFIED -> "Verified"
        ReportStatus.UNDER_REVIEW -> "Reviewing"
        ReportStatus.REJECTED -> "Rejected"
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
                imageVector = when (report.type) {
                    "No Helmet" -> Icons.Default.Warning
                    "Triple Riding" -> Icons.Default.Info
                    else -> Icons.Default.Warning
                },
                contentDescription = "Violation Icon",
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
                    text = report.type,
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
                text = report.location,
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
                    text = report.timestamp,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                        fontSize = 12.sp
                    )
                )

                if (report.points > 0) {
                    Text(
                        text = "+${report.points} XP",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }
}

@Composable
fun SentinelStatsCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF00504C), // Deep Teal
                            Color(0xFF007A75)  // Mid Teal
                        )
                    )
                )
                .padding(24.dp)
        ) {
            Column {
                Text(
                    text = "Amit Deka",
                    style = MaterialTheme.typography.titleLarge.copy(
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Stats boxes
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    StatBox(label = "Reports", value = "15")
                    StatBox(label = "Verified", value = "12")
                    StatBox(label = "Accuracy", value = "92%")
                }
            }
        }
    }
}

@Composable
fun StatBox(label: String, value: String) {
    Column {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.6f))
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge.copy(
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        )
    }
}

@Composable
fun CameraView(
    onPhotoCaptured: () -> Unit,
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    var imageCapture: ImageCapture? by remember { mutableStateOf(null) }

    Box(modifier = Modifier.fillMaxSize()) {
        AndroidView(
            factory = { ctx ->
                PreviewView(ctx).apply {
                    scaleType = PreviewView.ScaleType.FILL_CENTER
                }
            },
            modifier = Modifier.fillMaxSize(),
            update = { previewView ->
                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }

                    val imageCaptureSetup = ImageCapture.Builder()
                        .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                        .build()
                    imageCapture = imageCaptureSetup

                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

                    try {
                        cameraProvider.unbindAll()
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            cameraSelector,
                            preview,
                            imageCaptureSetup
                        )
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }, ContextCompat.getMainExecutor(context))
            }
        )

        // Camera controls overlays
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
        ) {
            // Close Button
            IconButton(
                onClick = onClose,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .background(Color.Black.copy(alpha = 0.4f), CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.Close,
                    contentDescription = "Close Camera",
                    tint = Color.White
                )
            }

            // Capture button at the bottom center
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 32.dp)
                    .size(80.dp)
                    .background(Color.White.copy(alpha = 0.2f), CircleShape)
                    .border(4.dp, Color.White, CircleShape)
                    .clickable {
                        // Capture picture! Simulates capturing successfully
                        onPhotoCaptured()
                    },
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .background(Color.White, CircleShape)
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportOffenceScreen(
    reportsList: List<TrafficReport>,
    onReportSubmitted: (TrafficReport) -> Unit,
    onCancel: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    var selectedOffence by remember { mutableStateOf("No Helmet") }
    var vehicleNumber by remember { mutableStateOf("") }
    var isDropdownExpanded by remember { mutableStateOf(false) }
    var flashEnabled by remember { mutableStateOf(false) }
    var gridEnabled by remember { mutableStateOf(true) }

    val offenceTypes = listOf(
        "No Helmet",
        "Triple Riding",
        "Wrong Side Driving",
        "Red Light Jump",
        "Speeding",
        "Illegal Parking"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0B1210))
    ) {
        // Top Section: Viewfinder Mockup (night street view)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1.2f)
                .clip(RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp))
                .background(Color(0xFF0F1715))
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height

                val roadColor = Color(0xFF1E2925)
                
                // Draw sky/horizon gradient
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(Color(0xFF0A0F0D), Color(0xFF131D1A)),
                        startY = 0f,
                        endY = h
                    )
                )

                // Road perspective path
                val roadPath = androidx.compose.ui.graphics.Path().apply {
                    moveTo(w * 0.45f, h * 0.4f)
                    lineTo(w * 0.55f, h * 0.4f)
                    lineTo(w * 0.9f, h)
                    lineTo(w * 0.1f, h)
                    close()
                }
                drawPath(roadPath, color = roadColor)

                // Road dashed lane divider
                val dashPath = androidx.compose.ui.graphics.Path().apply {
                    moveTo(w * 0.5f, h * 0.4f)
                    lineTo(w * 0.5f, h)
                }
                drawPath(
                    path = dashPath,
                    color = Color(0xFFFACC15).copy(alpha = 0.6f),
                    style = Stroke(
                        width = 4f,
                        pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(
                            intervals = floatArrayOf(20f, 15f),
                            phase = 0f
                        )
                    )
                )

                // City light glows (night bokeh effect)
                drawCircle(
                    color = Color(0xFFEF4444).copy(alpha = 0.25f),
                    radius = 45f,
                    center = Offset(w * 0.35f, h * 0.65f)
                )
                drawCircle(
                    color = Color(0xFFFBBF24).copy(alpha = 0.2f),
                    radius = 35f,
                    center = Offset(w * 0.65f, h * 0.62f)
                )
                drawCircle(
                    color = Color(0xFF3B82F6).copy(alpha = 0.15f),
                    radius = 60f,
                    center = Offset(w * 0.8f, h * 0.45f)
                )
            }

            // Viewfinder Grid Overlay
            if (gridEnabled) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    drawLine(
                        color = Color.White.copy(alpha = 0.15f),
                        start = Offset(w / 3, 0f),
                        end = Offset(w / 3, h),
                        strokeWidth = 1.dp.toPx()
                    )
                    drawLine(
                        color = Color.White.copy(alpha = 0.15f),
                        start = Offset(w * 2 / 3, 0f),
                        end = Offset(w * 2 / 3, h),
                        strokeWidth = 1.dp.toPx()
                    )

                    drawLine(
                        color = Color.White.copy(alpha = 0.15f),
                        start = Offset(0f, h / 3),
                        end = Offset(w, h / 3),
                        strokeWidth = 1.dp.toPx()
                    )
                    drawLine(
                        color = Color.White.copy(alpha = 0.15f),
                        start = Offset(0f, h * 2 / 3),
                        end = Offset(w, h * 2 / 3),
                        strokeWidth = 1.dp.toPx()
                    )
                }
            }

            // Target Corner Brackets
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp)
            ) {
                val w = size.width
                val h = size.height
                val len = 24.dp.toPx()
                val thickness = 2.dp.toPx()
                val strokeColor = Color.White.copy(alpha = 0.7f)

                // Top-Left
                drawLine(strokeColor, Offset(0f, 0f), Offset(len, 0f), thickness)
                drawLine(strokeColor, Offset(0f, 0f), Offset(0f, len), thickness)

                // Top-Right
                drawLine(strokeColor, Offset(w, 0f), Offset(w - len, 0f), thickness)
                drawLine(strokeColor, Offset(w, 0f), Offset(w, len), thickness)

                // Bottom-Left
                drawLine(strokeColor, Offset(0f, h), Offset(len, h), thickness)
                drawLine(strokeColor, Offset(0f, h), Offset(0f, h - len), thickness)

                // Bottom-Right
                drawLine(strokeColor, Offset(w, h), Offset(w - len, h), thickness)
                drawLine(strokeColor, Offset(w, h), Offset(w, h - len), thickness)
            }

            // GPS pill top-left
            Box(
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(16.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Color.Black.copy(alpha = 0.6f))
                    .border(1.dp, Color(0xFF006A66).copy(alpha = 0.4f), RoundedCornerShape(50))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF10B981))
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "GPS LOCKED: 26.14°N, 91.73°E",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp
                        )
                    )
                }
            }

            // Controls toggles column
            Column(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                IconButton(
                    onClick = { flashEnabled = !flashEnabled },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(if (flashEnabled) Color(0xFFFACC15) else Color.Black.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = if (flashEnabled) Icons.Default.FlashOn else Icons.Default.FlashOff,
                        contentDescription = "Toggle Flash",
                        tint = if (flashEnabled) Color.Black else Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                IconButton(
                    onClick = { gridEnabled = !gridEnabled },
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(if (gridEnabled) Color(0xFF006A66) else Color.Black.copy(alpha = 0.5f))
                ) {
                    Icon(
                        imageVector = if (gridEnabled) Icons.Default.GridOn else Icons.Default.GridOff,
                        contentDescription = "Toggle Grid",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // Bottom Section: Details sheet card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Grab handle
                Box(
                    modifier = Modifier
                        .width(40.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f))
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Report Offence",
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Fill in the details below to log a traffic violation.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Violation type selection dropdown
                ExposedDropdownMenuBox(
                    expanded = isDropdownExpanded,
                    onExpandedChange = { isDropdownExpanded = !isDropdownExpanded },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedTextField(
                        value = selectedOffence,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("SELECT OFFENCE TYPE", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36),
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                            focusedLabelColor = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36)
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = isDropdownExpanded,
                        onDismissRequest = { isDropdownExpanded = false }
                    ) {
                        offenceTypes.forEach { selectionOption ->
                            DropdownMenuItem(
                                text = { Text(selectionOption) },
                                onClick = {
                                    selectedOffence = selectionOption
                                    isDropdownExpanded = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Vehicle Registration field
                OutlinedTextField(
                    value = vehicleNumber,
                    onValueChange = { vehicleNumber = it.uppercase() },
                    label = { Text("VEHICLE NUMBER", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    placeholder = { Text("e.g. AS-01-XX-1234") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = "Car Icon",
                            tint = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36)
                        )
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36),
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                        focusedLabelColor = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF0F3E36)
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Automatic location status card
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (isDark) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f) else Color(0xFFE2F9F3).copy(alpha = 0.5f)
                    ),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = if (isDark) MaterialTheme.colorScheme.primary.copy(alpha = 0.3f) else Color(0xFF006A66).copy(alpha = 0.15f)
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(if (isDark) MaterialTheme.colorScheme.primaryContainer else Color(0xFFE2F9F3)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Location Pin",
                                tint = if (isDark) MaterialTheme.colorScheme.onPrimaryContainer else Color(0xFF006A66),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "AUTOMATIC LOCATION LOGGING",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = if (isDark) MaterialTheme.colorScheme.primary else Color(0xFF006A66),
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp
                                )
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Assam State Transport Dept. (Guwahati North Zone)",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Submit report button
                Button(
                    onClick = {
                        val report = TrafficReport(
                            id = (reportsList.size + 1).toString(),
                            type = selectedOffence,
                            location = "G.S. Road, Guwahati North Zone",
                            timestamp = "Just Now",
                            points = 100,
                            status = ReportStatus.UNDER_REVIEW
                        )
                        onReportSubmitted(report)
                    },
                    enabled = vehicleNumber.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary,
                        disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                        disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Publish,
                            contentDescription = "Submit Icon",
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Submit Report",
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
        }
    }
}
