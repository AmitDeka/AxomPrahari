package com.axomprahari.data.remote.dto

data class FeedbackResponse(
    val message: String,
    val feedback: FeedbackDto? = null
)

data class FeedbackDto(
    val id: Int,
    val citizen_id: String,
    val feedback_category: String,
    val message: String,
    val image_key: String?,
    val image_url: String?,
    val created_at: String
)
