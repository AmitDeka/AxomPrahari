package com.axomprahari.data.remote.dto

data class FeedbackRequest(
    val citizen_id: String,
    val feedback_category: String,
    val message: String,
    val image_key: String? = null,
    val image_url: String? = null
)
