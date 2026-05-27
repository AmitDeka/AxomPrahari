package com.axomprahari.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import com.axomprahari.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import androidx.compose.foundation.isSystemInDarkTheme

@Composable
fun SplashScreen(onAnimationComplete: () -> Unit) {
    val isDark = isSystemInDarkTheme()
    val SplashDarkGreen = MaterialTheme.colorScheme.primary
    val SplashBgTop = MaterialTheme.colorScheme.background
    val SplashBgBottom = MaterialTheme.colorScheme.surfaceContainerLowest
    // Animations
    val logoScale = remember { Animatable(1f) }
    val logoAlpha = remember { Animatable(1f) }
    val textAlpha = remember { Animatable(0f) }
    val progressAnim = remember { Animatable(0f) }
    val footerAlpha = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        // Text fade-in after short delay
        launch {
            delay(300)
            textAlpha.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = 500)
            )
        }

        // Footer fade-in
        launch {
            delay(400)
            footerAlpha.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = 600)
            )
        }

        // Progress bar animation
        delay(200)
        progressAnim.animateTo(
            targetValue = 1f,
            animationSpec = tween(
                durationMillis = 1400,
                easing = FastOutSlowInEasing
            )
        )
        delay(200)
        onAnimationComplete()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(SplashBgTop, SplashBgBottom)
                )
            )
    ) {
        // Centered content
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 40.dp)
        ) {
            Spacer(modifier = Modifier.weight(1f))

            // ── App Logo ──
            // White rounded container with shadow, holding the actual logo PNG
            Box(
                modifier = Modifier
                    .scale(logoScale.value)
                    .alpha(logoAlpha.value)
                    .shadow(
                        elevation = 24.dp,
                        ambientColor = Color.Black.copy(alpha = 0.01f),
                        spotColor = Color.Black.copy(alpha = 0.01f)
                    )
                    .size(160.dp),
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
                text = stringResource(R.string.splash_app_name),
                style = MaterialTheme.typography.headlineLarge.copy(
                    color = SplashDarkGreen,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 2.sp,
                    fontSize = 30.sp
                ),
                modifier = Modifier.alpha(textAlpha.value)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // ── Tagline ──
            Text(
                text = stringResource(R.string.splash_tagline),
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = SplashDarkGreen.copy(alpha = 0.6f),
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 4.sp,
                    fontSize = 13.sp
                ),
                modifier = Modifier.alpha(textAlpha.value)
            )

            Spacer(modifier = Modifier.height(48.dp))

            // ── Progress Bar ──
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(SplashDarkGreen.copy(alpha = 0.1f))
                    .alpha(textAlpha.value)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(fraction = progressAnim.value)
                        .clip(RoundedCornerShape(2.dp))
                        .background(SplashDarkGreen)
                )
            }

            Spacer(modifier = Modifier.weight(1f))
        }

        // ── Footer ──
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp)
                .fillMaxWidth()
                .alpha(footerAlpha.value),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            // Left decorative line
            Box(
                modifier = Modifier
                    .width(24.dp)
                    .height(1.dp)
                    .background(SplashDarkGreen.copy(alpha = 0.2f))
            )

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = stringResource(R.string.splash_footer),
                style = MaterialTheme.typography.labelSmall.copy(
                    color = SplashDarkGreen.copy(alpha = 0.45f),
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 2.sp,
                    fontSize = 10.sp
                ),
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.width(12.dp))

            // Right decorative line
            Box(
                modifier = Modifier
                    .width(24.dp)
                    .height(1.dp)
                    .background(SplashDarkGreen.copy(alpha = 0.2f))
            )
        }
    }
}
