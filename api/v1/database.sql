-- Connect to your database before running this
-- \c axomprahari

-- Enable UUID extension (optional, but good if you want UUIDs instead of SERIAL later)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Index on phone_number for faster lookups during OTP
CREATE INDEX idx_users_phone ON users(phone_number);

-- Table to store invalidated (logged out) JWT tokens
CREATE TABLE IF NOT EXISTS invalidated_tokens (
    token TEXT PRIMARY KEY,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master table for all traffic violations
CREATE TABLE IF NOT EXISTS violation_master (
    id SERIAL PRIMARY KEY,
    offence_name VARCHAR(255) NOT NULL,
    mv_act_code VARCHAR(100) NOT NULL UNIQUE,
    fine_amount DECIMAL(10, 2) NOT NULL,
    reward_points INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table to store citizen violation reports
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

-- Table to store administrative notifications
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