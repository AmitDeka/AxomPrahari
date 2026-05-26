package com.axomprahari.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.foundation.isSystemInDarkTheme
import com.axomprahari.ui.theme.*
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axomprahari.data.model.TrafficReport
import com.axomprahari.data.model.ReportStatus


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportDetailScreen(
    report: TrafficReport,
    onBack: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val statusColor = when (report.status) {
        ReportStatus.VERIFIED -> MaterialTheme.colorScheme.primaryContainer
        ReportStatus.UNDER_REVIEW -> MaterialTheme.colorScheme.secondaryContainer
        ReportStatus.REJECTED -> MaterialTheme.colorScheme.errorContainer
    }

    val statusTextColor = when (report.status) {
        ReportStatus.VERIFIED -> MaterialTheme.colorScheme.onPrimaryContainer
        ReportStatus.UNDER_REVIEW -> MaterialTheme.colorScheme.onSecondaryContainer
        ReportStatus.REJECTED -> MaterialTheme.colorScheme.onErrorContainer
    }

    val statusText = when (report.status) {
        ReportStatus.VERIFIED -> "Verified & Approved"
        ReportStatus.UNDER_REVIEW -> "Under Review"
        ReportStatus.REJECTED -> "Rejected"
    }

    val mockReportId = "REP-260523-${report.id.hashCode().coerceAtLeast(0).toString(16).uppercase().take(6).padStart(6, 'B')}"

    BackHandler(onBack = onBack)

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Report Details",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Go back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        val scrollState = rememberScrollState()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 1. Attached Media Evidence Card
            val isVideo = report.mediaPath?.endsWith(".mp4") ?: false
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = MaterialTheme.colorScheme.outline.copy(alpha = 0.1f)
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    // Simulated preview background using gradients
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(
                                        MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f),
                                        MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.1f)
                                    )
                                )
                            )
                    )
                    
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(MaterialTheme.colorScheme.surface, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (isVideo) Icons.Default.PlayArrow else Icons.Default.PhotoCamera,
                                contentDescription = if (isVideo) "Video Play" else "Photo View",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = if (isVideo) "Attached Video Evidence" else "Attached Photo Evidence",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                        Text(
                            text = report.mediaPath ?: "evidence_file.jpg",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            )
                        )
                    }
                }
            }

            // 2. Info Summary Card (Status, Type, Points, ID)
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
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Status row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "STATUS",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(statusColor)
                                .padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = statusText,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = statusTextColor,
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Violation Type
                    DetailRow(
                        icon = Icons.Default.Warning,
                        label = "VIOLATION TYPE",
                        value = report.type
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Report ID
                    DetailRow(
                        icon = Icons.Default.Fingerprint,
                        label = "REPORT ID",
                        value = mockReportId
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Reward Points
                    DetailRow(
                        icon = Icons.Default.Star,
                        label = "REWARD POINTS",
                        value = if (report.status == ReportStatus.VERIFIED) "+${report.points} XP Added" else "100 XP (Pending Verification)"
                    )
                }
            }

            // 3. Location, Coordinates & Date-Time details Card
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
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Location Reference (Landmark)
                    val userLocation = report.userLocationName ?: "N/A"
                    DetailRow(
                        icon = Icons.Default.LocationOn,
                        label = "USER LOCATION REFERENCE",
                        value = userLocation
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Latitude & Longitude
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.GpsFixed,
                                label = "LATITUDE",
                                value = report.latitude
                            )
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.GpsFixed,
                                label = "LONGITUDE",
                                value = report.longitude
                            )
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Date & Time separately
                    val dateTimeParts = report.timestamp.split(" ")
                    val dateStr = if (dateTimeParts.isNotEmpty()) dateTimeParts[0] else report.timestamp
                    val timeStr = if (dateTimeParts.size > 1) dateTimeParts.subList(1, dateTimeParts.size).joinToString(" ") else "N/A"

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.Event,
                                label = "REPORT DATE",
                                value = dateStr
                            )
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.Schedule,
                                label = "REPORT TIME",
                                value = timeStr
                            )
                        }
                    }
                }
            }

            // 4. Text message / additional description from the user
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
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "ADDITIONAL SENTINEL NOTES",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        text = report.description.ifBlank { "No additional text message or description was entered by the user." },
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                            lineHeight = 20.sp
                        )
                    )
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

