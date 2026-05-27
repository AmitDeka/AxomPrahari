import { db } from '../config/db.config.js';

/**
 * Insert a new feedback entry into the feedbacks table.
 * @param {number} citizenDbId - The database ID of the citizen.
 * @param {object} data - The feedback category, message, and image_url.
 * @returns {Promise<object>} The newly created feedback row.
 */
export const createFeedback = async (citizenDbId, data) => {
  const result = await db.query(
    `INSERT INTO feedbacks (citizen_id, feedback_category, message, image_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [
      citizenDbId,
      data.feedback_category,
      data.message,
      data.image_url || null
    ]
  );
  return result.rows[0];
};

/**
 * Retrieve a paginated list of all feedbacks with reporting citizen details.
 * @param {number} limit - Pagination limit.
 * @param {number} offset - Pagination offset.
 * @returns {Promise<object>} Object containing feedbacks list and total count.
 */
export const getFeedbacksList = async (limit = 10, offset = 0) => {
  const query = `
    SELECT f.id, f.feedback_category, f.message, f.image_url, f.created_at,
           u.full_name as citizen_name, u.phone_number as citizen_phone,
           u.email as citizen_email, u.citizen_id as citizen_code
    FROM feedbacks f
    JOIN users u ON f.citizen_id = u.id
    ORDER BY f.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await db.query(query, [limit, offset]);
  
  const countResult = await db.query('SELECT COUNT(*) FROM feedbacks');
  const total = parseInt(countResult.rows[0].count, 10);
  
  return {
    feedbacks: result.rows,
    total
  };
};
