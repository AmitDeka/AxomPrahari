package com.axomprahari.ui.screens

import android.widget.Toast
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Assignment
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight

import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.axomprahari.data.remote.dto.CitizenReportDto
import com.axomprahari.data.model.ReportStatus
import com.axomprahari.data.remote.dto.UserProfile
import com.axomprahari.ui.theme.*
import kotlinx.coroutines.launch
import androidx.compose.ui.res.stringResource
import com.axomprahari.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navController: NavController,
    reportsList: List<CitizenReportDto>,
    userProfile: UserProfile?,
    reportStats: com.axomprahari.data.remote.dto.ReportStats?,
    onLogout: () -> Unit,
    onNavigateToFaq: () -> Unit = {},
    onUpdateProfile: (String, String, String, (Result<com.axomprahari.data.remote.dto.UserProfile>) -> Unit) -> Unit,
    onFeedbackSubmit: (String, String, String?, (Result<String>) -> Unit) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    var showFeedbackPage by remember { mutableStateOf(false) }

    AppDrawer(
        drawerState = drawerState,
        navController = navController,
        currentRoute = "profile",
        userProfile = userProfile,
        onLogout = onLogout,
        onNavigateToFaq = onNavigateToFaq,
        onSendFeedbackClick = { showFeedbackPage = true }
    ) {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            text = if (showFeedbackPage) stringResource(R.string.axom_prahari_title) else stringResource(R.string.profile_settings_title),
                            style = MaterialTheme.typography.titleLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        )
                    },
                    navigationIcon = {
                        val isFeedback = showFeedbackPage
                        IconButton(onClick = {
                            if (isFeedback) {
                                showFeedbackPage = false
                            } else {
                                scope.launch { drawerState.open() }
                            }
                        }) {
                            Icon(
                                imageVector = if (isFeedback) Icons.AutoMirrored.Filled.ArrowBack else Icons.Default.Menu,
                                contentDescription = if (isFeedback) stringResource(R.string.go_back_desc) else stringResource(R.string.open_navigation_drawer_desc),
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
                        selected = false,
                        onClick = {
                            navController.navigate("dashboard") {
                                popUpTo("dashboard") { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.Dashboard, contentDescription = stringResource(R.string.dashboard_tab)) },
                        label = { Text(stringResource(R.string.dashboard_tab), fontSize = 11.sp) },
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
                        icon = { Icon(Icons.AutoMirrored.Filled.Assignment, contentDescription = stringResource(R.string.reports_tab)) },
                        label = { Text(stringResource(R.string.reports_tab), fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)
                        )
                    )
                    NavigationBarItem(
                        selected = true,
                        onClick = { /* Already here */ },
                        icon = { Icon(Icons.Default.AccountCircle, contentDescription = stringResource(R.string.profile_tab)) },
                        label = { Text(stringResource(R.string.profile_tab), fontSize = 11.sp) },
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
                ProfileTab(
                    reportsList = reportsList,
                    userProfile = userProfile,
                    reportStats = reportStats,
                    onLogout = onLogout,
                    onNavigateToFaq = onNavigateToFaq,
                    onNavigateToPrivacy = { navController.navigate("privacy_policy") },
                    onNavigateToTerms = { navController.navigate("terms_of_service") },
                    onSendFeedbackClick = { showFeedbackPage = true },
                    onUpdateProfile = onUpdateProfile
                )

                // Feedback Page Overlay (Inside Scaffold)
                AnimatedVisibility(
                    visible = showFeedbackPage,
                    enter = slideInHorizontally(initialOffsetX = { it }) + fadeIn(),
                    exit = slideOutHorizontally(targetOffsetX = { it }) + fadeOut()
                ) {
                    FeedbackScreen(
                        onSubmit = { category, message, imageUri ->
                            onFeedbackSubmit(category, message, imageUri?.toString()) { result ->
                                if (result.isSuccess) {
                                    showFeedbackPage = false
                                    Toast.makeText(context, context.getString(R.string.feedback_submitted_success), Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun ProfileTab(
    reportsList: List<CitizenReportDto>,
    userProfile: UserProfile?,
    reportStats: com.axomprahari.data.remote.dto.ReportStats?,
    onLogout: () -> Unit,
    onNavigateToFaq: () -> Unit,
    onNavigateToPrivacy: () -> Unit,
    onNavigateToTerms: () -> Unit,
    onSendFeedbackClick: () -> Unit,
    onUpdateProfile: (String, String, String, (Result<UserProfile>) -> Unit) -> Unit
) {
    val context = LocalContext.current
    val loadingText = stringResource(R.string.loading_text)
    var fullName by remember { mutableStateOf(userProfile?.fullName ?: loadingText) }
    var username by remember { mutableStateOf(userProfile?.username ?: "") }
    var email by remember { mutableStateOf(userProfile?.email ?: "") }
    val phoneNumber = userProfile?.phoneNumber ?: ""

    LaunchedEffect(userProfile) {
        userProfile?.let {
            fullName = it.fullName
            username = it.username
            email = it.email
        }
    }

    // Dialog state for edit profile
    var showEditDialog by remember { mutableStateOf(false) }

    // Dialog temp states for edit profile
    var tempName by remember { mutableStateOf(fullName) }
    var tempUsername by remember { mutableStateOf(username) }
    var tempEmail by remember { mutableStateOf(email) }

    LaunchedEffect(showEditDialog) {
        if (showEditDialog) {
            tempName = fullName
            tempUsername = username
            tempEmail = email
        }
    }

    // Stats calculations
    val totalPoints = userProfile?.rewardPoints ?: 0
    val totalReports = reportStats?.total ?: 0
    val verifiedCount = reportStats?.accepted ?: 0

    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(horizontal = 20.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // 1. Profile Avatar + ID Badge + Name grouped together
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(110.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = stringResource(R.string.profile_photo_desc),
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(64.dp)
                )
            }

            // Citizen ID Badge — tight gap from avatar
            userProfile?.citizenId?.let { citizenId ->
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                    ),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Badge,
                            contentDescription = stringResource(R.string.citizen_id_desc),
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = citizenId,
                            style = MaterialTheme.typography.labelMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                                letterSpacing = 1.sp
                            )
                        )
                    }
                }
            }

            // Name & Phone — hierarchy gap after badge
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = fullName,
                style = MaterialTheme.typography.titleLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            )
            
            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = phoneNumber,
                style = MaterialTheme.typography.bodyLarge.copy(
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    fontWeight = FontWeight.Medium
                )
            )
        }

        // 3. Stats Row Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = androidx.compose.foundation.BorderStroke(
                width = 1.dp,
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
            )
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 20.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Points
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = totalPoints.toString(),
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                    Text(
                        text = stringResource(R.string.points_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                    )
                }

                // Vertical Divider
                Box(
                    modifier = Modifier
                        .height(36.dp)
                        .width(1.dp)
                        .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.12f))
                )

                // Reports
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = totalReports.toString(),
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                    Text(
                        text = stringResource(R.string.reports_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                    )
                }

                // Vertical Divider
                Box(
                    modifier = Modifier
                        .height(36.dp)
                        .width(1.dp)
                        .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.12f))
                )

                // Verified
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = verifiedCount.toString(),
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                    Text(
                        text = stringResource(R.string.verified_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                    )
                }
            }
        }

        // 4. ACCOUNT Section
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = stringResource(R.string.account_section_title),
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    letterSpacing = 1.sp
                ),
                modifier = Modifier.align(Alignment.Start)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Name Info
                    AccountInfoRow(icon = Icons.Default.Person, title = stringResource(R.string.name_label), value = fullName)
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f), modifier = Modifier.padding(horizontal = 20.dp))
                    
                    // Username Info
                    AccountInfoRow(icon = Icons.Default.Badge, title = stringResource(R.string.username_label), value = username)
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f), modifier = Modifier.padding(horizontal = 20.dp))

                    // Email Info
                    AccountInfoRow(icon = Icons.Default.Email, title = stringResource(R.string.email_address_label), value = email)
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Buttons
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                // Update Profile Button
                Button(
                    onClick = {
                        tempName = fullName
                        tempUsername = username
                        tempEmail = email
                        showEditDialog = true
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                ) {
                    Icon(imageVector = Icons.Default.Edit, contentDescription = stringResource(R.string.edit_profile_desc))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.update_profile_btn), style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold))
                }


            }
        }

        // 5. PREFERENCES Section (No Notification, No Language)
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = stringResource(R.string.preferences_section_title),
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    letterSpacing = 1.sp
                ),
                modifier = Modifier.align(Alignment.Start)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column {
                    ProfileMenuRow(icon = Icons.Default.Lock, title = stringResource(R.string.privacy_policy_title), onClick = onNavigateToPrivacy)
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f), modifier = Modifier.padding(horizontal = 20.dp))
                    ProfileMenuRow(icon = Icons.Default.Description, title = stringResource(R.string.terms_of_service_title), onClick = onNavigateToTerms)
                }
            }
        }

        // 6. SUPPORT Section
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = stringResource(R.string.support_section_title),
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    letterSpacing = 1.sp
                ),
                modifier = Modifier.align(Alignment.Start)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column {
                    ProfileMenuRow(icon = Icons.Default.Feedback, title = stringResource(R.string.submit_feedback_title), onClick = onSendFeedbackClick)
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f), modifier = Modifier.padding(horizontal = 20.dp))
                    ProfileMenuRow(icon = Icons.AutoMirrored.Filled.Help, title = stringResource(R.string.faq_title), onClick = onNavigateToFaq)
                }
            }
        }

        // 7. Logout Button
        Button(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error,
                contentColor = MaterialTheme.colorScheme.onError
            ),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                contentDescription = stringResource(R.string.logout_desc),
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(R.string.logout_from_account_btn),
                style = MaterialTheme.typography.labelLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 0.5.sp
                )
            )
        }
    }

    // Dialog state for profile updating status
    var isUpdating by remember { mutableStateOf(false) }

    // Edit Profile Dialog
    if (showEditDialog) {
        AlertDialog(
            onDismissRequest = { if (!isUpdating) showEditDialog = false },
            title = {
                Text(
                    text = stringResource(R.string.update_profile_btn),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Phone number (Read-Only)
                    OutlinedTextField(
                        value = phoneNumber,
                        onValueChange = {},
                        label = { Text(stringResource(R.string.phone_number_label)) },
                        leadingIcon = { Icon(Icons.Default.Phone, contentDescription = stringResource(R.string.phone_desc)) },
                        enabled = false,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Name
                    OutlinedTextField(
                        value = tempName,
                        onValueChange = { tempName = it },
                        label = { Text(stringResource(R.string.full_name_label)) },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = stringResource(R.string.name_label)) },
                        enabled = !isUpdating,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Username
                    OutlinedTextField(
                        value = tempUsername,
                        onValueChange = { tempUsername = it },
                        label = { Text(stringResource(R.string.username_label)) },
                        leadingIcon = { Icon(Icons.Default.Badge, contentDescription = stringResource(R.string.username_label)) },
                        enabled = !isUpdating,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Email
                    OutlinedTextField(
                        value = tempEmail,
                        onValueChange = { tempEmail = it },
                        label = { Text(stringResource(R.string.email_address_label)) },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = stringResource(R.string.email_desc)) },
                        enabled = !isUpdating,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (tempName.isBlank() || tempUsername.isBlank() || tempEmail.isBlank()) {
                            Toast.makeText(context, context.getString(R.string.fill_in_all_fields_toast), Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        isUpdating = true
                        onUpdateProfile(tempName, tempEmail, tempUsername) { result ->
                            isUpdating = false
                            result.onSuccess {
                                fullName = tempName
                                username = tempUsername
                                email = tempEmail
                                showEditDialog = false
                                Toast.makeText(context, context.getString(R.string.profile_updated_success_toast), Toast.LENGTH_SHORT).show()
                            }.onFailure { error ->
                                Toast.makeText(context, error.message ?: context.getString(R.string.update_failed_toast), Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    enabled = !isUpdating,
                    shape = RoundedCornerShape(10.dp)
                ) {
                    if (isUpdating) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(stringResource(R.string.save_changes_btn), fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showEditDialog = false }
                ) {
                    Text(stringResource(R.string.cancel_btn), fontWeight = FontWeight.Bold)
                }
            },
            shape = RoundedCornerShape(20.dp)
        )
    }


}

@Composable
fun AccountInfoRow(
    icon: ImageVector,
    title: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    }
}

@Composable
fun ProfileMenuRow(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 18.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
        }
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodyLarge.copy(
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            ),
            modifier = Modifier.weight(1f)
        )
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = stringResource(R.string.arrow_desc),
            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
            modifier = Modifier.size(20.dp)
        )
    }
}
