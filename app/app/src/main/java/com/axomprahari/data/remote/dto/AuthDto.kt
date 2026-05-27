package com.axomprahari.data.remote.dto

import com.google.gson.annotations.SerializedName

// ── Request bodies ──────────────────────────────────────────

data class RequestOtpRequest(
    @SerializedName("phone_number") val phoneNumber: String
)

data class VerifyOtpRequest(
    @SerializedName("phone_number") val phoneNumber: String,
    @SerializedName("otp") val otp: String
)

data class CompleteProfileRequest(
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("username") val username: String
)

// ── Response bodies ─────────────────────────────────────────

data class RequestOtpResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String
)

data class VerifyOtpResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("token") val token: String,
    @SerializedName("isNewUser") val isNewUser: Boolean
)

data class CompleteProfileResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("token") val token: String
)

/** Generic error shape returned by the API */
data class ApiErrorResponse(
    @SerializedName("error") val error: String? = null,
    @SerializedName("message") val message: String? = null
) {
    fun readable(): String = error ?: message ?: "An unexpected error occurred"
}

data class UserProfile(
    @SerializedName("id") val id: String,
    @SerializedName("citizen_id") val citizenId: String,
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("username") val username: String,
    @SerializedName("role") val role: String,
    @SerializedName("is_active") val isActive: Boolean,
    @SerializedName("reward_points") val rewardPoints: Int,
    @SerializedName("phone_number") val phoneNumber: String? = null
)

data class CitizenDashboardData(
    @SerializedName("title") val title: String,
    @SerializedName("user") val user: UserProfile
)

data class CitizenDashboardResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CitizenDashboardData
)
