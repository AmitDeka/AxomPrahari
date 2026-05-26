package com.axomprahari.data.model

data class TrafficReport(
    val id: String,
    val type: String,
    val location: String,
    val timestamp: String,
    val points: Int,
    val status: ReportStatus,
    val latitude: String = "26.1408° N",
    val longitude: String = "91.7378° E",
    val description: String = "",
    val mediaPath: String? = null,
    val userLocationName: String? = null
)

enum class ReportStatus {
    VERIFIED,
    UNDER_REVIEW,
    REJECTED
}
