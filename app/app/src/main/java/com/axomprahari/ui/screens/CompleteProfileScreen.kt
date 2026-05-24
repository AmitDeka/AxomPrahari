package com.axomprahari.ui.screens

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
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.HelpOutline
import androidx.compose.material.icons.filled.AlternateEmail
import androidx.compose.material.icons.filled.AssignmentInd
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axomprahari.R

import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun CompleteProfileScreen(onRegistrationSuccess: (String) -> Unit) {
    val isDark = isSystemInDarkTheme()
    val loginDarkGreen = if (isDark) MaterialTheme.colorScheme.primary else com.axomprahari.ui.theme.loginDarkGreen
    val loginBgTop = if (isDark) MaterialTheme.colorScheme.background else com.axomprahari.ui.theme.loginBgTop
    val loginBgBottom = if (isDark) MaterialTheme.colorScheme.surfaceContainerLowest else com.axomprahari.ui.theme.loginBgBottom
    val loginInputBackground = if (isDark) MaterialTheme.colorScheme.surfaceVariant else com.axomprahari.ui.theme.loginInputBackground

    var fullName by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()

    val isEmailValid = email.isEmpty() || android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    val isFormValid = fullName.trim().length >= 3 && username.trim().length >= 3 && isEmailValid && email.isNotEmpty()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(loginBgTop, loginBgBottom)
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
                .verticalScroll(scrollState)
                .padding(horizontal = 24.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // ── Top Bar ──
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = R.drawable.app_logo),
                    contentDescription = "Axom Prahari Logo",
                    modifier = Modifier.size(28.dp),
                    contentScale = ContentScale.Fit
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = stringResource(id = R.string.app_name),
                    style = TextStyle(
                        color = loginDarkGreen,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Tea Garden Hills Card ──
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent)
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    Image(
                        painter = painterResource(id = R.drawable.tea_garden),
                        contentDescription = "Tea Garden Hills",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    
                    // Dark Overlay for readability
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))
                                )
                            )
                    )
                    
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.SpaceBetween,
                        horizontalAlignment = Alignment.Start
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50.dp))
                                .background(loginDarkGreen)
                                .padding(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "SMART CITY INITIATIVE",
                                style = TextStyle(
                                    color = Color.White,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 0.5.sp
                                )
                            )
                        }
                        
                        Text(
                            text = "Complete Profile",
                            style = TextStyle(
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Intro Text ──
            Text(
                text = "Join the digital monolith of Assam. Your profile details ensure accountable and high-impact civic reporting.",
                style = TextStyle(
                    color = loginDarkGreen.copy(alpha = 0.7f),
                    fontSize = 15.sp,
                    lineHeight = 22.sp,
                    fontWeight = FontWeight.Normal
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ── Inputs ──
            ProfileInputField(
                value = fullName,
                onValueChange = { fullName = it },
                label = "FULL NAME",
                placeholder = "Arjun Baruah",
                leadingIcon = Icons.Default.AssignmentInd
            )

            ProfileInputField(
                value = username,
                onValueChange = { username = it },
                label = "USERNAME",
                placeholder = "arjun_x",
                leadingIcon = Icons.Default.AlternateEmail
            )

            ProfileInputField(
                value = email,
                onValueChange = { email = it },
                label = "EMAIL ADDRESS",
                placeholder = "arjun@xazag.gov.in",
                leadingIcon = Icons.Default.Email,
                keyboardType = KeyboardType.Email
            )

            if (!isEmailValid) {
                Text(
                    text = "Please enter a valid email address",
                    color = Color(0xFFD32F2F),
                    fontSize = 12.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp, start = 4.dp)
                )
            }

            // ── Civic Responsibility Charter Banner ──
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.3f)),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.5f))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(loginDarkGreen.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = null,
                            tint = loginDarkGreen,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "By proceeding, you agree to our Civic Responsibility Charter. Data is stored on decentralized smart-city infrastructure.",
                        style = TextStyle(
                            color = loginDarkGreen.copy(alpha = 0.7f),
                            fontSize = 12.sp,
                            lineHeight = 16.sp,
                            fontWeight = FontWeight.Medium
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // ── Button ──
            Button(
                onClick = {
                    if (isFormValid) {
                        loading = true
                        scope.launch {
                            delay(1200)
                            loading = false
                            onRegistrationSuccess("mock-jwt-token-new-user-456")
                        }
                    }
                },
                enabled = isFormValid && !loading,
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = loginDarkGreen,
                    contentColor = Color.White,
                    disabledContainerColor = loginDarkGreen.copy(alpha = 0.3f),
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
                            text = "Start Reporting",
                            style = TextStyle(
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.5.sp
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
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun ProfileInputField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    leadingIcon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboardType: KeyboardType = KeyboardType.Text
) {
    val isDark = isSystemInDarkTheme()
    val loginDarkGreen = if (isDark) MaterialTheme.colorScheme.primary else com.axomprahari.ui.theme.loginDarkGreen
    val loginInputBackground = if (isDark) MaterialTheme.colorScheme.surfaceVariant else com.axomprahari.ui.theme.loginInputBackground

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
        horizontalAlignment = Alignment.Start
    ) {
        Text(
            text = label,
            style = TextStyle(
                color = loginDarkGreen.copy(alpha = 0.5f),
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
                .background(loginInputBackground)
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = leadingIcon,
                contentDescription = null,
                tint = loginDarkGreen.copy(alpha = 0.6f),
                modifier = Modifier.size(20.dp)
            )

            Spacer(modifier = Modifier.width(12.dp))

            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                textStyle = TextStyle(
                    color = loginDarkGreen,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium
                ),
                keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                decorationBox = { innerTextField ->
                    if (value.isEmpty()) {
                        Text(
                            text = placeholder,
                            color = loginDarkGreen.copy(alpha = 0.4f),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Normal
                        )
                    }
                    innerTextField()
                }
            )
        }
    }
}
