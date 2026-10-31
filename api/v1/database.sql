-- Axom Prahari (The Civic Sentinel)
-- PostgreSQL Unified Schema DDL (Neon Serverless & Self-Hosted Compatible)

-- 1. Users Table (Citizens, Police Admins, Super Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    citizen_id VARCHAR(50) UNIQUE,
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('citizen', 'police_admin', 'super_admin')),
    full_name VARCHAR(255),
    username VARCHAR(100) UNIQUE,
    profile_status VARCHAR(50) DEFAULT 'incomplete',
    is_active BOOLEAN DEFAULT TRUE,
    reward_points INT DEFAULT 0,
    rank VARCHAR(100),
    jurisdiction_district VARCHAR(100),
    password_changed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_citizen_id ON users(citizen_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Invalidated Tokens Table (Logged out JWT tokens)
CREATE TABLE IF NOT EXISTS invalidated_tokens (
    token TEXT PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Master Table for Traffic Violations
CREATE TABLE IF NOT EXISTS violation_master (
    id SERIAL PRIMARY KEY,
    offence_name VARCHAR(255) NOT NULL,
    mv_act_code VARCHAR(100) NOT NULL UNIQUE,
    fine_amount DECIMAL(10, 2) NOT NULL,
    reward_points INT DEFAULT 0,
    penalty TEXT NULL,
    description TEXT NULL,
    evidence_requirement TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Citizen Violation Reports Table
CREATE TABLE IF NOT EXISTS violation_reports (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE,
    citizen_id INT REFERENCES users(id) ON DELETE CASCADE,
    violation_id INT REFERENCES violation_master(id),
    media_url VARCHAR(500) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    admin_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON violation_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_citizen ON violation_reports(citizen_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON violation_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_coords ON violation_reports(latitude, longitude);

-- 5. Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    recipient_role VARCHAR(50) NOT NULL DEFAULT 'police_admin' CHECK (recipient_role IN ('police_admin', 'super_admin', 'all')),
    jurisdiction_district VARCHAR(100) NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_report', 'settings_change', 'system_alert')),
    related_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(is_read, recipient_role);

-- 6. Citizen Feedback Table
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    citizen_id INT REFERENCES users(id) ON DELETE CASCADE,
    feedback_category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_citizen ON feedbacks(citizen_id);
