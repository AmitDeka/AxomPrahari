package com.axomprahari.ui.theme

import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

data class CustomColors(
    val dashboardCardBg: Color = Color.Unspecified,
    val glassCardBg: Color = Color.Unspecified,
    val glassCardBorder: Color = Color.Unspecified,
    val subtleText: Color = Color.Unspecified,
    val subtleDivider: Color = Color.Unspecified
)

val LocalCustomColors = staticCompositionLocalOf { CustomColors() }
