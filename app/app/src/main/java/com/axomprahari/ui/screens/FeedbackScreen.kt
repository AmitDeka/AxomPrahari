package com.axomprahari.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.core.content.ContextCompat
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AddAPhoto
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.axomprahari.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    onSubmit: (String, String) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("Suggestion") }
    var feedbackMessage by remember { mutableStateOf("") }
    var isDropdownExpanded by remember { mutableStateOf(false) }
    var selectedPhotoUri by remember { mutableStateOf<android.net.Uri?>(null) }

    val context = LocalContext.current

    val categories = listOf(
        "Suggestion",
        "Bug Report",
        "App Performance",
        "Offence Verification",
        "Reward Points Issue",
        "Other"
    )

    var limitedPhotos by remember { mutableStateOf<List<android.net.Uri>>(emptyList()) }
    var showLimitedPhotosPicker by remember { mutableStateOf(false) }

    val loadLimitedPhotos = {
        val list = mutableListOf<android.net.Uri>()
        try {
            val projection = arrayOf(android.provider.MediaStore.Images.Media._ID)
            val sortOrder = "${android.provider.MediaStore.Images.Media.DATE_ADDED} DESC"
            context.contentResolver.query(
                android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                null,
                null,
                sortOrder
            )?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(android.provider.MediaStore.Images.Media._ID)
                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    val contentUri = android.content.ContentUris.withAppendedId(
                        android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                        id
                    )
                    list.add(contentUri)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        limitedPhotos = list
    }

    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: android.net.Uri? ->
        if (uri != null) {
            val mimeType = context.contentResolver.getType(uri)
            val allowedMimeTypes = listOf("image/png", "image/jpeg", "image/jpg", "image/webp")
            if (mimeType != null && mimeType in allowedMimeTypes) {
                val size = getUriSize(context, uri)
                if (size <= 5 * 1024 * 1024) {
                    selectedPhotoUri = uri
                    Toast.makeText(context, "Image attached successfully", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, "Image size exceeds the 5MB limit.", Toast.LENGTH_LONG).show()
                }
            } else {
                Toast.makeText(context, "Only PNG, JPG, JPEG, and WEBP images are allowed.", Toast.LENGTH_LONG).show()
            }
        }
    }

    val storagePermissionsList = remember {
        when {
            android.os.Build.VERSION.SDK_INT >= 34 -> {
                listOf(Manifest.permission.READ_MEDIA_IMAGES, Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED)
            }
            android.os.Build.VERSION.SDK_INT >= 33 -> {
                listOf(Manifest.permission.READ_MEDIA_IMAGES)
            }
            else -> {
                listOf(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }
    }

    val storagePermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissionsMap ->
        val hasFull = if (android.os.Build.VERSION.SDK_INT >= 33) {
            permissionsMap[Manifest.permission.READ_MEDIA_IMAGES] == true
        } else {
            permissionsMap[Manifest.permission.READ_EXTERNAL_STORAGE] == true
        }

        val hasLimited = if (android.os.Build.VERSION.SDK_INT >= 34) {
            permissionsMap[Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED] == true
        } else {
            false
        }

        if (hasFull) {
            imagePickerLauncher.launch("image/*")
        } else if (hasLimited) {
            loadLimitedPhotos()
            showLimitedPhotosPicker = true
        } else {
            Toast.makeText(context, "Permission required to access photos. Please enable it in App Settings.", Toast.LENGTH_LONG).show()
        }
    }

    val onPickPhoto = {
        val hasFull = if (android.os.Build.VERSION.SDK_INT >= 33) {
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED
        } else {
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
        }

        val hasLimited = if (android.os.Build.VERSION.SDK_INT >= 34) {
            ContextCompat.checkSelfPermission(context, Manifest.permission.READ_MEDIA_VISUAL_USER_SELECTED) == PackageManager.PERMISSION_GRANTED && !hasFull
        } else {
            false
        }

        if (hasFull) {
            imagePickerLauncher.launch("image/*")
        } else if (hasLimited) {
            loadLimitedPhotos()
            showLimitedPhotosPicker = true
        } else {
            storagePermissionLauncher.launch(storagePermissionsList.toTypedArray())
        }
    }

    val currentUri = selectedPhotoUri
    val selectedBitmap = remember(currentUri) {
        if (currentUri != null) {
            try {
                if (android.os.Build.VERSION.SDK_INT >= 28) {
                    val source = android.graphics.ImageDecoder.createSource(context.contentResolver, currentUri)
                    android.graphics.ImageDecoder.decodeBitmap(source)
                } else {
                    @Suppress("DEPRECATION")
                    android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, currentUri)
                }
            } catch (e: Throwable) {
                null
            }
        } else {
            null
        }
    }

    val isDark = isSystemInDarkTheme()
    val bgMainColor = MaterialTheme.colorScheme.background
    val cardContainerColor = MaterialTheme.colorScheme.surfaceVariant
    val cardAttachedColor = MaterialTheme.colorScheme.primaryContainer
    val primaryTextAccent = MaterialTheme.colorScheme.primary
    val inactiveTextAccent = MaterialTheme.colorScheme.onSurfaceVariant
    val dragDropBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.6f)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgMainColor)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Main Title & Description
            Text(
                text = "How can we improve?",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Your feedback helps us build a safer and smarter Assam. We value every detail you share.",
                style = MaterialTheme.typography.bodyMedium.copy(
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f),
                    lineHeight = 22.sp
                )
            )

            Spacer(modifier = Modifier.height(32.dp))

            // SELECT CATEGORY Section
            Text(
                text = "SELECT CATEGORY",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f),
                    letterSpacing = 0.8.sp
                )
            )
            Spacer(modifier = Modifier.height(8.dp))

            ExposedDropdownMenuBox(
                expanded = isDropdownExpanded,
                onExpandedChange = { isDropdownExpanded = !isDropdownExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedCategory,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded) },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = cardContainerColor,
                        unfocusedContainerColor = cardContainerColor,
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent,
                        focusedTextColor = MaterialTheme.colorScheme.onSurface,
                        unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                    )
                )
                ExposedDropdownMenu(
                    expanded = isDropdownExpanded,
                    onDismissRequest = { isDropdownExpanded = false }
                ) {
                    categories.forEach { option ->
                        DropdownMenuItem(
                            text = { Text(option) },
                            onClick = {
                                selectedCategory = option
                                isDropdownExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // YOUR MESSAGE Section
            Text(
                text = "YOUR MESSAGE",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f),
                    letterSpacing = 0.8.sp
                )
            )
            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = feedbackMessage,
                onValueChange = { feedbackMessage = it },
                placeholder = {
                    Text(
                        text = "Describe your experience or suggest a feature...",
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp),
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = cardContainerColor,
                    unfocusedContainerColor = cardContainerColor,
                    focusedBorderColor = Color.Transparent,
                    unfocusedBorderColor = Color.Transparent,
                    focusedTextColor = MaterialTheme.colorScheme.onSurface,
                    unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                )
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ATTACH CONTEXT (OPTIONAL) Section
            Text(
                text = "ATTACH CONTEXT (OPTIONAL)",
                style = MaterialTheme.typography.labelSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.8f),
                    letterSpacing = 0.8.sp
                )
            )
            Spacer(modifier = Modifier.height(8.dp))

            if (selectedPhotoUri == null) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = cardContainerColor),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp)
                        .clickable { onPickPhoto() }
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val pathEffect = androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
                            drawRoundRect(
                                color = dragDropBorderColor,
                                style = Stroke(width = 1.5.dp.toPx(), pathEffect = pathEffect),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(16.dp.toPx())
                            )
                        }

                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.AddAPhoto,
                                contentDescription = "Add Photo",
                                tint = inactiveTextAccent,
                                modifier = Modifier.size(36.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Upload or drag & drop a photo here",
                                style = MaterialTheme.typography.bodyMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Supports PNG, JPG, JPEG, or WEBP formats",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                                )
                            )
                        }
                    }
                }
            } else {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(
                        width = 1.dp,
                        color = dragDropBorderColor
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (selectedBitmap != null) {
                            androidx.compose.foundation.Image(
                                bitmap = selectedBitmap.asImageBitmap(),
                                contentDescription = "Selected Photo Preview",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(cardAttachedColor),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Success",
                                    tint = primaryTextAccent,
                                    modifier = Modifier.size(48.dp)
                                )
                            }
                        }

                        // Filename bottom overlay
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomStart)
                                .fillMaxWidth()
                                .background(
                                    Brush.verticalGradient(
                                        colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.6f))
                                    )
                                )
                                .padding(horizontal = 16.dp, vertical = 12.dp)
                        ) {
                            val currentUriVal = selectedPhotoUri
                            val filename = remember(currentUriVal) {
                                currentUriVal?.toString()?.substringAfterLast("/") ?: ""
                            }
                            Text(
                                text = filename,
                                color = Color.White,
                                style = MaterialTheme.typography.bodySmall.copy(
                                    fontWeight = FontWeight.Bold
                                )
                            )
                        }

                        // Floating remove button in top right, equidistant (12.dp) from corner
                        IconButton(
                            onClick = {
                                selectedPhotoUri = null
                                Toast.makeText(context, "Attachment removed", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(12.dp)
                                .size(32.dp)
                                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Remove Photo",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Submit Button
            Button(
                onClick = {
                    onSubmit(selectedCategory, feedbackMessage)
                },
                enabled = feedbackMessage.isNotBlank(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                    disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                    disabledContentColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.Send,
                        contentDescription = "Send Icon",
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Submit Feedback",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontWeight = FontWeight.Bold
                        )
                    )
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }
    }

    if (showLimitedPhotosPicker) {
        ModalBottomSheet(
            onDismissRequest = { showLimitedPhotosPicker = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
            containerColor = bgMainColor,
            contentColor = MaterialTheme.colorScheme.onBackground
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Text(
                    text = "Select from Allowed Photos",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "You gave limited access. Choose one of these or add more photos.",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
                    )
                )
                Spacer(modifier = Modifier.height(16.dp))

                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f, fill = false)
                ) {
                    item {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = cardContainerColor),
                            modifier = Modifier
                                .aspectRatio(1f)
                                .clickable {
                                    storagePermissionLauncher.launch(storagePermissionsList.toTypedArray())
                                }
                        ) {
                            Column(
                                modifier = Modifier.fillMaxSize(),
                                verticalArrangement = Arrangement.Center,
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AddAPhoto,
                                    contentDescription = "Manage Access",
                                    tint = primaryTextAccent
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Manage Access",
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 10.sp
                                    ),
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }

                    items(limitedPhotos.size) { index ->
                        val uri = limitedPhotos[index]
                        val bitmap = remember(uri) {
                            try {
                                if (android.os.Build.VERSION.SDK_INT >= 28) {
                                    val source = android.graphics.ImageDecoder.createSource(context.contentResolver, uri)
                                    android.graphics.ImageDecoder.decodeBitmap(source)
                                } else {
                                    @Suppress("DEPRECATION")
                                    android.provider.MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                                }
                            } catch (e: Throwable) {
                                null
                            }
                        }

                        Card(
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .aspectRatio(1f)
                                .clickable {
                                    val size = getUriSize(context, uri)
                                    if (size <= 5 * 1024 * 1024) {
                                        selectedPhotoUri = uri
                                        showLimitedPhotosPicker = false
                                        Toast.makeText(context, "Photo attached successfully", Toast.LENGTH_SHORT).show()
                                    } else {
                                        Toast.makeText(context, "Image size exceeds the 5MB limit.", Toast.LENGTH_LONG).show()
                                    }
                                }
                        ) {
                            Box(modifier = Modifier.fillMaxSize()) {
                                if (bitmap != null) {
                                    androidx.compose.foundation.Image(
                                        bitmap = bitmap.asImageBitmap(),
                                        contentDescription = "Allowed Photo",
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(cardAttachedColor),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Loaded",
                                            tint = primaryTextAccent
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

private fun getUriSize(context: android.content.Context, uri: android.net.Uri): Long {
    var size: Long = 0
    try {
        context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
            val sizeIndex = cursor.getColumnIndex(android.provider.OpenableColumns.SIZE)
            if (sizeIndex != -1 && cursor.moveToFirst()) {
                size = cursor.getLong(sizeIndex)
            }
        }
    } catch (e: Exception) {
        try {
            context.contentResolver.openAssetFileDescriptor(uri, "r")?.use { fd ->
                size = fd.length
            }
        } catch (ex: Exception) {
            ex.printStackTrace()
        }
    }
    return size
}
