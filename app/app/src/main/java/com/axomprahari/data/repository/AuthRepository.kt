package com.axomprahari.data.repository

import com.axomprahari.data.remote.ApiService
import com.axomprahari.data.remote.dto.*
import com.google.gson.Gson
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: ApiService
) {

    private val gson = Gson()

    /** Parses raw error body JSON into a readable message */
    private fun parseError(errorBody: String?): String {
        if (errorBody.isNullOrBlank()) return "An unexpected error occurred"
        return try {
            gson.fromJson(errorBody, ApiErrorResponse::class.java).readable()
        } catch (e: Exception) {
            "An unexpected error occurred"
        }
    }

    suspend fun requestOtp(phoneNumber: String): Result<String> = runCatching {
        val response = api.requestOtp(RequestOtpRequest(phoneNumber))
        if (response.isSuccessful) {
            response.body()?.message ?: "OTP sent successfully"
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun verifyOtp(phoneNumber: String, otp: String): Result<VerifyOtpResponse> = runCatching {
        val response = api.verifyOtp(VerifyOtpRequest(phoneNumber, otp))
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response from server")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun completeProfile(
        token: String,
        fullName: String,
        email: String,
        username: String
    ): Result<String> = runCatching {
        val response = api.completeProfile(
            bearerToken = "Bearer $token",
            body = CompleteProfileRequest(fullName, email, username)
        )
        if (response.isSuccessful) {
            response.body()?.token ?: throw Exception("No token in response")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun getCitizenDashboard(token: String): Result<CitizenDashboardResponse> = runCatching {
        val response = api.getCitizenDashboard("Bearer $token")
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response from server")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }
}
