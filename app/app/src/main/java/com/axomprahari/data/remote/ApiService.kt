package com.axomprahari.data.remote

import com.axomprahari.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.GET
import retrofit2.http.POST

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
}
