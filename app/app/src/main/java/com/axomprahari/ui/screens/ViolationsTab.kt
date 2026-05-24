package com.axomprahari.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class TrafficViolationInfo(
    val id: String,
    val type: String,
    val section: String,
    val fine: String,
    val description: String,
    val instructions: String
)

@Composable
fun ViolationsTab() {
    val violations = remember {
        listOf(
            TrafficViolationInfo(
                id = "1",
                type = "No Helmet",
                section = "Section 177 & 194D, M.V. Act",
                fine = "₹1,000 + 3 Months License Suspension",
                description = "Riding a two-wheeler without a Bureau of Indian Standards (BIS) approved protective helmet.",
                instructions = "Capture a clear photograph showing both the license plate of the vehicle and the rider/pillion passenger without a helmet."
            ),
            TrafficViolationInfo(
                id = "2",
                type = "Triple Riding",
                section = "Section 194C, M.V. Act",
                fine = "₹1,000 + 3 Months License Suspension",
                description = "Carrying more than one pillion rider on a two-wheeler motorcycle or scooter.",
                instructions = "Take a photo showing all three individuals on the two-wheeler, ensuring the vehicle registration number is clearly visible."
            ),
            TrafficViolationInfo(
                id = "3",
                type = "Wrong Side Driving",
                section = "Section 184 (Dangerous Driving), M.V. Act",
                fine = "₹5,000 or Imprisonment up to 1 Year",
                description = "Driving against the designated flow of traffic on a one-way road, divided highway, or intersection.",
                instructions = "Photograph the vehicle head-on or from behind showing it traveling opposite to other cars or road signs, with the license plate visible."
            ),
            TrafficViolationInfo(
                id = "4",
                type = "Red Light Jump",
                section = "Section 184, M.V. Act",
                fine = "₹1,000 to ₹5,000",
                description = "Failing to stop at a red signal at traffic intersections.",
                instructions = "Capture the vehicle crossing the stop line while the traffic signal is clearly red. Registration details must be legible."
            ),
            TrafficViolationInfo(
                id = "5",
                type = "Using Phone while Driving",
                section = "Section 184(c), M.V. Act",
                fine = "₹5,000",
                description = "Holding or using a mobile phone or handheld communication device while driving/riding a vehicle.",
                instructions = "Capture the driver holding the phone near their ear or looking down at it, with the vehicle details and surrounding traffic clearly contexted."
            ),
            TrafficViolationInfo(
                id = "6",
                type = "Dangerous Driving / Zig-Zag",
                section = "Section 184, M.V. Act",
                fine = "₹1,000 to ₹5,000",
                description = "Driving in a manner which is dangerous to the public, including high-speed weaving, sudden lane changes without signaling.",
                instructions = "Record a short video clip (minimum 5 seconds) showing the reckless driving patterns and ensure the license plate is readable."
            )
        )
    }

    var expandedItemId by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Violation Guidelines",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
        )
        Text(
            text = "Familiarize yourself with traffic rules in Assam and learn how to report them correctly.",
            style = MaterialTheme.typography.bodyMedium.copy(
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
            ),
            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
        )

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(bottom = 24.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(violations, key = { it.id }) { violation ->
                val isExpanded = expandedItemId == violation.id
                ViolationCard(
                    violation = violation,
                    isExpanded = isExpanded,
                    onToggleExpand = {
                        expandedItemId = if (isExpanded) null else violation.id
                    }
                )
            }
        }
    }
}

@Composable
fun ViolationCard(
    violation: TrafficViolationInfo,
    isExpanded: Boolean,
    onToggleExpand: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onToggleExpand() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(
            width = 1.dp,
            color = MaterialTheme.colorScheme.outline.copy(alpha = if (isExpanded) 0.2f else 0.08f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Warning icon in colored container
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            if (isExpanded) MaterialTheme.colorScheme.primaryContainer 
                            else MaterialTheme.colorScheme.surfaceVariant,
                            CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = "Warning",
                        tint = if (isExpanded) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = violation.type,
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Text(
                        text = violation.section,
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                }

                Icon(
                    imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = "Expand/Collapse",
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                )
            }

            // Expandable details block
            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column(
                    modifier = Modifier
                        .padding(top = 16.dp)
                ) {
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.08f))
                    Spacer(modifier = Modifier.height(12.dp))

                    // Fine banner
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.4f))
                            .border(
                                1.dp,
                                MaterialTheme.colorScheme.error.copy(alpha = 0.15f),
                                RoundedCornerShape(8.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Fine Amount",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Penalty: ${violation.fine}",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onErrorContainer
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Description text
                    Text(
                        text = "Description",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Text(
                        text = violation.description,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            lineHeight = 20.sp
                        ),
                        modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                    )

                    // How to report guidelines
                    Text(
                        text = "Evidence Requirements",
                        style = MaterialTheme.typography.bodyMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Text(
                        text = violation.instructions,
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            lineHeight = 20.sp
                        ),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }
    }
}
