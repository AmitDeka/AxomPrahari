import { db } from '../config/db.config.js';

export const generateUniqueCitizenId = async () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let isUnique = false;
  let citizenId = '';
  
  while (!isUnique) {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    citizenId = `APC-${code}`;
    
    // Check if it already exists
    const result = await db.query('SELECT id FROM users WHERE citizen_id = $1', [citizenId]);
    if (result.rows.length === 0) {
      isUnique = true;
    }
  }
  
  return citizenId;
};

export const findUserByPhone = async (phone) => {
  const result = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone]);
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const createIncompleteCitizen = async (phone) => {
  const citizenId = await generateUniqueCitizenId();
  const result = await db.query(
    `INSERT INTO users (citizen_id, phone_number, role, profile_status) 
     VALUES ($1, $2, 'citizen', 'incomplete') RETURNING *`,
    [citizenId, phone]
  );
  return result.rows[0];
};

export const completeCitizenProfile = async (id, fullName, email, username) => {
  const result = await db.query(
    `UPDATE users 
     SET full_name = $1, email = $2, username = $3, profile_status = 'complete' 
     WHERE id = $4 RETURNING *`,
    [fullName, email, username, id]
  );
  return result.rows[0];
};

export const createAdminUser = async (email, passwordHash, fullName, role, rank, jurisdictionDistrict) => {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role, full_name, rank, jurisdiction_district, profile_status) 
     VALUES ($1, $2, $3, $4, $5, $6, 'complete') RETURNING *`,
    [email, passwordHash, role, fullName, rank, jurisdictionDistrict]
  );
  return result.rows[0];
};

export const findAdminById = async (id) => {
  const result = await db.query(
    'SELECT id, email, role, full_name, is_active, rank, jurisdiction_district FROM users WHERE id = $1 AND role IN (\'police_admin\', \'super_admin\')',
    [id]
  );
  return result.rows[0];
};

export const deleteAdminUser = async (id) => {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 AND role IN (\'police_admin\', \'super_admin\') RETURNING id',
    [id]
  );
  return result.rows[0];
};

export const updateAdminStatus = async (id, isActive) => {
  const result = await db.query(
    'UPDATE users SET is_active = $1 WHERE id = $2 AND role IN (\'police_admin\', \'super_admin\') RETURNING id, is_active',
    [isActive, id]
  );
  return result.rows[0];
};

export const getAllAdmins = async () => {
  const result = await db.query(
    `SELECT id, email, role, full_name, is_active, rank, jurisdiction_district, created_at 
     FROM users 
     WHERE role IN ('police_admin', 'super_admin') 
     ORDER BY id DESC`
  );
  return result.rows;
};

export const getAdminPasswordChangedAt = async (id) => {
  const result = await db.query('SELECT password_changed_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const updateAdminProfile = async (id, updateData) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (updateData.full_name) {
    fields.push(`full_name = $${index++}`);
    values.push(updateData.full_name);
  }
  if (updateData.username) {
    fields.push(`username = $${index++}`);
    values.push(updateData.username);
  }
  if (updateData.email) {
    fields.push(`email = $${index++}`);
    values.push(updateData.email);
  }
  if (updateData.password_hash) {
    fields.push(`password_hash = $${index++}`);
    values.push(updateData.password_hash);
    fields.push(`password_changed_at = CURRENT_TIMESTAMP`);
  }
  if (updateData.rank) {
    fields.push(`rank = $${index++}`);
    values.push(updateData.rank);
  }
  if (updateData.jurisdiction_district) {
    fields.push(`jurisdiction_district = $${index++}`);
    values.push(updateData.jurisdiction_district);
  }
  if (updateData.role) {
    fields.push(`role = $${index++}`);
    values.push(updateData.role);
  }

  if (fields.length === 0) return null;

  values.push(id);
  
  const query = `
    UPDATE users 
    SET ${fields.join(', ')} 
    WHERE id = $${index} AND role IN ('police_admin', 'super_admin') 
    RETURNING id, full_name, email, username, role, rank, jurisdiction_district
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

export const getUserProfileById = async (id) => {
  const result = await db.query(
    'SELECT citizen_id, full_name, email, username, role, is_active, reward_points, rank, jurisdiction_district FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

export const invalidateToken = async (token, expiresAt) => {
  await db.query(
    'INSERT INTO invalidated_tokens (token, expires_at) VALUES ($1, $2) ON CONFLICT (token) DO NOTHING',
    [token, expiresAt]
  );
};

export const isTokenInvalidated = async (token) => {
  const result = await db.query('SELECT token FROM invalidated_tokens WHERE token = $1', [token]);
  return result.rows.length > 0;
};

export const updateCitizenProfile = async (id, updateData) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (updateData.full_name) {
    fields.push(`full_name = $${index++}`);
    values.push(updateData.full_name);
  }
  if (updateData.email) {
    fields.push(`email = $${index++}`);
    values.push(updateData.email);
  }

  if (fields.length === 0) return null;

  values.push(id);
  
  const query = `
    UPDATE users 
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${index} AND role = 'citizen' 
    RETURNING id, citizen_id, full_name, email, username, role, reward_points
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

export const deleteUserById = async (id) => {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 AND role = \'citizen\' RETURNING id',
    [id]
  );
  return result.rows[0];
};

export const toggleUserActiveStatus = async (id, isActive) => {
  const result = await db.query(
    'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND role = \'citizen\' RETURNING id, is_active',
    [isActive, id]
  );
  return result.rows[0];
};

export const getCitizensListWithStats = async (limit = 10, offset = 0) => {
  const query = `
    SELECT 
      u.id, 
      u.citizen_id,
      u.full_name, 
      u.phone_number, 
      u.username, 
      u.email, 
      u.is_active,
      u.reward_points,
      COALESCE(COUNT(CASE WHEN r.status = 'pending' THEN 1 END), 0) AS pending_count,
      COALESCE(COUNT(CASE WHEN r.status = 'accepted' THEN 1 END), 0) AS accepted_count,
      COALESCE(COUNT(CASE WHEN r.status = 'rejected' THEN 1 END), 0) AS rejected_count
    FROM users u
    LEFT JOIN violation_reports r ON u.id = r.citizen_id
    WHERE u.role = 'citizen'
    GROUP BY u.id
    ORDER BY u.id DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await db.query(query, [limit, offset]);
  
  const countResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'citizen'");
  const totalCount = parseInt(countResult.rows[0].count, 10);
  
  return {
    citizens: result.rows,
    totalCount
  };
};
