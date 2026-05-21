# Axom Prahari API Documentation

This document outlines all currently available API endpoints in the Node.js backend, grouped by logical domains, detailing their HTTP methods, paths, and security requirements.

## 1. System & Health
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Public | Health check endpoint to verify the API is running. |

## 2. Authentication Endpoints
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/v1/auth/citizen/request-otp` | Public | Initiates OTP-based login or registration for a citizen. |
| **POST** | `/api/v1/auth/citizen/verify-otp` | Public | Verifies the OTP and issues a Citizen JWT. |
| **POST** | `/api/v1/auth/citizen/complete-profile` | Authenticated (Any) | Allows a new citizen to complete their profile setup. |
| **POST** | `/api/v1/auth/citizen/logout` | Authenticated (Any) | Logs out the citizen by blacklisting their current JWT. |
| **POST** | `/api/v1/auth/admin/login` | Public | Authenticates an admin (Police or Super) via email and password. |
| **POST** | `/api/v1/auth/admin/logout` | Police Admin Only | Logs out the admin by blacklisting their current JWT. |

## 3. Citizen Panel Endpoints
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/citizen/dashboard` | Authenticated (Any) | Retrieves the citizen's personalized dashboard data. |
| **GET** | `/api/v1/citizen/violations` | Authenticated (Any) | Retrieves a list of active violations (hides fine amounts for security). |
| **GET** | `/api/v1/citizen/reports/presigned-url` | Authenticated (Any) | Generates a Cloudflare R2 presigned upload URL (spam-limited). |
| **POST** | `/api/v1/citizen/reports/` | Authenticated (Any) | Submits a new violation report (spam-limited). |
| **GET** | `/api/v1/citizen/reports/` | Authenticated (Any) | Retrieves a paginated list of their own submitted reports (filterable by status). |
| **PUT** | `/api/v1/citizen/profile` | Authenticated (Any) | Updates the citizen's own name and email address. |

## 4. Violation Management Endpoints (Admin)
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/admin/violations/` | Police Admin Only | Retrieves all violations (including inactive and fine amounts). |
| **POST** | `/api/v1/admin/violations/` | Police Admin Only | Creates a new violation in the master list. |
| **PUT** | `/api/v1/admin/violations/:id` | Police Admin Only | Updates an existing violation. |
| **PATCH** | `/api/v1/admin/violations/:id/status` | Police Admin Only | Toggles the active/inactive status of a violation. |
| **DELETE** | `/api/v1/admin/violations/:id` | Super Admin Only | Permanently deletes a violation from the database. |

## 5. Admin Management Endpoints
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/admin/dashboard` | Police Admin Only | Retrieves the profile details of the currently logged-in admin. |
| **GET** | `/api/v1/admin/list` | Police Admin Only | Retrieves a list of all administrators in the system. |
| **POST** | `/api/v1/admin/create` | Police Admin Only | Creates a new administrator account (either Police Admin or Super Admin*). |
| **PUT** | `/api/v1/admin/:id` | Police Admin Only | Updates an administrator's profile details (including password*). |
| **PATCH** | `/api/v1/admin/:id/status` | Police Admin Only | Toggles an administrator's active status (suspend/activate*). |
| **DELETE** | `/api/v1/admin/:id` | Police Admin Only | Permanently deletes an administrator account*. |

*\*Subject to strict Access Control Boundaries (see Section 10).*

## 6. Violation Reports & Heatmap Endpoints (Admin)
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/admin/reports/` | Police Admin Only | Retrieves a paginated list of all citizen violation reports (filterable by status). |
| **PATCH** | `/api/v1/admin/reports/:id/review` | Police Admin Only | Accepts or rejects a pending report (with an optional admin message). |
| **GET** | `/api/v1/admin/reports/heatmap` | Police Admin Only | Retrieves accepted report GPS points (lat/long) for the admin dashboard heatmap. |

## 7. Citizen Management Endpoints (Admin)
| HTTP Method | Endpoint Path | Privilege / Role | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/v1/admin/citizens` | Police Admin Only | View paginated list of all citizens with masked PII and report statistics. |
| **PATCH** | `/api/v1/admin/citizens/:id/status` | Police Admin Only | Disable or enable a citizen account active status. |
| **DELETE** | `/api/v1/admin/citizens/:id` | Super Admin Only | Permanently deletes a citizen account from the system. |

---
**Role Definitions:**
* **Public:** No authentication token required.
* **Authenticated (Any) / Citizen:** Requires a valid JWT, generally from the citizen login flow.
* **Police Admin Only:** Requires an admin JWT with at least the `police_admin` role (Super Admins inherit this).
* **Super Admin Only:** Strictly restricted to the `super_admin` role.

## 8. Custom Identification Fields
To facilitate user-friendly communications and lookups, the system automatically generates unique custom identifiers:
* **Citizen ID (`citizen_id`):** Format `APC-[6-character Alphanumeric]` (e.g. `APC-8K9A2M`). Generated automatically during initial citizen verification.
* **Report ID (`report_id`):** Format `REP-[YYMMDD]-[6-character Random Hex]` (e.g. `REP-260520-E4B28C`). Generated automatically upon violation report submission.

## 9. Admin Fields & Schema Validation
When creating or updating administrators via `/api/v1/admin/create` or `/api/v1/admin/:id`, the request bodies are validated using `zod`. The key properties include:
* **`rank`**: String (min 2 characters). Represents the officer's designation or rank (e.g., "DSP", "Inspector", "SI").
* **`jurisdiction_district`**: Enum. Must be one of the 35 districts of Assam:
  * *Bajali, Baksa, Barpeta, Biswanath, Bongaigaon, Cachar, Charaideo, Chirang, Darrang, Dhemaji, Dhubri, Dibrugarh, Dima Hasao, Goalpara, Golaghat, Hailakandi, Hojai, Jorhat, Kamrup, Kamrup Metropolitan, Karbi Anglong, Karimganj, Kokrajhar, Lakhimpur, Majuli, Morigaon, Nagaon, Nalbari, Sivasagar, Sonitpur, South Salmara-Mankachar, Tinsukia, Udalguri, West Karbi Anglong, Tamulpur.*
* **`role`**: Enum (`police_admin` or `super_admin`).
* **`email`**: Valid email format string (must be unique).
* **`password`**: Must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.

## 10. Admin Access Control Boundaries & Security Constraints
To enforce security boundaries between administrative roles, the backend verifies the following rules on every operation:
1. **Self-Operation Prevention**:
   * No administrator (regardless of whether they are a `police_admin` or `super_admin`) is allowed to **disable** or **delete** their own account.
   * Any attempt to do so will return a `403 Forbidden` response: `{ "status": "error", "message": "You cannot delete yourself." }` or `{ "status": "error", "message": "You cannot disable yourself." }`.
2. **Role Boundaries**:
   * A `police_admin` can manage other `police_admin` accounts but has **no authority** over `super_admin` accounts.
   * Any attempt by a `police_admin` to edit, disable, or delete a `super_admin` account will return a `403 Forbidden` response: `{ "status": "error", "message": "Police Admins cannot [modify/disable/delete] Super Admins." }`.
   * A `police_admin` cannot create a `super_admin` or promote any account to `super_admin`. Any such attempt returns a `403 Forbidden` response.
   * A `super_admin` possesses full rights to manage both `police_admin` and other `super_admin` accounts.
3. **Session Invalidation on Password Change**:
   * If an administrator updates their own password, the backend updates their `password_changed_at` timestamp.
   * The token verification middleware compares the issue time (`iat`) of the JWT against `password_changed_at`. If the token was issued prior to the password update, it immediately evaluates as expired, returning a `401 Unauthorized` response to the client. This triggers an automatic logout and redirects the user to the login screen.

