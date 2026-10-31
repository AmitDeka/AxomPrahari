# Neon PostgreSQL Migration Guide 🛡️
## Project: Axom Prahari (The Civic Sentinel)

This document provides a step-by-step guide to migrate the Axom Prahari database to **Neon Serverless PostgreSQL** without downtime or breaking changes.

---

## 1. Prerequisites

1. Sign up for a free account at [neon.tech](https://neon.tech).
2. Create a new Neon project:
   * **Project Name:** `axomprahari`
   * **Region:** Select the region closest to your backend hosting (e.g., `AWS Asia Pacific (Singapore)` or `AWS US East`).
   * **Postgres Version:** 16 (or latest recommended).

---

## 2. Obtain Your Connection String

In the Neon Console:
1. Go to **Dashboard** -> **Connection Details**.
2. Select **Connection pooling** (`Pooled connection` with `-pooler` in the host).
   * *Why pooled?* Serverless connection pooling prevents exhaustion of database connections during mobile app or web traffic bursts.
3. Copy the connection string. It will look similar to:
   ```text
   postgresql://neondb_owner:npg_xyz123@ep-cool-frost-123456-pooler.ap-southeast-1.aws.neon.tech/axomprahari?sslmode=require
   ```

---

## 3. Configure Environment Variables

Open your backend environment file [`api/v1/.env`](file:///E:/AxomPrahari/api/v1/.env):

```env
# Database Configuration (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://[user]:[password]@[neon-host]-pooler.ap-southeast-1.aws.neon.tech/axomprahari?sslmode=require
DB_REJECT_UNAUTHORIZED=false
DB_POOL_MAX=10
```

*(Optional: You can also specify `NEON_DATABASE_URL=...` to run the migration without altering your active `DATABASE_URL` initially).*

---

## 4. Run the Automated Migration Script

Inside the `api/v1` directory, run:

```bash
cd api/v1
npm run db:migrate-neon
```

### What this script executes automatically:
1. **Verifies Connectivity & SSL:** Connects securely to the Neon serverless cluster.
2. **Applies Schema DDL ([`database.sql`](file:///E:/AxomPrahari/api/v1/database.sql)):** Creates all 6 tables (`users`, `invalidated_tokens`, `violation_master`, `violation_reports`, `admin_notifications`, `feedbacks`) and all lookup indexes.
3. **Seeds Default Violations:** Inserts standard Motor Vehicle Act offenses (Helmet, Triple Riding, Wrong Side Driving, Red Light, Phone usage, Rash Driving) with fine amounts and evidence requirements.
4. **Seeds Master Super Admin:** Generates the default super administrator account (`superadmin@axomprahari.in` with password `SuperAdmin@123`).
5. **Integrity Check:** Prints a summary of all created tables and row counts.

---

## 5. Verification & Testing

To verify backend operations against your new Neon database, execute the included test suite in `api/v1/`:

```bash
# Verify Super Admin & Police Admin access boundaries
node verifyAdminCRUD.js

# Verify Citizen profile updates and username constraints
node verifyCitizenProfileUpdate.js

# Verify Dashboard statistics computation
node verifyCitizenDashboardStats.js

# Verify Violations CRUD and filters
node verifyViolationUpdates.js
```

---

## 6. Production Deployment (Render / Cloud Host)

When updating your live deployed backend on Render (or other platform):
1. Navigate to your Web Service dashboard on Render.
2. Go to **Environment** settings.
3. Update `DATABASE_URL` with your Neon pooled connection string.
4. Trigger a redeploy.
