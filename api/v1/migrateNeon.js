/**
 * Axom Prahari - Automated Neon PostgreSQL Migration & Seeding Tool
 * 
 * Usage:
 *   node migrateNeon.js
 *   - Reads DATABASE_URL or NEON_DATABASE_URL from .env
 *   - Verifies SSL connectivity with Neon serverless cluster
 *   - Executes unified database.sql schema
 *   - Seeds default traffic violations (if empty)
 *   - Seeds master Super Admin (if not present)
 *   - Verifies tables and row counts
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

const defaultViolations = [
  {
    offence_name: 'Riding Two-Wheeler Without Helmet',
    mv_act_code: 'SEC-129-194D',
    fine_amount: 1000.00,
    reward_points: 10,
    penalty: '₹1,000 fine and disqualification of license for 3 months',
    description: 'Driver or pillion rider operating a two-wheeler without wearing protective headgear (BIS approved helmet).',
    evidence_requirement: 'Clear photograph or short video showing vehicle registration number and rider/pillion head without helmet.'
  },
  {
    offence_name: 'Triple Riding on Two-Wheeler',
    mv_act_code: 'SEC-128-194C',
    fine_amount: 1000.00,
    reward_points: 10,
    penalty: '₹1,000 fine and disqualification of license for 3 months',
    description: 'Carrying more than one pillion rider on a two-wheeled motorcycle.',
    evidence_requirement: 'Photograph or video clearly capturing all three riders and the registration number.'
  },
  {
    offence_name: 'Driving on Wrong Side of the Road',
    mv_act_code: 'SEC-119-177',
    fine_amount: 1500.00,
    reward_points: 15,
    penalty: '₹1,500 fine and immediate vehicle challan',
    description: 'Operating a motor vehicle against the designated traffic flow or on the wrong carriageway.',
    evidence_requirement: 'Video or clear photos showing vehicle moving in reverse traffic direction with identifiable road landmark and license plate.'
  },
  {
    offence_name: 'Using Mobile Phone While Driving',
    mv_act_code: 'SEC-184-C',
    fine_amount: 5000.00,
    reward_points: 25,
    penalty: '₹5,000 fine for first offence, ₹10,000 for repeat offence',
    description: 'Holding or operating a handheld electronic communication device while driving a vehicle.',
    evidence_requirement: 'Clear photograph/video of the driver holding or actively using phone while operating the vehicle in traffic.'
  },
  {
    offence_name: 'Jumping Traffic Red Light',
    mv_act_code: 'SEC-119-184',
    fine_amount: 1000.00,
    reward_points: 15,
    penalty: '₹1,000 to ₹5,000 fine and license endorsement',
    description: 'Failing to stop behind the stop line when the traffic light signal indicates red.',
    evidence_requirement: 'Video or photo showing illuminated red signal, vehicle passing the stop line, and visible registration plate.'
  },
  {
    offence_name: 'Dangerous / Rash Driving',
    mv_act_code: 'SEC-184-RASH',
    fine_amount: 5000.00,
    reward_points: 30,
    penalty: '₹5,000 fine and up to 1 year imprisonment',
    description: 'Driving at a speed or in a manner that endangers human life or public safety.',
    evidence_requirement: 'Video clip demonstrating rash zigzagging, severe overspeeding in pedestrian zones, or blatant disregard for safety.'
  }
];

async function runNeonMigration() {
  console.log('\n======================================================');
  console.log('   AXOM PRAHARI - NEON POSTGRESQL MIGRATION RUNNER   ');
  console.log('======================================================\n');

  if (!targetUrl) {
    console.error('❌ Error: No database URL found.');
    console.error('Please configure DATABASE_URL or NEON_DATABASE_URL in api/v1/.env');
    console.error('Example:');
    console.error('DATABASE_URL=postgresql://[user]:[password]@[neon-host]-pooler.eastus2.azure.neon.tech/axomprahari?sslmode=require\n');
    process.exit(1);
  }

  const maskedUrl = targetUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`Connecting to: ${maskedUrl}`);

  const pool = new pg.Pool({
    connectionString: targetUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    // 1. Test Connection
    console.log('\n[1/5] Testing PostgreSQL Connection...');
    const connCheck = await pool.query('SELECT version(), current_database(), current_user');
    console.log(` Connected successfully to database: "${connCheck.rows[0].current_database}" as "${connCheck.rows[0].current_user}"`);
    console.log(` Engine: ${connCheck.rows[0].version.split(',')[0]}`);

    // 2. Read and apply database.sql
    console.log('\n[2/5] Applying Unified Database Schema (database.sql)...');
    const sqlPath = path.join(__dirname, 'database.sql');
    const schemaSql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(schemaSql);
    console.log(' Schema DDL executed successfully (all tables and indexes verified).');

    // 3. Seed Default Violations
    console.log('\n[3/5] Verifying Violation Master Catalog...');
    const existingViolations = await pool.query('SELECT COUNT(*) FROM violation_master');
    const count = parseInt(existingViolations.rows[0].count, 10);

    if (count === 0) {
      console.log(' Seeding default traffic violations...');
      for (const v of defaultViolations) {
        await pool.query(
          `INSERT INTO violation_master 
            (offence_name, mv_act_code, fine_amount, reward_points, penalty, description, evidence_requirement, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
           ON CONFLICT (mv_act_code) DO NOTHING`,
          [v.offence_name, v.mv_act_code, v.fine_amount, v.reward_points, v.penalty, v.description, v.evidence_requirement]
        );
      }
      console.log(` Seeded ${defaultViolations.length} initial violations into violation_master.`);
    } else {
      console.log(` violation_master already contains ${count} records. Skipping default seed.`);
    }

    // 4. Seed Super Admin
    console.log('\n[4/5] Checking Super Admin Account...');
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@axomprahari.in';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const adminName = 'Master Super Admin';

    const adminCheck = await pool.query('SELECT id, email FROM users WHERE role = $1', ['super_admin']);
    if (adminCheck.rows.length === 0) {
      console.log(' Creating initial Super Admin account...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, role, full_name, profile_status, is_active)
         VALUES ($1, $2, 'super_admin', $3, 'complete', TRUE)
         ON CONFLICT (email) DO NOTHING`,
        [adminEmail, passwordHash, adminName]
      );
      console.log(' Super Admin created successfully!');
      console.log(`   Email:    ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log(` Super Admin already exists (${adminCheck.rows[0].email}).`);
    }

    // 5. Verify All Tables
    console.log('\n[5/5] Final Database Integrity Verification:');
    const tables = ['users', 'invalidated_tokens', 'violation_master', 'violation_reports', 'admin_notifications', 'feedbacks'];
    for (const tbl of tables) {
      const res = await pool.query(`SELECT COUNT(*) FROM ${tbl}`);
      console.log(`   ✔ Table "${tbl.padEnd(20)}" -> ${res.rows[0].count} rows`);
    }

    console.log('\n======================================================');
    console.log('    MIGRATION TO NEON POSTGRESQL COMPLETE!          ');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ Migration Failed with Error:');
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runNeonMigration();
