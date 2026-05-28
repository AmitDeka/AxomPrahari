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

data class ApiErrorDetail(
    @SerializedName("message") val message: String? = null
)

/** Generic error shape returned by the API */
data class ApiErrorResponse(
    @SerializedName("error") val error: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("errors") val errors: List<ApiErrorDetail>? = null
) {
    fun readable(): String {
        val baseMessage = error ?: message ?: "An unexpected error occurred"
        if (!errors.isNullOrEmpty()) {
            val details = errors.mapNotNull { it.message }.joinToString(", ")
            return "$baseMessage: $details"
        }
        return baseMessage
    }
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

data class ReportStats(
    @SerializedName("total") val total: Int,
    @SerializedName("pending") val pending: Int,
    @SerializedName("accepted") val accepted: Int,
    @SerializedName("rejected") val rejected: Int
)

data class CitizenDashboardData(
    @SerializedName("title") val title: String,
    @SerializedName("user") val user: UserProfile,
    @SerializedName("report_stats") val reportStats: ReportStats? = null
)

data class CitizenDashboardResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CitizenDashboardData
)

data class UpdateProfileRequest(
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String,
    @SerializedName("username") val username: String
)

data class UpdateProfileResponse(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: UserProfile
)

data class ViolationDto(
    @SerializedName("id") val id: Int,
    @SerializedName("offence_name") val offenceName: String?,
    @SerializedName("mv_act_code") val mvActCode: String?,
    @SerializedName("penalty") val penalty: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("evidence_requirement") val evidenceRequirement: String?
)

data class CitizenViolationsResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: List<ViolationDto>
)

data class CitizenReportDto(
    @SerializedName("id") val id: Int,
    @SerializedName("report_id") val reportId: String,
    @SerializedName("offence_name") val offenceName: String?,
    @SerializedName("location_name") val locationName: String?,
    @SerializedName("incident_date") val incidentDate: String?,
    @SerializedName("incident_time") val incidentTime: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("media_url") val mediaUrl: String?,
    @SerializedName("vehicle_number") val vehicleNumber: String?,
    @SerializedName("message") val message: String?,
    @SerializedName("admin_message") val adminMessage: String?,
    @SerializedName("latitude") val latitude: String?,
    @SerializedName("longitude") val longitude: String?,
    @SerializedName("created_at") val createdAt: String?
)

data class CitizenReportsData(
    @SerializedName("reports") val reports: List<CitizenReportDto>,
    @SerializedName("totalCount") val totalCount: Int
)

data class CitizenReportsResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: CitizenReportsData
)
