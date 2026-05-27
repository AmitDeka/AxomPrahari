package com.axomprahari.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.ClickableText
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import com.axomprahari.R
import com.axomprahari.data.remote.dto.VerifyOtpResponse
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun VerifyOtpScreen(
    phone: String,
    onVerifyOtp: suspend (String, String) -> Result<VerifyOtpResponse>,
    onLoginSuccess: (String) -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateBack: () -> Unit,
    onNavigateToPrivacyPolicy: () -> Unit,
    onNavigateToTermsOfService: () -> Unit
) {
    val context = LocalContext.current
    val isDark = isSystemInDarkTheme()
    val LoginDarkGreen = MaterialTheme.colorScheme.primary
    val LoginBgTop = MaterialTheme.colorScheme.background
    val LoginBgBottom = MaterialTheme.colorScheme.surfaceContainerLowest
    val InputBackground = MaterialTheme.colorScheme.surfaceVariant
    var code by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var countdown by remember { mutableStateOf(59) }
    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    val keyboardController = LocalSoftwareKeyboardController.current
    val focusRequester = remember { FocusRequester() }

    val maxCodeLength = 6
    val isValid = code.length == maxCodeLength && code.all { it.isDigit() }

    LaunchedEffect(countdown) {
        if (countdown > 0) {
            delay(1000)
            countdown--
        }
    }

    // Auto-focus on keyboard entry
    LaunchedEffect(Unit) {
        delay(300)
        focusRequester.requestFocus()
    }

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

        BoxWithConstraints(
            modifier = Modifier.fillMaxSize().statusBarsPadding()
        ) {
            val minHeight = maxHeight
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .imePadding()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = minHeight)
                        .padding(horizontal = 24.dp, vertical = 16.dp),
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

            // ── Headers ──
            Text(
                text = stringResource(R.string.ver_otp_verify_phone_title),
                style = TextStyle(
                    color = LoginDarkGreen,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = stringResource(R.string.ver_otp_enter_code_subtitle),
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.6f),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Normal
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Masked phone & change button
            val maskedPhone = if (phone.length >= 3) {
                "+91 ••••• ••${phone.takeLast(3)}"
            } else {
                "+91 ••••• ••$phone"
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = maskedPhone,
                    style = TextStyle(
                        color = LoginDarkGreen,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                )

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = stringResource(R.string.ver_otp_btn_change),
                    style = TextStyle(
                        color = LoginDarkGreen,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp
                    ),
                    modifier = Modifier
                        .clickable { onNavigateBack() }
                        .padding(4.dp)
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // ── Hidden Text Field for Input ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        focusRequester.requestFocus() 
                        keyboardController?.show()
                    },
                contentAlignment = Alignment.Center
            ) {
                BasicTextField(
                    value = code,
                    onValueChange = { input ->
                        if (input.length <= maxCodeLength && input.all { it.isDigit() }) {
                            code = input
                        }
                    },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier
                        .size(1.dp)
                        .focusRequester(focusRequester)
                        .alpha(0f)
                )

                // Visual boxes
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .widthIn(max = 400.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    for (i in 0 until maxCodeLength) {
                        val char = code.getOrNull(i)
                        val isFocused = code.length == i
                        
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .aspectRatio(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(InputBackground)
                                .border(
                                    width = if (isFocused) 1.5.dp else 0.dp,
                                    color = if (isFocused) LoginDarkGreen else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (char != null) {
                                Text(
                                    text = char.toString(),
                                    style = TextStyle(
                                        color = LoginDarkGreen,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                )
                            } else {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(LoginDarkGreen.copy(alpha = 0.35f))
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // ── Resend Card Pill ──
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50.dp))
                    .background(if (isDark) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.5f))
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Timer,
                        contentDescription = null,
                        tint = LoginDarkGreen.copy(alpha = 0.6f),
                        modifier = Modifier.size(14.dp)
                    )
                     Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "${stringResource(R.string.ver_otp_resend_in)} 0:${countdown.toString().padStart(2, '0')}",
                        style = TextStyle(
                            color = LoginDarkGreen.copy(alpha = 0.7f),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // RESEND CODE text button
            val canResend = countdown == 0
            Text(
                text = stringResource(R.string.ver_otp_btn_resend_code),
                style = TextStyle(
                    color = if (canResend) LoginDarkGreen else LoginDarkGreen.copy(alpha = 0.3f),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                ),
                modifier = Modifier
                    .clickable(enabled = canResend) {
                        countdown = 59
                        code = ""
                    }
                    .padding(8.dp)
            )

            Spacer(modifier = Modifier.height(36.dp))

            // ── Button ──
            Button(
                onClick = {
                    if (isValid) {
                        loading = true
                        scope.launch {
                            val result = onVerifyOtp(phone, code)
                            loading = false
                            result.onSuccess { response ->
                                if (response.isNewUser) {
                                    Toast.makeText(context, context.getString(R.string.ver_otp_toast_welcome_profile), Toast.LENGTH_SHORT).show()
                                    onNavigateToProfile()
                                } else {
                                    Toast.makeText(context, context.getString(R.string.ver_otp_toast_verify_success), Toast.LENGTH_SHORT).show()
                                    onLoginSuccess(response.token)
                                }
                            }.onFailure { error ->
                                Toast.makeText(context, error.message ?: context.getString(R.string.ver_otp_toast_verify_failed), Toast.LENGTH_LONG).show()
                            }
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
                            text = stringResource(R.string.ver_otp_btn_verify_proceed),
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

            Spacer(modifier = Modifier.weight(1f))

            Spacer(modifier = Modifier.height(12.dp))

            // ── Terms & Privacy Footer ──
            val annotatedText = buildAnnotatedString {
                append(stringResource(R.string.ver_otp_terms_agree))
                
                pushStringAnnotation(tag = "TERMS", annotation = "terms")
                withStyle(style = SpanStyle(color = LoginDarkGreen, fontWeight = FontWeight.Bold)) {
                    append(stringResource(R.string.ver_otp_terms_of_service))
                }
                pop()
                
                append(stringResource(R.string.ver_otp_and))
                
                pushStringAnnotation(tag = "PRIVACY", annotation = "privacy")
                withStyle(style = SpanStyle(color = LoginDarkGreen, fontWeight = FontWeight.Bold)) {
                    append(stringResource(R.string.ver_otp_privacy_policy))
                }
                pop()
                
                append(".")
            }

            ClickableText(
                text = annotatedText,
                style = TextStyle(
                    color = LoginDarkGreen.copy(alpha = 0.45f),
                    fontSize = 11.sp,
                    lineHeight = 16.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center
                ),
                modifier = Modifier.padding(horizontal = 16.dp),
                onClick = { offset ->
                    annotatedText.getStringAnnotations(tag = "TERMS", start = offset, end = offset)
                        .firstOrNull()?.let {
                            onNavigateToTermsOfService()
                        }
                    annotatedText.getStringAnnotations(tag = "PRIVACY", start = offset, end = offset)
                        .firstOrNull()?.let {
                            onNavigateToPrivacyPolicy()
                        }
                }
            )
            Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}
