import crypto from 'crypto';
import { db } from '../config/db.config.js';

const getYYMMDD = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

export const generateUniqueReportId = async () => {
  let isUnique = false;
  let reportId = '';
  
  while (!isUnique) {
    const dateStr = getYYMMDD();
    const hexStr = crypto.randomBytes(3).toString('hex').toUpperCase();
    reportId = `REP-${dateStr}-${hexStr}`;
    
    // Check if it already exists
    const result = await db.query('SELECT id FROM violation_reports WHERE report_id = $1', [reportId]);
    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  
  return reportId;
};

export const createReport = async (citizenId, data) => {
  const reportId = await generateUniqueReportId();
  const result = await db.query(
    `INSERT INTO violation_reports 
      (report_id, citizen_id, violation_id, media_url, location_name, latitude, longitude, vehicle_number, incident_date, incident_time, message, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *`,
    [
      reportId,
      citizenId,
      data.violation_id,
      data.media_url,
      data.location_name,
      data.latitude,
      data.longitude,
      data.vehicle_number,
      data.incident_date,
      data.incident_time,
      data.message || null
    ]
  );
  return result.rows[0];
};

export const getCitizenReports = async (citizenId, statusFilter = null, limit = 10, offset = 0) => {
  let query = `
    SELECT r.*, v.offence_name, v.mv_act_code, v.reward_points 
    FROM violation_reports r
    JOIN violation_master v ON r.violation_id = v.id
    WHERE r.citizen_id = $1
  `;
  const values = [citizenId];
  let paramIndex = 2;

  if (statusFilter && ['pending', 'accepted', 'rejected'].includes(statusFilter)) {
    query += ` AND r.status = $${paramIndex++}`;
    values.push(statusFilter);
  }

  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);

  const result = await db.query(query, values);
  
  // Get total count for pagination metadata
  let countQuery = 'SELECT COUNT(*) FROM violation_reports WHERE citizen_id = $1';
  const countValues = [citizenId];
  if (statusFilter && ['pending', 'accepted', 'rejected'].includes(statusFilter)) {
    countQuery += ` AND status = $2`;
    countValues.push(statusFilter);
  }
  const countResult = await db.query(countQuery, countValues);
  
  return {
    reports: result.rows,
    totalCount: parseInt(countResult.rows[0].count, 10)
  };
};

export const getAdminReports = async (statusFilter = null, limit = 20, offset = 0) => {
  let query = `
    SELECT r.*, v.offence_name, v.mv_act_code, v.reward_points, u.full_name as citizen_name, u.phone_number, u.citizen_id as citizen_code
    FROM violation_reports r
    JOIN violation_master v ON r.violation_id = v.id
    JOIN users u ON r.citizen_id = u.id
  `;
  const values = [];
  let paramIndex = 1;

  if (statusFilter && ['pending', 'accepted', 'rejected'].includes(statusFilter)) {
    query += ` WHERE r.status = $${paramIndex++}`;
    values.push(statusFilter);
  }

  query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  values.push(limit, offset);

  const result = await db.query(query, values);

  let countQuery = 'SELECT COUNT(*) FROM violation_reports';
  const countValues = [];
  if (statusFilter && ['pending', 'accepted', 'rejected'].includes(statusFilter)) {
    countQuery += ` WHERE status = $1`;
    countValues.push(statusFilter);
  }
  const countResult = await db.query(countQuery, countValues);

  return {
    reports: result.rows,
    totalCount: parseInt(countResult.rows[0].count, 10)
  };
};

export const updateReportStatus = async (reportId, status, adminMessage) => {
  const result = await db.query(
    `UPDATE violation_reports 
     SET status = $1, admin_message = $2, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $3 RETURNING *`,
    [status, adminMessage || null, reportId]
  );
  return result.rows[0];
};

export const getHeatmapData = async () => {
  const result = await db.query(
    `SELECT latitude, longitude, vehicle_number, incident_date, v.offence_name
     FROM violation_reports r
     JOIN violation_master v ON r.violation_id = v.id
     WHERE r.status = 'accepted'`
  );
  return result.rows;
};

export const getCitizenReportStats = async (citizenId) => {
  const result = await db.query(
    `SELECT 
       COALESCE(COUNT(*), 0) AS total_reports,
       COALESCE(COUNT(CASE WHEN status = 'pending' THEN 1 END), 0) AS pending_reports,
       COALESCE(COUNT(CASE WHEN status = 'accepted' THEN 1 END), 0) AS accepted_reports,
       COALESCE(COUNT(CASE WHEN status = 'rejected' THEN 1 END), 0) AS rejected_reports
     FROM violation_reports 
     WHERE citizen_id = $1`,
    [citizenId]
  );
  
  const row = result.rows[0];
  return {
    total: parseInt(row.total_reports, 10),
    pending: parseInt(row.pending_reports, 10),
    accepted: parseInt(row.accepted_reports, 10),
    rejected: parseInt(row.rejected_reports, 10)
  };
};
