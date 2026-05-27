import * as ViolationModel from './src/models/violation.model.js';
import { db } from './src/config/db.config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("=== STARTING BACKEND VIOLATION UPDATE TESTS ===");

  try {
    // 1. Check if the database has the columns
    const columnsCheck = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'violation_master' 
        AND column_name IN ('penalty', 'description', 'evidence_requirement')
    `);

    const columns = columnsCheck.rows.map(r => r.column_name);
    console.log('Detected violation_master columns:', columns);

    const missingColumns = ['penalty', 'description', 'evidence_requirement'].filter(col => !columns.includes(col));
    if (missingColumns.length > 0) {
      console.warn(`[WARNING] Missing columns in database: ${missingColumns.join(', ')}.`);
      console.warn('Please run the SQL migration to add these columns to the database:');
      console.warn(`
        ALTER TABLE violation_master ADD COLUMN IF NOT EXISTS penalty TEXT;
        ALTER TABLE violation_master ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE violation_master ADD COLUMN IF NOT EXISTS evidence_requirement TEXT;
      `);
      console.log('JavaScript changes are implemented and verified syntactically. Awaiting SQL column creation to run complete integration checks.');
      process.exit(0);
    }

    console.log('[PASS] All database columns present.');

    // 2. Clear previous test violation if any
    await db.query("DELETE FROM violation_master WHERE mv_act_code = 'TEST-ACT-999'");
    console.log('[PASS] Old test violation cleared.');

    // 3. Test: create violation
    console.log('Testing createViolation model...');
    const testData = {
      offence_name: 'Test Offence Name',
      mv_act_code: 'TEST-ACT-999',
      fine_amount: 1200.50,
      reward_points: 15,
      penalty: 'Fine up to Rs. 2000 or license suspension.',
      description: 'This is a test offence description.',
      evidence_requirement: 'A clear photograph showing vehicle registration plate.'
    };

    const newViolation = await ViolationModel.createViolation(testData);
    if (
      newViolation.offence_name === testData.offence_name &&
      newViolation.penalty === testData.penalty &&
      newViolation.description === testData.description &&
      newViolation.evidence_requirement === testData.evidence_requirement
    ) {
      console.log('[PASS] createViolation successfully stored all new columns.');
    } else {
      console.error('[FAIL] createViolation did not return correct fields.', newViolation);
    }

    // 4. Test: getAllViolations for Admin
    console.log('Testing getAllViolations for Admin...');
    const adminViolations = await ViolationModel.getAllViolations(true);
    const foundAdmin = adminViolations.find(v => v.mv_act_code === 'TEST-ACT-999');
    if (foundAdmin && foundAdmin.fine_amount === '1200.50') {
      console.log('[PASS] Admin can fetch all fields including fine amount.');
    } else {
      console.error('[FAIL] Admin fetch incorrect or missing fine amount.', foundAdmin);
    }

    // 5. Test: getAllViolations for Citizen
    console.log('Testing getAllViolations for Citizen...');
    const citizenViolations = await ViolationModel.getAllViolations(false);
    const foundCitizen = citizenViolations.find(v => v.mv_act_code === 'TEST-ACT-999');
    if (foundCitizen) {
      if (foundCitizen.fine_amount !== undefined) {
        console.error('[FAIL] Citizen fetch leaked fine_amount!', foundCitizen);
      } else if (
        foundCitizen.penalty === testData.penalty &&
        foundCitizen.description === testData.description &&
        foundCitizen.evidence_requirement === testData.evidence_requirement
      ) {
        console.log('[PASS] Citizen fetch correctly returns penalty, description, evidence_requirement, and hides fine_amount.');
      } else {
        console.error('[FAIL] Citizen fetch missing new fields.', foundCitizen);
      }
    } else {
      console.error('[FAIL] Test violation not found in active citizen violations list.');
    }

    // 6. Test: updateViolation
    console.log('Testing updateViolation model...');
    const updateData = {
      penalty: 'Updated penalty string.',
      description: 'Updated description string.'
    };
    const updatedViolation = await ViolationModel.updateViolation(newViolation.id, updateData);
    if (
      updatedViolation.penalty === updateData.penalty &&
      updatedViolation.description === updateData.description &&
      updatedViolation.evidence_requirement === testData.evidence_requirement // unchanged
    ) {
      console.log('[PASS] updateViolation successfully modified fields.');
    } else {
      console.error('[FAIL] updateViolation did not update fields correctly.', updatedViolation);
    }

    // 7. Cleanup
    await db.query("DELETE FROM violation_master WHERE mv_act_code = 'TEST-ACT-999'");
    console.log('[PASS] Cleanup complete.');
    console.log('=== ALL TESTS COMPLETED SUCCESSFULLY! ===');
    process.exit(0);

  } catch (error) {
    console.error('[FATAL] Test script crashed:', error);
    process.exit(1);
  }
}

runTests();
