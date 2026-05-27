package com.axomprahari.data.remote.dto

data class PresignedUrlResponse(
    val status: String,
    val data: PresignedUrlData?
)

data class PresignedUrlData(
    val uploadUrl: String,
    val fileKey: String,
    val fileUrl: String
)
