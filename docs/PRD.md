# Product Requirements Document (PRD) 🛡️
## Project: Axom Prahari (The Civic Sentinel)

---

## 1. Document Control
*   **Version:** 1.0.0
*   **Status:** Draft
*   **Date:** May 30, 2026
*   **Author:** Antigravity (AI System Architect)
*   **Target Audience:** Project Stakeholders, State IT Authorities, Product Owners, Engineering Teams

---

## 2. Product Overview & Vision
**Axom Prahari** (The Civic Sentinel) is a state-wide digital initiative designed to empower the citizens of Assam to actively participate in maintaining road safety. By providing a secure, anonymous, and user-friendly platform to report traffic violations in real-time, the application acts as a bridge between civic society and the state law enforcement agencies.

### 2.1 Problem Statement
*   **Inadequate Monitoring:** Traditional traffic enforcement is limited by physical officer availability.
*   **High Fatalities:** Road accidents and traffic violations go unreported, leading to lack of accountability.
*   **Friction in Reporting:** Citizens who want to report violations face procedural hurdles or fear of retaliation due to lack of anonymity.
*   **Lack of Incentive:** Citizens have no positive reinforcement to report violations.

### 2.2 Product Vision
To build a high-trust digital ecosystem where every citizen becomes a "sentinel" for public safety, backed by robust validation tools for authorities and a rewarding gamification framework.

---

## 3. User Personas
The system serves three primary user cohorts:

### 3.1 The Citizen Reporter (Arup, 28)
*   **Profile:** Tech-savvy commuter who travels daily through Guwahati.
*   **Need:** Wants a quick, frictionless way to record and report a traffic offense (e.g., riding without a helmet, triple riding, driving on the wrong side) without having to visit a police station.
*   **Pain Points:** Concern over personal data leakage, slow reporting process, complex legal compliance.

### 3.2 The Traffic Police Administrator (Inspector Baruah, 45)
*   **Profile:** Desk officer assigned to review citizen reports for Guwahati Kamrup Metropolitan district.
*   **Need:** Needs to quickly review high-quality media evidence, check geographical data, verify details, and either approve (forwarding for penalization) or reject reports.
*   **Pain Points:** Spam reports, blurry or doctored photos/videos, high volume of submissions.

### 3.3 The Super Administrator (State IT Admin, 38)
*   **Profile:** Technical lead at the State IT department.
*   **Need:** Manage overall system integrity, configure the master list of traffic violations, manage police officer permissions, analyze safety hotspots, and ensure data protection.
*   **Pain Points:** Unauthorized access, privilege abuse, database bloat from media.

---

## 4. Key Functional Features

### 4.1 Citizen Mobile Application (Android)
1.  **Frictionless OTP Onboarding:** Phone number verification using SMS OTP (via Twilio). No complex password registration needed.
2.  **Profile Setup & Management:** Complete name, email, and unique username. The system generates a custom citizen identifier `APC-[Alphanumeric]`.
3.  **Smart Evidence Capture (CameraX):** Integrated camera interface to record photos/videos of violations directly within the app, preventing the upload of old/doctored gallery media.
4.  **Hardware GPS Integration:** Automatic capture of location coordinates (Latitude & Longitude) and reverse-geocoding of the location name.
5.  **Offline-Ready Input:** Allow capture of media and location names even under weak network conditions, queuing them for submission.
6.  **My Reports History:** Comprehensive lists of reports submitted, labeled by state (`Pending`, `Accepted`, `Rejected`) with admin review remarks.
7.  **Gamified Rewards & Leaderboard:** Earn reward points for every accepted report. View cumulative points on the profile.
8.  **Citizen Feedback Portal:** Direct communication channel to submit platform feedback, suggestions, or general concerns, with optional image attachments.

### 4.2 Traffic Police Web Portal (Next.js)
1.  **Strict Admin Authentication:** Email/password verification with role-based JWT.
2.  **Review Dashboard:** Real-time stream of incoming reports filtered by jurisdiction district.
3.  **Report Review Console:** Interactive screen showing:
    *   Captured photo/video player.
    *   Vehicle registration number (editable/verify-ready).
    *   GPS coordinates linked to Map.
    *   Incident timestamp, offense type, and citizen notes.
    *   Approve / Reject actions with customizable response messages.
4.  **Violations Master Directory:** View, update, or create traffic violations (defining Motor Vehicle Act codes, standard fine amounts, citizen reward points, and required evidence).
5.  **Citizen User Registry:** Monitor citizen behavior, mask personally identifiable details, and temporarily suspend abusive/spam accounts.
6.  **Officer Management Console:** Super Admins can onboard, suspend, or delete Police Admin accounts across the 35 districts of Assam.
7.  **Interactive Heatmap:** Visual representation of safety violation hotspots in Assam based on approved report coordinates.
8.  **Feedback Management Console:** Review and categorize feedback submitted by citizens.

---

## 5. Non-Functional & Security Requirements

### 5.1 Privacy & Anonymity
*   **PII Masking:** Citizens' phone numbers and emails are masked in the admin dashboard (e.g., `******1234`). Only Super Admins can request full access for legal investigations.
*   **Metadata Protection:** Stripping EXIF tags from photos before permanent upload to maintain device privacy.

### 5.2 Scalability & Availability
*   **Media Storage Optimization:** Use Cloudflare R2 object storage with pre-signed URLs. Citizen media is uploaded directly to R2, bypassing and saving backend server memory.
*   **Database Scalability:** Relational PostgreSQL structure with indexed query paths for high-frequency operations (e.g., user search by phone, active violation checks).

### 5.3 Security Boundaries & Spam Mitigation
*   **Admin Access Control Boundaries:**
    *   No administrator can delete or suspend themselves.
    *   District Police Admins cannot edit, delete, or suspend Super Admins.
    *   Session invalidation: JWT tokens automatically expire if the password is changed, preventing hijacked session continuation.
*   **API Spam Limits:** Strict rate-limiting on OTP requests (e.g., max 3 requests per 10 minutes) and report submissions.
*   **Payload Validation:** Strict API request validation using Zod schemas.

---

## 6. Success Metrics & KPIs
*   **User Adoption:** Monthly Active Users (MAU) of the Citizen App in Assam.
*   **Submission Volume:** Daily and weekly reports submitted.
*   **Verification Throughput:** Average time taken by authorities to review and resolve a pending report.
*   **Report Accuracy:** Ratio of Accepted vs. Rejected reports (target >75% accepted).
*   **Hotspot Safety Mitigation:** Measurable reduction of accidents in hotspots identified by the heatmap.
