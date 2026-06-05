import { getAllAdminsList } from './src/controllers/admin.controller.js';
import { db } from './src/config/db.config.js';
import dotenv from 'dotenv';

dotenv.config();

async function runTests() {
  console.log("=== STARTING ADMIN LIST PAGINATION & FILTERING TESTS ===");

  try {
    // 1. Check database connectivity
    const dbTest = await db.query('SELECT NOW()');
    console.log('[PASS] Database connected successfully at:', dbTest.rows[0].now);

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

    // --- TEST 1: Default pagination ---
    console.log('Testing default pagination (page=1, limit=10)...');
    let req = {
      query: {}
    };
    let res = mockRes();
    await getAllAdminsList(req, res);

    if (res.statusCode === 200) {
      const { admins, pagination } = res.jsonData.data;
      console.log('[PASS] Default pagination successful. Received admins count:', admins.length);
      console.log('       Pagination metadata:', pagination);
      if (pagination && pagination.page === 1 && pagination.limit === 10 && typeof pagination.total === 'number') {
        console.log('[PASS] Default page, limit, and total count metadata correct.');
      } else {
        console.error('[FAIL] Metadata incorrect.', pagination);
      }
    } else {
      console.error('[FAIL] Default list retrieval failed.', res.statusCode, res.jsonData);
    }

    // --- TEST 2: Custom limit and page ---
    console.log('Testing custom pagination (page=1, limit=2)...');
    req = {
      query: { page: '1', limit: '2' }
    };
    res = mockRes();
    await getAllAdminsList(req, res);

    if (res.statusCode === 200) {
      const { admins, pagination } = res.jsonData.data;
      console.log('[PASS] Custom pagination successful. Received admins count:', admins.length);
      console.log('       Pagination metadata:', pagination);
      if (admins.length <= 2 && pagination.limit === 2 && pagination.page === 1) {
        console.log('[PASS] Returned count and limit match expected values.');
      } else {
        console.error('[FAIL] Returned count or limit incorrect.', admins.length, pagination);
      }
    } else {
      console.error('[FAIL] Custom pagination query failed.', res.statusCode, res.jsonData);
    }

    // --- TEST 3: Filter by role = super_admin ---
    console.log('Testing role filtering (role=super_admin)...');
    req = {
      query: { role: 'super_admin', limit: '2' }
    };
    res = mockRes();
    await getAllAdminsList(req, res);

    if (res.statusCode === 200) {
      const { admins } = res.jsonData.data;
      const invalidRoles = admins.filter(a => a.role !== 'super_admin');
      if (invalidRoles.length === 0) {
        console.log('[PASS] All returned admins are super_admin.');
      } else {
        console.error('[FAIL] Returned non-super_admin admins:', invalidRoles);
      }
    } else {
      console.error('[FAIL] Role filtering query failed.', res.statusCode, res.jsonData);
    }

    // --- TEST 4: Zod Query Validation ---
    console.log('Testing Zod query parameter validation (invalid values)...');
    req = {
      query: { page: '-5', limit: 'abc', role: 'invalid_role' }
    };
    res = mockRes();
    await getAllAdminsList(req, res);

    if (res.statusCode === 400) {
      console.log('[PASS] Invalid parameters correctly blocked with 400 Bad Request.');
      console.log('       Errors returned:', res.jsonData.errors);
    } else {
      console.error('[FAIL] Invalid parameters were not blocked. Status code:', res.statusCode, res.jsonData);
    }

  } catch (err) {
    console.error('[FATAL ERROR IN TEST SUITE]', err);
  } finally {
    await db.end();
    console.log("=== TESTS COMPLETE ===");
  }
}

runTests();
