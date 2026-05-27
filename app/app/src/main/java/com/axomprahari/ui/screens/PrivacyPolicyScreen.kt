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
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
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
import com.axomprahari.ui.theme.*
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.ui.res.stringResource
import com.axomprahari.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrivacyPolicyScreen(onBack: () -> Unit) {
    val isDark = isSystemInDarkTheme()
    val LoginDarkGreen = MaterialTheme.colorScheme.primary
    val LoginBgTop = MaterialTheme.colorScheme.background
    val LoginBgBottom = MaterialTheme.colorScheme.surfaceContainerLowest
    val InputBackground = MaterialTheme.colorScheme.surfaceVariant

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.privacy_screen_title),
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(LoginBgTop, LoginBgBottom)
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 16.dp)
            ) {
                // ── Header Title & Subtitle ──
                Text(
                    text = stringResource(R.string.privacy_official_documentation),
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.5f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    )
                )

                Spacer(modifier = Modifier.height(12.dp))

                val appName = stringResource(id = R.string.app_name)
            Text(
                text = stringResource(R.string.privacy_welcome_desc, appName),
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.7f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp,
                    fontWeight = FontWeight.Normal
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 1: Data Collection ──
            PrivacySectionHeader(number = "1", title = stringResource(R.string.privacy_section_1_title))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.privacy_section_1_desc),
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
                colors = CardDefaults.cardColors(containerColor = if (isDark) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f) else Color.White.copy(alpha = 0.4f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, if (isDark) MaterialTheme.colorScheme.outline.copy(alpha = 0.3f) else Color.White)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = stringResource(R.string.privacy_what_we_store),
                        style = TextStyle(
                            color = LoginDarkGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = stringResource(R.string.privacy_what_we_store_list),
                        style = TextStyle(
                            color = LoginDarkGreen.copy(alpha = 0.7f),
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 2: Data Security & Encryption ──
            PrivacySectionHeader(number = "2", title = stringResource(R.string.privacy_section_2_title))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.privacy_section_2_desc),
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
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = null,
                        tint = LoginDarkGreen,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = stringResource(R.string.privacy_data_security_note),
                        style = TextStyle(
                            color = LoginDarkGreen,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 18.sp
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 3: Information Sharing ──
            PrivacySectionHeader(number = "3", title = stringResource(R.string.privacy_section_3_title))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.privacy_section_3_desc),
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.8f),
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Section 4: Governance & PDF ──
            PrivacySectionHeader(number = "4", title = stringResource(R.string.privacy_section_4_title))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.privacy_section_4_desc),
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
                        text = stringResource(R.string.privacy_detailed_policy_doc_title),
                        style = TextStyle(
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = stringResource(R.string.privacy_detailed_policy_doc_desc),
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
                                text = stringResource(R.string.privacy_download_pdf_btn),
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
                text = stringResource(R.string.privacy_footer_copyright),
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
}

@Composable
fun PrivacySectionHeader(number: String, title: String) {
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
