package com.axomprahari.data.repository

import com.axomprahari.data.remote.ApiService
import com.axomprahari.data.remote.dto.*
import com.google.gson.Gson
import javax.inject.Inject
import javax.inject.Singleton
import android.content.Context
import android.net.Uri
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody


import dagger.hilt.android.qualifiers.ApplicationContext

@Singleton
class AuthRepository @Inject constructor(
    private val api: ApiService,
    @ApplicationContext private val context: Context
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
            if (response.code() == 401) throw Exception("HTTP 401 Unauthorized")
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun getCitizenViolations(token: String): Result<CitizenViolationsResponse> = runCatching {
        val response = api.getCitizenViolations("Bearer $token")
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response from server")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun getCitizenReports(token: String): Result<CitizenReportsResponse> = runCatching {
        val response = api.getCitizenReports("Bearer $token")
        if (response.isSuccessful) {
            response.body() ?: throw Exception("Empty response from server")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun updateProfile(
        token: String,
        fullName: String,
        email: String,
        username: String
    ): Result<UserProfile> = runCatching {
        val response = api.updateProfile(
            bearerToken = "Bearer $token",
            body = UpdateProfileRequest(fullName, email, username)
        )
        if (response.isSuccessful) {
            response.body()?.data ?: throw Exception("Empty response data from server")
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun submitFeedback(
        token: String,
        citizenId: String,
        category: String,
        message: String,
        imageKey: String?,
        imageUrl: String?
    ): Result<String> = runCatching {
        val response = api.submitFeedback(
            bearerToken = "Bearer $token",
            body = FeedbackRequest(
                citizen_id = citizenId,
                feedback_category = category,
                message = message,
                image_key = imageKey,
                image_url = imageUrl
            )
        )
        if (response.isSuccessful) {
            response.body()?.message ?: "Feedback submitted successfully"
        } else {
            throw Exception(parseError(response.errorBody()?.string()))
        }
    }

    suspend fun uploadMedia(token: String, uriString: String): Result<Pair<String, String>> {
        return try {
            val uri = Uri.parse(uriString)
            val contentResolver = context.contentResolver
            val mimeType = contentResolver.getType(uri) ?: "application/octet-stream"
            
            // 1. Get Presigned URL
            val presignedResponse = api.getPresignedUrl("Bearer $token", mimeType, "feedback")
            if (!presignedResponse.isSuccessful || presignedResponse.body()?.data == null) {
                return Result.failure(Exception(parseError(presignedResponse.errorBody()?.string())))
            }
            
            val presignedData = presignedResponse.body()!!.data!!
            
            // 2. Read file bytes
            val inputStream = contentResolver.openInputStream(uri)
            val bytes = inputStream?.readBytes()
            inputStream?.close()
            
            if (bytes == null) {
                return Result.failure(Exception("Could not read file from device"))
            }
            
            // 3. Upload to R2
            val requestBody = bytes.toRequestBody(mimeType.toMediaTypeOrNull())
            val uploadResponse = api.uploadFileToR2(presignedData.uploadUrl, requestBody)
            
            if (!uploadResponse.isSuccessful) {
                return Result.failure(Exception("Failed to upload image to server"))
            }
            
            Result.success(Pair(presignedData.fileKey, presignedData.fileUrl))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(e)
        }
    }
}
