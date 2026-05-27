package com.axomprahari.data.remote

import com.axomprahari.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {

    @POST("api/v1/auth/citizen/request-otp")
    suspend fun requestOtp(
        @Body body: RequestOtpRequest
    ): Response<RequestOtpResponse>

    @POST("api/v1/auth/citizen/verify-otp")
    suspend fun verifyOtp(
        @Body body: VerifyOtpRequest
    ): Response<VerifyOtpResponse>

    @POST("api/v1/auth/citizen/complete-profile")
    suspend fun completeProfile(
        @Header("Authorization") bearerToken: String,
        @Body body: CompleteProfileRequest
    ): Response<CompleteProfileResponse>

    @GET("api/v1/citizen/dashboard")
    suspend fun getCitizenDashboard(
        @Header("Authorization") bearerToken: String
    ): Response<CitizenDashboardResponse>

    @GET("api/v1/citizen/violations")
    suspend fun getCitizenViolations(
        @Header("Authorization") bearerToken: String
    ): Response<CitizenViolationsResponse>

    @GET("api/v1/citizen/reports")
    suspend fun getCitizenReports(
        @Header("Authorization") bearerToken: String
    ): Response<CitizenReportsResponse>

    @PUT("api/v1/citizen/profile")
    suspend fun updateProfile(
        @Header("Authorization") bearerToken: String,
        @Body body: UpdateProfileRequest
    ): Response<UpdateProfileResponse>

    @POST("api/v1/citizen/feedback")
    suspend fun submitFeedback(
        @Header("Authorization") bearerToken: String,
        @Body body: FeedbackRequest
    ): Response<FeedbackResponse>

    @GET("api/v1/citizen/reports/presigned-url")
    suspend fun getPresignedUrl(
        @Header("Authorization") bearerToken: String,
        @retrofit2.http.Query("fileType") fileType: String,
        @retrofit2.http.Query("folder") folder: String? = null
    ): Response<PresignedUrlResponse>

    @PUT
    suspend fun uploadFileToR2(
        @retrofit2.http.Url url: String,
        @Header("Content-Type") contentType: String,
        @Body file: okhttp3.RequestBody
    ): Response<Unit>
}
