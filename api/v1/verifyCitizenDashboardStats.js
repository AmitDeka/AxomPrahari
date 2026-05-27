import * as ReportModel from './src/models/report.model.js';
import { getCitizenDashboard } from './src/controllers/citizen.controller.js';
import { db } from './src/config/db.config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("=== STARTING CITIZEN DASHBOARD STATS TESTS ===");

  try {
    // 1. Check DB connectivity
    const dbTest = await db.query('SELECT NOW()');
    console.log('[PASS] DB connected successfully at:', dbTest.rows[0].now);

    // 2. Cleanup old test data
    await db.query("DELETE FROM violation_reports WHERE vehicle_number = 'TEST-VEH-777'");
    await db.query("DELETE FROM violation_master WHERE mv_act_code = 'TEST-ACT-888'");
    await db.query("DELETE FROM users WHERE phone_number = '9999988888'");
    console.log('[PASS] Old test data cleared.');

    // 3. Create test citizen
    const resUser = await db.query(
      `INSERT INTO users (phone_number, email, full_name, username, role, profile_status)
       VALUES ('9999988888', 'stats-citizen@test.com', 'Stats Citizen', 'statscitizen', 'citizen', 'complete') RETURNING *`
    );
    const citizen = resUser.rows[0];
    console.log('[PASS] Test citizen created. ID:', citizen.id);

    // 4. Create test violation type
    const resViol = await db.query(
      `INSERT INTO violation_master (offence_name, mv_act_code, fine_amount, reward_points)
       VALUES ('Test Violation Type', 'TEST-ACT-888', 500, 10) RETURNING *`
    );
    const violation = resViol.rows[0];
    console.log('[PASS] Test violation type created. ID:', violation.id);

    // 5. Insert mock reports in pending, accepted, rejected states
    // Pending report
    const repId1 = await ReportModel.generateUniqueReportId();
    await db.query(
      `INSERT INTO violation_reports (report_id, citizen_id, violation_id, media_url, location_name, latitude, longitude, vehicle_number, incident_date, incident_time, status)
       VALUES ($1, $2, $3, 'media1.jpg', 'Guwahati', 26.1, 91.7, 'TEST-VEH-777', CURRENT_DATE, CURRENT_TIME, 'pending')`,
      [repId1, citizen.id, violation.id]
    );

    // Accepted report
    const repId2 = await ReportModel.generateUniqueReportId();
    await db.query(
      `INSERT INTO violation_reports (report_id, citizen_id, violation_id, media_url, location_name, latitude, longitude, vehicle_number, incident_date, incident_time, status)
       VALUES ($1, $2, $3, 'media2.jpg', 'Guwahati', 26.1, 91.7, 'TEST-VEH-777', CURRENT_DATE, CURRENT_TIME, 'accepted')`,
      [repId2, citizen.id, violation.id]
    );

    // Rejected report
    const repId3 = await ReportModel.generateUniqueReportId();
    await db.query(
      `INSERT INTO violation_reports (report_id, citizen_id, violation_id, media_url, location_name, latitude, longitude, vehicle_number, incident_date, incident_time, status)
       VALUES ($1, $2, $3, 'media3.jpg', 'Guwahati', 26.1, 91.7, 'TEST-VEH-777', CURRENT_DATE, CURRENT_TIME, 'rejected')`,
      [repId3, citizen.id, violation.id]
    );
    console.log('[PASS] 3 mock violation reports (1 pending, 1 accepted, 1 rejected) created.');

    // Helper to mock Express response
    const mockRes = () => {
      const res = {};
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
      res.json = (data) => {
        res.jsonData = data;
        return res;
      };
      return res;
    };

    // 6. Test Model Function directly
    console.log('Testing Model function getCitizenReportStats directly...');
    const stats = await ReportModel.getCitizenReportStats(citizen.id);
    if (stats.total === 3 && stats.pending === 1 && stats.accepted === 1 && stats.rejected === 1) {
      console.log('[PASS] Model returned correct statistics:', stats);
    } else {
      console.error('[FAIL] Model returned incorrect stats:', stats);
    }

    // 7. Test Controller Endpoint
    console.log('Testing Controller function getCitizenDashboard...');
    const req = {
      user: { id: citizen.id, role: 'citizen', status: 'complete' }
    };
    const res = mockRes();
    await getCitizenDashboard(req, res);
    
    if (res.statusCode === 200 && res.jsonData.status === 'success') {
      const respStats = res.jsonData.data.report_stats;
      if (respStats.total === 3 && respStats.pending === 1 && respStats.accepted === 1 && respStats.rejected === 1) {
        console.log('[PASS] Controller dashboard response correctly populated user stats.');
      } else {
        console.error('[FAIL] Controller response populated incorrect stats:', respStats);
      }
    } else {
      console.error('[FAIL] Controller dashboard call failed:', res.statusCode, res.jsonData);
    }

    // 8. Cleanup
    await db.query("DELETE FROM violation_reports WHERE vehicle_number = 'TEST-VEH-777'");
    await db.query("DELETE FROM violation_master WHERE mv_act_code = 'TEST-ACT-888'");
    await db.query("DELETE FROM users WHERE phone_number = '9999988888'");
    console.log('[PASS] Cleanup complete.');
    console.log('=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
    process.exit(0);

  } catch (error) {
    console.error('[FATAL] Verification script crashed:', error);
    process.exit(1);
  }
}

runTests();
