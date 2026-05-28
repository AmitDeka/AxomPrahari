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
import com.axomprahari.data.remote.dto.CitizenReportDto
import androidx.compose.ui.res.stringResource
import com.axomprahari.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportDetailScreen(
    report: CitizenReportDto,
    onBack: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val statusColor = when (report.status) {
        "accepted" -> MaterialTheme.colorScheme.primaryContainer
        "pending" -> MaterialTheme.colorScheme.secondaryContainer
        "rejected" -> MaterialTheme.colorScheme.errorContainer
        else -> MaterialTheme.colorScheme.secondaryContainer
    }

    val statusTextColor = when (report.status) {
        "accepted" -> MaterialTheme.colorScheme.onPrimaryContainer
        "pending" -> MaterialTheme.colorScheme.onSecondaryContainer
        "rejected" -> MaterialTheme.colorScheme.onErrorContainer
        else -> MaterialTheme.colorScheme.onSecondaryContainer
    }

    val statusText = when (report.status) {
        "accepted" -> stringResource(R.string.status_verified_approved)
        "pending" -> stringResource(R.string.status_under_review)
        "rejected" -> stringResource(R.string.status_rejected)
        else -> stringResource(R.string.status_unknown)
    }

    val mockReportId = "REP-260523-${report.id.hashCode().coerceAtLeast(0).toString(16).uppercase().take(6).padStart(6, 'B')}"

    BackHandler(onBack = onBack)

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.report_details_title),
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
            // Removed Attached Media Evidence Card per user request

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
                            text = stringResource(R.string.status_label),
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
                        label = stringResource(R.string.violation_type_label),
                        value = report.offenceName ?: "N/A"
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Report ID
                    DetailRow(
                        icon = Icons.Default.Fingerprint,
                        label = stringResource(R.string.report_id_label),
                        value = mockReportId
                    )

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Reward Points
                    val points = report.rewardPoints ?: 0
                    DetailRow(
                        icon = Icons.Default.Star,
                        label = stringResource(R.string.reward_points_label),
                        value = if (report.status == "accepted") "+$points XP Added" else "$points XP (Pending Verification)"
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
                    val userLocation = report.locationName ?: "N/A"
                    DetailRow(
                        icon = Icons.Default.LocationOn,
                        label = stringResource(R.string.user_location_reference_label),
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
                                label = stringResource(R.string.latitude_label),
                                value = report.latitude ?: "N/A"
                            )
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.GpsFixed,
                                label = stringResource(R.string.longitude_label),
                                value = report.longitude ?: "N/A"
                            )
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.06f))

                    // Date & Time separately (Formatted to Indian format & 12-hour time)
                    val dateStr = try {
                        val inFormat = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                        val outFormat = java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.getDefault())
                        outFormat.format(inFormat.parse(report.incidentDate ?: "")!!)
                    } catch (e: Exception) {
                        report.incidentDate ?: "N/A"
                    }
                    val timeStr = try {
                        val inFormat = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault())
                        val outFormat = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
                        outFormat.format(inFormat.parse(report.incidentTime ?: "")!!)
                    } catch (e: Exception) {
                        try {
                            val inFormat2 = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault())
                            val outFormat2 = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
                            outFormat2.format(inFormat2.parse(report.incidentTime ?: "")!!)
                        } catch (e2: Exception) {
                            report.incidentTime ?: "N/A"
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.Event,
                                label = stringResource(R.string.report_date_label),
                                value = dateStr
                            )
                        }
                        Box(modifier = Modifier.weight(1f)) {
                            DetailRow(
                                icon = Icons.Default.Schedule,
                                label = stringResource(R.string.report_time_label),
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
                        text = stringResource(R.string.additional_notes_label),
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f),
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Text(
                        text = report.message?.takeIf { it.isNotBlank() } ?: stringResource(R.string.no_additional_notes_desc),
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

