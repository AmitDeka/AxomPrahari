package com.axomprahari.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.isSystemInDarkTheme
import com.axomprahari.R
import com.axomprahari.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun RequestOtpScreen(
    onNavigateToVerify: (String) -> Unit,
    onNavigateToGuidelineFaq: () -> Unit,
    onNavigateToPrivacyPolicy: () -> Unit,
    onNavigateToTermsOfService: () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val LoginDarkGreen = MaterialTheme.colorScheme.primary
    val LoginBgTop = MaterialTheme.colorScheme.background
    val LoginBgBottom = MaterialTheme.colorScheme.surfaceContainerLowest
    val InputBackground = MaterialTheme.colorScheme.surfaceVariant

    var phoneNumber by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current

    val isValid = phoneNumber.length == 10 && phoneNumber.all { it.isDigit() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(LoginBgTop, LoginBgBottom)
                )
            )
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                focusManager.clearFocus()
            }
    ) {

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 32.dp, vertical = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(48.dp))

            // ── App Logo ──
            Box(
                modifier = Modifier
                    .shadow(
                        elevation = 24.dp,
                        ambientColor = Color.Black.copy(alpha = 0.01f),
                        spotColor = Color.Black.copy(alpha = 0.01f)
                    )
                    .size(120.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.app_logo),
                    contentDescription = "Axom Prahari Logo",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── App Name ──
            Text(
                text = stringResource(id = R.string.app_name),
                style = TextStyle(
                    color = LoginDarkGreen,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(4.dp))

            // ── Tagline ──
            Text(
                text = stringResource(id = R.string.app_tagline),
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.6f),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.5.sp
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(56.dp))

            // ── Welcome Text ──
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "Welcome back.",
                    style = TextStyle(
                        color = LoginDarkGreen,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Securely access your civic dashboard and report traffic incidents.",
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.7f),
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                        fontWeight = FontWeight.Normal
                    )
                )
            }

            Spacer(modifier = Modifier.height(40.dp))

            // ── Phone Input Section ──
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = "PHONE NUMBER",
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.5f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.5.sp
                    ),
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(InputBackground)
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "+91",
                        style = TextStyle(
                            color = LoginDarkGreen,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    // Vertical Divider
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 12.dp)
                            .width(1.dp)
                            .fillMaxHeight(0.4f)
                            .background(LoginDarkGreen.copy(alpha = 0.2f))
                    )

                    BasicTextField(
                        value = phoneNumber,
                        onValueChange = { input ->
                            if (input.length <= 10 && input.all { it.isDigit() }) {
                                phoneNumber = input
                            }
                        },
                        textStyle = TextStyle(
                            color = LoginDarkGreen,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        decorationBox = { innerTextField ->
                            if (phoneNumber.isEmpty()) {
                                Text(
                                    text = "Enter phone number",
                                    color = LoginDarkGreen.copy(alpha = 0.4f),
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Normal
                                )
                            }
                            innerTextField()
                        }
                    )
                }

                if (phoneNumber.isNotEmpty() && !isValid) {
                    Text(
                        text = "Please enter a valid 10-digit phone number",
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Button ──
            Button(
                onClick = {
                    if (isValid) {
                        loading = true
                        scope.launch {
                            delay(1000)
                            loading = false
                            onNavigateToVerify(phoneNumber)
                        }
                    }
                },
                enabled = isValid && !loading,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = LoginDarkGreen,
                    contentColor = Color.White,
                    disabledContainerColor = LoginDarkGreen.copy(alpha = 0.3f),
                    disabledContentColor = Color.White.copy(alpha = 0.5f)
                ),
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 2.dp,
                    pressedElevation = 4.dp,
                    disabledElevation = 0.dp
                )
            ) {
                if (loading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 2.5.dp
                    )
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "GET OTP",
                            style = TextStyle(
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f).heightIn(min = 48.dp))

            // ── Footer Links ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "HELP CENTER",
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    ),
                    modifier = Modifier.clickable { onNavigateToGuidelineFaq() }
                )

                Spacer(modifier = Modifier.width(16.dp))

                Text(
                    text = "PRIVACY POLICY",
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    ),
                    modifier = Modifier.clickable { onNavigateToPrivacyPolicy() }
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // ── Secured By Text ──
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(1.dp)
                        .background(LoginDarkGreen.copy(alpha = 0.15f))
                )

                Text(
                    text = "SECURED BY KAZIRANGA SMART INFRASTRUCTURE",
                    style = TextStyle(
                        color = LoginDarkGreen.copy(alpha = 0.4f),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    ),
                    modifier = Modifier.padding(horizontal = 12.dp)
                )

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(1.dp)
                        .background(LoginDarkGreen.copy(alpha = 0.15f))
                )
            }
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}
