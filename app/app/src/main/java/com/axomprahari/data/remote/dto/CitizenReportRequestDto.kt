package com.axomprahari.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CitizenReportRequestDto(
    @SerialName("violation_id")
    val violationId: Int,
    
    @SerialName("media_url")
    val mediaUrl: String,
    
    @SerialName("location_name")
    val locationName: String,
    
    val latitude: Double,
    val longitude: Double,
    
    @SerialName("vehicle_number")
    val vehicleNumber: String,
    
    @SerialName("incident_date")
    val incidentDate: String,
    
    @SerialName("incident_time")
    val incidentTime: String,
    
    val message: String? = null
)
