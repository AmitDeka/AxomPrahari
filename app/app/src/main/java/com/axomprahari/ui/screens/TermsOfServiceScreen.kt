package com.axomprahari.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axomprahari.R
import com.axomprahari.ui.theme.*
import androidx.compose.foundation.isSystemInDarkTheme

@Composable
fun TermsOfServiceScreen(onBack: () -> Unit) {
    val isDark = isSystemInDarkTheme()
    val LoginDarkGreen = MaterialTheme.colorScheme.primary
    val LoginBgTop = MaterialTheme.colorScheme.background
    val LoginBgBottom = MaterialTheme.colorScheme.surfaceContainerLowest
    val InputBackground = MaterialTheme.colorScheme.surfaceVariant
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(LoginBgTop, LoginBgBottom)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            // ── Back Button ──
            IconButton(
                onClick = onBack,
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = LoginDarkGreen
                )
            }

            // ── Header Title & Subtitle ──
            Text(
                text = "OFFICIAL DOCUMENTATION",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.5f),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                )
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Terms of Service",
                style = TextStyle(
                    color = LoginDarkGreen,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            val appName = stringResource(id = R.string.app_name)
            Text(
                text = "Welcome to $appName. By utilizing this citizen sentinel platform, you agree to comply with our service guidelines, obligations, and legal governance rules outlined below.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.7f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    fontWeight = FontWeight.Normal
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 1: Terms of Use ──
            TermsSectionHeader(number = "1", title = "Acceptance of Terms")
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Placeholder statements regarding terms acceptance. By registering a verified phone number and logging into the platform, you legally consent to be bound by these service conditions, local ordinances, and civilian sentinel rules.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 2: User Responsibility ──
            TermsSectionHeader(number = "2", title = "Citizen Responsibilities")
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Placeholder information highlighting user obligations. Sentinel program members agree to submit truthful, accurate, and non-falsified reports. Misuse of the platform is strictly prohibited.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            )
            Spacer(modifier = Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onErrorContainer,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Warning: Intentional submission of falsified evidence is a punishable offense under state regulations.",
                        style = TextStyle(
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 18.sp
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 3: Service Availability & Limitations ──
            TermsSectionHeader(number = "3", title = "Service Uptime & Limitations")
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Placeholder statements regarding terms of service, platform availability, service uptime, liability limitations, and intellectual property protections for the sentinel platform infrastructure.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 4: Governance & Legislative Framework ──
            TermsSectionHeader(number = "4", title = "Governance & Legislation")
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Placeholder text mapping out the governance frameworks, including regional transport regulations and legal rules backing civilian reporting protocols.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            )
            Spacer(modifier = Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = LoginDarkGreen)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp)
                ) {
                    Text(
                        text = "Legislative Framework",
                        style = TextStyle(
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "These policies are governed by the Information Technology Act of India and local ordinances of the Assam Department of Transport.",
                        style = TextStyle(
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { /* Placeholder click */ },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer,
                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.height(40.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "DOWNLOAD FULL TERMS PDF",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(
                                imageVector = Icons.Default.FileDownload,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(36.dp))

            // ── Footer Copyright ──
            Text(
                text = "Last modified: October 24, 2023. Version 2.4.0-Sentinel\n© 2023 Digital Assam Initiatives. All Rights Reserved.",
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.4f),
                    fontSize = 11.sp,
                    lineHeight = 16.sp,
                    textAlign = TextAlign.Center
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            )
        }
    }
}

@Composable
fun TermsSectionHeader(number: String, title: String) {
    val isDark = isSystemInDarkTheme()
    val LoginDarkGreen = MaterialTheme.colorScheme.primary
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(RoundedCornerShape(8.dp))
                .background(LoginDarkGreen.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = number,
                style = TextStyle(
                    color = LoginDarkGreen,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = title,
            style = TextStyle(
                color = LoginDarkGreen,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        )
    }
}
