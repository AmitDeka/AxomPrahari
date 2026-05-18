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
| **GET** | `/api/v1/admin/list` | Super Admin Only | Retrieves a list of all administrators in the system. |
| **POST** | `/api/v1/admin/create` | Super Admin Only | Creates a new Police Admin account. |
| **PUT** | `/api/v1/admin/:id` | Super Admin Only | Updates an admin's profile (including changing passwords). |
| **PATCH** | `/api/v1/admin/:id/status` | Super Admin Only | Toggles an admin's active status (suspend/activate). |
| **DELETE** | `/api/v1/admin/:id` | Super Admin Only | Permanently deletes a Police Admin account. |

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
