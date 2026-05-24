package com.axomprahari.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportDetailScreen(
    report: TrafficReport,
    onBack: () -> Unit
) {
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
        ReportStatus.VERIFIED -> "Verified & Approved"
        ReportStatus.UNDER_REVIEW -> "Under Review"
        ReportStatus.REJECTED -> "Rejected"
    }

    val mockReportId = "REP-260523-${report.id.hashCode().coerceAtLeast(0).toString(16).uppercase().take(6).padStart(6, 'B')}"

    BackHandler(onBack = onBack)

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .statusBarsPadding()
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            IconButton(
                onClick = onBack,
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.onSurface
                )
            }
            // Status Header Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(statusColor)
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = statusText,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                color = statusTextColor,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = report.type,
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold)
                    )

                    Text(
                        text = mockReportId,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        ),
                        modifier = Modifier.padding(top = 2.dp)
                    )

                    if (report.points > 0 && report.status == ReportStatus.VERIFIED) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(MaterialTheme.colorScheme.primaryContainer)
                                .padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "+${report.points} XP Reward Issued",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Submission Details Card
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
                    DetailRow(
                        icon = Icons.Default.LocationOn,
                        label = "Location",
                        value = report.location
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    DetailRow(
                        icon = Icons.Default.Event,
                        label = "Submitted On",
                        value = report.timestamp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    DetailRow(
                        icon = Icons.Default.Description,
                        label = "Violation Evidence Notes",
                        value = "Automatic verification pending. Plate is readable, location tags match GPS metadata."
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Timeline / Review Section
            Text(
                text = "Verification Timeline",
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
                    TimelineItem(
                        title = "Report Submitted",
                        time = report.timestamp,
                        isDone = true,
                        isCurrent = report.status == ReportStatus.UNDER_REVIEW
                    )
                    TimelineDivider()
                    TimelineItem(
                        title = "Verification review by Assam Police admin",
                        time = if (report.status != ReportStatus.UNDER_REVIEW) "Reviewed shortly after" else "Pending Review",
                        isDone = report.status != ReportStatus.UNDER_REVIEW,
                        isCurrent = false
                    )
                    TimelineDivider()
                    TimelineItem(
                        title = if (report.status == ReportStatus.REJECTED) "Report Rejected" else "Resolved & Approved",
                        time = if (report.status == ReportStatus.VERIFIED) "Points issued" else if (report.status == ReportStatus.REJECTED) "Insufficient evidence" else "Awaiting resolution",
                        isDone = report.status != ReportStatus.UNDER_REVIEW,
                        isCurrent = report.status != ReportStatus.UNDER_REVIEW
                    )

                    // Admin feedback message if reviewed
                    if (report.status != ReportStatus.UNDER_REVIEW) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                .padding(12.dp)
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.ChatBubbleOutline,
                                        contentDescription = "Review Note",
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Police Verification Feedback",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = if (report.status == ReportStatus.VERIFIED) {
                                        "Verified. Offender fined under Section 177 of M.V. Act. Thank you, Sentinel!"
                                    } else {
                                        "Rejected. License plate blurry or details do not match image. Please capture evidence as per guidelines."
                                    },
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DetailRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Medium
                ),
                modifier = Modifier.padding(top = 2.dp)
            )
        }
    }
}

@Composable
fun TimelineItem(
    title: String,
    time: String,
    isDone: Boolean,
    isCurrent: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(16.dp)
                .background(
                    if (isDone) MaterialTheme.colorScheme.primary 
                    else if (isCurrent) MaterialTheme.colorScheme.primary.copy(alpha = 0.5f) 
                    else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    CircleShape
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isDone) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Done",
                    tint = Color.White,
                    modifier = Modifier.size(10.dp)
                )
            }
        }

        Spacer(modifier = Modifier.width(16.dp))

        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium.copy(
                    fontWeight = if (isCurrent || isDone) FontWeight.Bold else FontWeight.Normal,
                    color = if (isDone || isCurrent) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            )
            Text(
                text = time,
                style = MaterialTheme.typography.bodySmall.copy(
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                )
            )
        }
    }
}

@Composable
fun TimelineDivider() {
    Box(
        modifier = Modifier
            .padding(start = 7.dp)
            .width(2.dp)
            .height(24.dp)
            .background(MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
    )
}
