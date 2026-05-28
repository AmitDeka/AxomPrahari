package com.axomprahari.data.remote.dto

import com.google.gson.annotations.SerializedName

data class CitizenReportRequestDto(
    @SerializedName("violation_id")
    val violationId: Int,
    
    @SerializedName("media_url")
    val mediaUrl: String,
    
    @SerializedName("location_name")
    val locationName: String,
    
    val latitude: Double,
    val longitude: Double,
    
    @SerializedName("vehicle_number")
    val vehicleNumber: String,
    
    @SerializedName("incident_date")
    val incidentDate: String,
    
    @SerializedName("incident_time")
    val incidentTime: String,
    
    val message: String? = null
)
