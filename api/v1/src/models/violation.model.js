import { db } from '../config/db.config.js';

export const createViolation = async (data) => {
  const result = await db.query(
    `INSERT INTO violation_master (offence_name, mv_act_code, fine_amount, reward_points) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.offence_name, data.mv_act_code, data.fine_amount, data.reward_points || 0]
  );
  return result.rows[0];
};

export const getAllViolations = async (forAdmin = false) => {
  if (forAdmin) {
    const result = await db.query('SELECT * FROM violation_master ORDER BY id ASC');
    return result.rows;
  } else {
    // For citizens: Exclude fine_amount and only return active violations
    const result = await db.query(
      'SELECT id, offence_name, mv_act_code, reward_points FROM violation_master WHERE is_active = TRUE ORDER BY id ASC'
    );
    return result.rows;
  }
};

export const getViolationById = async (id) => {
  const result = await db.query('SELECT * FROM violation_master WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateViolation = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.offence_name) {
    fields.push(`offence_name = $${index++}`);
    values.push(data.offence_name);
  }
  if (data.mv_act_code) {
    fields.push(`mv_act_code = $${index++}`);
    values.push(data.mv_act_code);
  }
  if (data.fine_amount !== undefined) {
    fields.push(`fine_amount = $${index++}`);
    values.push(data.fine_amount);
  }
  if (data.reward_points !== undefined) {
    fields.push(`reward_points = $${index++}`);
    values.push(data.reward_points);
  }

  if (fields.length === 0) return null;
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);
  
  const query = `
    UPDATE violation_master 
    SET ${fields.join(', ')} 
    WHERE id = $${index} 
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

export const toggleViolationStatus = async (id, isActive) => {
  const result = await db.query(
    'UPDATE violation_master SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [isActive, id]
  );
  return result.rows[0];
};

export const deleteViolation = async (id) => {
  const result = await db.query(
    'DELETE FROM violation_master WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0];
};
