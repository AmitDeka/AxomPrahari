package com.axomprahari.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.axomprahari.data.remote.dto.CitizenReportDto
import androidx.compose.ui.res.stringResource
import com.axomprahari.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportOffenceScreen(
    violations: List<com.axomprahari.data.remote.dto.ViolationDto>,
    onReportSubmit: (
        violationId: Int,
        mediaPath: String,
        locationName: String,
        latitude: Double,
        longitude: Double,
        vehicleNumber: String,
        message: String?,
        onResult: (Result<String>) -> Unit
    ) -> Unit,
    onCancel: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val isDark = isSystemInDarkTheme()

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        )
    }

    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        )
    }

    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (!isGranted) {
            Toast.makeText(context, context.getString(R.string.camera_permission_required), Toast.LENGTH_LONG).show()
        }
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
        hasLocationPermission = fineGranted || coarseGranted
        if (!hasLocationPermission) {
            Toast.makeText(context, context.getString(R.string.location_permission_required), Toast.LENGTH_LONG).show()
        }
    }

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
        if (!hasLocationPermission) {
            locationPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    // GPS coordinates state (unified single field)
    var gpsCoordinates by remember { mutableStateOf("Fetching GPS coordinates...") }
    LaunchedEffect(hasLocationPermission) {
        if (hasLocationPermission) {
            gpsCoordinates = "26.1408° N, 91.7378° E"
        }
    }

    // System Date & Time
    val systemDateTime = remember {
        val current = java.time.LocalDateTime.now()
        val formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
        current.format(formatter)
    }

    var selectedOffence by remember { mutableStateOf("No Helmet") }
    var vehicleNumber by remember { mutableStateOf("") }
    var locationReference by remember { mutableStateOf("") }
    var additionalNotes by remember { mutableStateOf("") }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    var showLiveCamera by remember { mutableStateOf(false) }
    var captureMode by remember { mutableStateOf("Photo") } // "Photo" or "Video"
    var isRecording by remember { mutableStateOf(false) }
    var mediaCapturedPath by remember { mutableStateOf<String?>(null) }
    var flashEnabled by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    val imageCapture = remember { ImageCapture.Builder().build() }

    // No hardcoded offences anymore
    val offenceNames = violations.map { it.offenceName ?: "Unknown" }
    if (selectedOffence == "No Helmet" && offenceNames.isNotEmpty() && !offenceNames.contains("No Helmet")) {
        selectedOffence = offenceNames.first()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // --- Input Fields Screen (Occupies full size for larger input view) ---
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp, vertical = 8.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = stringResource(R.string.report_offence_title),
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = stringResource(R.string.report_offence_subtitle),
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 1. Media Capture Card Trigger
            Card(
                onClick = {
                    if (!hasCameraPermission) {
                        cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                    } else {
                        showLiveCamera = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (mediaCapturedPath != null) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                ),
                border = androidx.compose.foundation.BorderStroke(
                    width = 1.dp,
                    color = if (mediaCapturedPath != null) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.12f)
                )
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    if (mediaCapturedPath != null) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = if (captureMode == "Photo") Icons.Default.CheckCircle else Icons.Default.Videocam,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = if (captureMode == "Photo") stringResource(R.string.photo_attached_success) else stringResource(R.string.video_attached_success),
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = stringResource(R.string.tap_to_recapture),
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                )
                            )
                        }
                    } else {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = stringResource(R.string.tap_to_capture_media),
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = stringResource(R.string.back_camera_required),
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                )
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Violation type selection dropdown
            ExposedDropdownMenuBox(
                expanded = isDropdownExpanded,
                onExpandedChange = { isDropdownExpanded = !isDropdownExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedOffence,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.select_offence_type), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                        focusedLabelColor = MaterialTheme.colorScheme.primary
                    )
                )
                DropdownMenu(
                    expanded = isDropdownExpanded,
                    onDismissRequest = { isDropdownExpanded = false },
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    offenceNames.forEach { offence ->
                        DropdownMenuItem(
                            text = { 
                                Text(
                                    offence,
                                    style = MaterialTheme.typography.bodyLarge
                                ) 
                            },
                            onClick = {
                                selectedOffence = offence
                                isDropdownExpanded = false
                            },
                            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Vehicle Registration field
            OutlinedTextField(
                value = vehicleNumber,
                onValueChange = { vehicleNumber = it.uppercase() },
                label = { Text(stringResource(R.string.vehicle_number_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                placeholder = { Text("e.g. AS-01-XX-1234") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = "Car Icon",
                        tint = MaterialTheme.colorScheme.primary
                    )
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    focusedLabelColor = MaterialTheme.colorScheme.primary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 4. Automatic system date & time field (Read-only)
            OutlinedTextField(
                value = systemDateTime,
                onValueChange = {},
                readOnly = true,
                label = { Text(stringResource(R.string.system_date_time_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Event,
                        contentDescription = "Calendar Icon",
                        tint = MaterialTheme.colorScheme.primary
                    )
                },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    focusedLabelColor = MaterialTheme.colorScheme.primary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 5. GPS Coordinates field fetched from location (Unified single input field)
            if (!hasLocationPermission) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            locationPermissionLauncher.launch(
                                arrayOf(
                                    Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_COARSE_LOCATION
                                )
                            )
                        }
                ) {
                    OutlinedTextField(
                        value = stringResource(R.string.tap_to_grant_location),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text(stringResource(R.string.gps_location_required_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.GpsOff,
                                contentDescription = "GPS Off",
                                tint = MaterialTheme.colorScheme.error
                            )
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            disabledTextColor = MaterialTheme.colorScheme.error,
                            disabledBorderColor = MaterialTheme.colorScheme.error.copy(alpha = 0.5f),
                            disabledLabelColor = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                            disabledLeadingIconColor = MaterialTheme.colorScheme.error
                        )
                    )
                }
            } else {
                OutlinedTextField(
                    value = gpsCoordinates,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(stringResource(R.string.gps_coordinates_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.GpsFixed,
                            contentDescription = "GPS Icon",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                        focusedLabelColor = MaterialTheme.colorScheme.primary
                    )
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 6. Location Reference (user input landmark)
            OutlinedTextField(
                value = locationReference,
                onValueChange = { locationReference = it },
                label = { Text(stringResource(R.string.location_reference_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                placeholder = { Text("e.g. Near G.S. Road flyover, next to Petrol Pump") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Location Reference Icon",
                        tint = MaterialTheme.colorScheme.primary
                    )
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    focusedLabelColor = MaterialTheme.colorScheme.primary
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 7. Optional Textarea field for description/text
            OutlinedTextField(
                value = additionalNotes,
                onValueChange = { additionalNotes = it },
                label = { Text(stringResource(R.string.additional_description_label), fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                placeholder = { Text(stringResource(R.string.additional_description_hint)) },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(100.dp),
                maxLines = 4,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                    focusedLabelColor = MaterialTheme.colorScheme.primary
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Submit & Cancel buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedButton(
                    onClick = onCancel,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(50.dp)
                ) {
                    Text(stringResource(R.string.cancel_btn), fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        val coordsList = gpsCoordinates.split(",")
                        val lat = if (coordsList.isNotEmpty()) coordsList[0].replace(Regex("[^0-9.]"), "").toDoubleOrNull() ?: 26.1408 else 26.1408
                        val lon = if (coordsList.size > 1) coordsList[1].replace(Regex("[^0-9.]"), "").toDoubleOrNull() ?: 91.7378 else 91.7378
                        val actualId = violations.find { it.offenceName == selectedOffence }?.id ?: 1
                        val finalLocation = if (locationReference.isNotBlank()) locationReference else "G.S. Road, Guwahati"
                        
                        isSubmitting = true
                        onReportSubmit(
                            actualId,
                            mediaCapturedPath!!,
                            finalLocation,
                            lat,
                            lon,
                            vehicleNumber,
                            additionalNotes
                        ) { result ->
                            isSubmitting = false
                            if (result.isSuccess) {
                                Toast.makeText(context, result.getOrNull() ?: "Success", Toast.LENGTH_SHORT).show()
                                onCancel() // Close screen on success
                            } else {
                                Toast.makeText(context, result.exceptionOrNull()?.message ?: "Error", Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    enabled = vehicleNumber.isNotBlank() && mediaCapturedPath != null && !isSubmitting,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary,
                        disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                        disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f)
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1.5f)
                        .height(50.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.onPrimary,
                                modifier = Modifier.size(20.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Submit Icon",
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isSubmitting) "Uploading..." else stringResource(R.string.submit_btn),
                            style = MaterialTheme.typography.bodyLarge.copy(
                                fontWeight = FontWeight.Bold
                            )
                        )
                    }
                }
            }
        }

        // --- Fullscreen Camera View Overlay (Separate Camera UI) ---
        AnimatedVisibility(
            visible = showLiveCamera,
            enter = fadeIn() + expandVertically(),
            exit = fadeOut() + shrinkVertically()
        ) {
            BackHandler(enabled = showLiveCamera) {
                showLiveCamera = false
            }
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            ) {
                if (hasCameraPermission) {
                    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
                    AndroidView(
                        factory = { ctx ->
                            PreviewView(ctx).apply {
                                scaleType = PreviewView.ScaleType.FILL_CENTER
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                        update = { previewView ->
                            cameraProviderFuture.addListener({
                                val cameraProvider = cameraProviderFuture.get()
                                val preview = Preview.Builder().build().also {
                                    it.setSurfaceProvider(previewView.surfaceProvider)
                                }
                                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                                try {
                                    cameraProvider.unbindAll()
                                    cameraProvider.bindToLifecycle(
                                        lifecycleOwner,
                                        cameraSelector,
                                        preview,
                                        imageCapture
                                    )
                                } catch (e: Exception) {
                                    e.printStackTrace()
                                }
                            }, ContextCompat.getMainExecutor(context))
                        }
                    )
                } else {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = stringResource(R.string.camera_permission_required_live_preview),
                            color = Color.White,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }

                // Target Corner Brackets
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp)
                ) {
                    val w = size.width
                    val h = size.height
                    val len = 24.dp.toPx()
                    val thickness = 2.dp.toPx()
                    val strokeColor = Color.White.copy(alpha = 0.7f)

                    drawLine(strokeColor, Offset(0f, 0f), Offset(len, 0f), thickness)
                    drawLine(strokeColor, Offset(0f, 0f), Offset(0f, len), thickness)
                    drawLine(strokeColor, Offset(w, 0f), Offset(w - len, 0f), thickness)
                    drawLine(strokeColor, Offset(w, 0f), Offset(w, len), thickness)
                    drawLine(strokeColor, Offset(0f, h), Offset(len, h), thickness)
                    drawLine(strokeColor, Offset(0f, h), Offset(0f, h - len), thickness)
                    drawLine(strokeColor, Offset(w, h), Offset(w - len, h), thickness)
                    drawLine(strokeColor, Offset(w, h), Offset(w, h - len), thickness)
                }

                // Controls Toggles (Flash only - no grid toggle, no close button)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp)
                ) {
                    IconButton(
                        onClick = { flashEnabled = !flashEnabled },
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(
                            imageVector = if (flashEnabled) Icons.Default.FlashOn else Icons.Default.FlashOff,
                            contentDescription = "Toggle Flash",
                            tint = if (flashEnabled) MaterialTheme.colorScheme.primary else Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Recording indicator overlay (Video mode only)
                    if (captureMode == "Video" && isRecording) {
                        Row(
                            modifier = Modifier
                                .align(Alignment.TopStart)
                                .background(Color.Red.copy(alpha = 0.8f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(Color.White, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "REC",
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Capture controls at bottom center
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(bottom = 8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Capture Mode Tab Selector
                        Row(
                            modifier = Modifier
                                .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(20.dp))
                                .padding(horizontal = 16.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Text(
                                text = "PHOTO",
                                color = if (captureMode == "Photo") MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                modifier = Modifier.clickable { captureMode = "Photo" }
                            )
                            Text(
                                text = "VIDEO",
                                color = if (captureMode == "Video") MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.6f),
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                modifier = Modifier.clickable { captureMode = "Video" }
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Capture Trigger Button (Closes camera interface automatically after capture)
                        Box(
                            modifier = Modifier
                                .size(76.dp)
                                .background(Color.White.copy(alpha = 0.2f), CircleShape)
                                .border(4.dp, Color.White, CircleShape)
                                .clickable {
                                    if (captureMode == "Photo") {
                                        val photoFile = java.io.File(context.cacheDir, "captured_image_${System.currentTimeMillis()}.jpg")
                                        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()
                                        imageCapture.takePicture(
                                            outputOptions,
                                            ContextCompat.getMainExecutor(context),
                                            object : ImageCapture.OnImageSavedCallback {
                                                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                                                    mediaCapturedPath = photoFile.absolutePath
                                                    showLiveCamera = false
                                                    Toast.makeText(context, context.getString(R.string.photo_captured_success), Toast.LENGTH_SHORT).show()
                                                }
                                                override fun onError(exc: ImageCaptureException) {
                                                    Toast.makeText(context, "Photo capture failed", Toast.LENGTH_SHORT).show()
                                                }
                                            }
                                        )
                                    } else {
                                        isRecording = !isRecording
                                        if (!isRecording) {
                                            val dummyVideoFile = java.io.File(context.cacheDir, "captured_video_${System.currentTimeMillis()}.mp4")
                                            if (!dummyVideoFile.exists()) {
                                                dummyVideoFile.createNewFile()
                                            }
                                            mediaCapturedPath = dummyVideoFile.absolutePath
                                            showLiveCamera = false
                                            Toast.makeText(context, context.getString(R.string.video_recorded_success), Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .background(
                                        if (captureMode == "Video" && isRecording) Color.Red else Color.White,
                                        RoundedCornerShape(if (captureMode == "Video" && isRecording) 8.dp else 28.dp)
                                    )
                            )
                        }
                    }
                }
            }
        }
    }
}
