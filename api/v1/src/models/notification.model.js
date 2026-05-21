import { db } from '../config/db.config.js';

/**
 * Create a new administrative notification
 */
export const createNotification = async ({
  recipientRole = 'police_admin',
  jurisdictionDistrict = null,
  title,
  message,
  type,
  relatedId = null
}) => {
  const result = await db.query(
    `INSERT INTO admin_notifications (recipient_role, jurisdiction_district, title, message, type, related_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [recipientRole, jurisdictionDistrict, title, message, type, relatedId]
  );
  return result.rows[0];
};

/**
 * Retrieve notifications for a specific admin based on role and district jurisdiction
 */
export const getNotificationsForAdmin = async (role, jurisdictionDistrict = null, limit = 50, offset = 0) => {
  let query = '';
  let params = [];

  if (role === 'super_admin') {
    // Super admins see all notifications
    query = `
      SELECT id, recipient_role, jurisdiction_district, title, message, type, related_id, is_read, created_at
      FROM admin_notifications
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    params = [limit, offset];
  } else {
    // Police admins see role=police_admin or all, and matching district or null
    query = `
      SELECT id, recipient_role, jurisdiction_district, title, message, type, related_id, is_read, created_at
      FROM admin_notifications
      WHERE (recipient_role = 'police_admin' OR recipient_role = 'all')
        AND (jurisdiction_district IS NULL OR jurisdiction_district = $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    params = [jurisdictionDistrict, limit, offset];
  }

  const result = await db.query(query, params);
  return result.rows;
};

/**
 * Fetch total count of unread notifications for a specific admin scope
 */
export const getUnreadNotificationsCount = async (role, jurisdictionDistrict = null) => {
  let query = '';
  let params = [];

  if (role === 'super_admin') {
    query = `
      SELECT COUNT(*)::int AS count
      FROM admin_notifications
      WHERE is_read = false
    `;
  } else {
    query = `
      SELECT COUNT(*)::int AS count
      FROM admin_notifications
      WHERE is_read = false
        AND (recipient_role = 'police_admin' OR recipient_role = 'all')
        AND (jurisdiction_district IS NULL OR jurisdiction_district = $1)
    `;
    params = [jurisdictionDistrict];
  }

  const result = await db.query(query, params);
  return result.rows[0]?.count || 0;
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (id) => {
  const result = await db.query(
    'UPDATE admin_notifications SET is_read = true WHERE id = $1 RETURNING id, is_read',
    [id]
  );
  return result.rows[0];
};

/**
 * Mark all notifications in an admin's scope as read
 */
export const markAllNotificationsAsRead = async (role, jurisdictionDistrict = null) => {
  let query = '';
  let params = [];

  if (role === 'super_admin') {
    query = `
      UPDATE admin_notifications
      SET is_read = true
      WHERE is_read = false
      RETURNING id
    `;
  } else {
    query = `
      UPDATE admin_notifications
      SET is_read = true
      WHERE is_read = false
        AND (recipient_role = 'police_admin' OR recipient_role = 'all')
        AND (jurisdiction_district IS NULL OR jurisdiction_district = $1)
      RETURNING id
    `;
    params = [jurisdictionDistrict];
  }

  const result = await db.query(query, params);
  return result.rowCount;
};
