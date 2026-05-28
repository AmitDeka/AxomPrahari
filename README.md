# Axom Prahari 🛡️

Axom Prahari (The Civic Sentinel) is a comprehensive, full-stack digital initiative designed to empower the citizens of Assam by providing a platform to report traffic violations securely, anonymously, and efficiently. It acts as a bridge between the civic community and state authorities.

## 📂 Project Structure

This monolithic repository contains all the code for the Axom Prahari platform, divided into three distinct modules:

### 1. `app/` (Citizen Android Application)
The mobile application used by citizens on the ground to capture and report traffic offenses.
*   **Platform:** Android 10+ (minSdk 29, targetSdk 36)
*   **Architecture:** 64-bit only (arm64-v8a, x86_64) for maximum performance and reduced bundle size. Product Flavors configured for Beta and Stable releases.
*   **Tech Stack:**
    *   **Language:** Kotlin
    *   **UI:** Jetpack Compose (Material 3)
    *   **Camera:** CameraX (Photo & Video capture with live preview)
    *   **Location:** Android LocationManager API (Hardware GPS tracking)
    *   **Network:** Retrofit + OkHttp
    *   **Dependency Injection:** Dagger Hilt
    *   **Storage:** Android DataStore

### 2. `frontend/` (Admin Dashboard & Web Portal)
The web-based control panel used by traffic authorities and admins to review reports, verify offenses, and manage citizen rewards.
*   **Framework:** Next.js 16 (App Router)
*   **Library:** React 19
*   **Styling:** Tailwind CSS v4
*   **Components:** Radix UI & Shadcn UI components
*   **HTTP Client:** Axios
*   **Icons:** Lucide React

### 3. `api/` (Backend Server)
The centralized backend REST API that handles data flow, security, media uploads, and business logic. Located inside `api/v1/`.
*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js
*   **Database:** PostgreSQL (`pg` module) with structured relational tables.
*   **Authentication:** JSON Web Tokens (JWT) & bcrypt for secure hashing.
*   **Validation:** Zod (Strict schema validation for incoming reports and data).
*   **Media Storage:** AWS S3 SDK (configured for Cloudflare R2 object storage with pre-signed URLs).
*   **OTP & SMS:** Twilio integration for citizen phone verification.
*   **Security:** Helmet.js & Express Rate Limit for DDoS and basic attack mitigation.

## 🚀 Getting Started

### Backend (`api/v1/`)
1. Navigate to the `api/v1` directory.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in your PostgreSQL, Twilio, and R2 credentials.
4. Run `npm run dev` to start the local development server using nodemon.

### Web Admin (`frontend/`)
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Configure your local `.env` with the API URL.
4. Run `npm run dev` to start the Next.js development server.

### Android App (`app/`)
1. Open the `app/` directory in Android Studio.
2. Sync the Gradle project.
3. Select your desired Build Variant (e.g., `stableDebug` or `betaDebug`).
4. Build and run on a physical device or emulator.

## 🤝 Contribution Guidelines
When contributing to the repository, please ensure that you are adhering to the specific module architectures. 
- Ensure all backend API payloads conform strictly to their respective Zod schemas in `report.validator.js`.
- Respect the strict 64-bit ABI filter when compiling native C++ or JNI code in the Android App.

## 📜 License
© 2026 Digital Assam Initiatives. All Rights Reserved.
