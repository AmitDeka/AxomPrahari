import bcrypt from 'bcrypt';
import { db } from './src/config/db.config.js';
import 'dotenv/config';

const seedSuperAdmin = async () => {
  try {
    const email = 'superadmin@axomprahari.in';
    const rawPassword = 'SuperAdmin@123';
    const fullName = 'Master Super Admin';

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

    // Insert
    const result = await db.query(
      `INSERT INTO users (email, password_hash, role, full_name, profile_status, is_active) 
       VALUES ($1, $2, 'super_admin', $3, 'complete', TRUE) 
       ON CONFLICT (email) DO NOTHING RETURNING *`,
      [email, passwordHash, fullName]
    );

    if (result.rows.length === 0) {
      console.log('Super Admin already exists or could not be created.');
    } else {
      console.log('✅ Super Admin created successfully!');
      console.log('--------------------------------------------------');
      console.log(`Email: ${email}`);
      console.log(`Password: ${rawPassword}`);
      console.log('--------------------------------------------------');
      console.log('Please log in and immediately change your password or delete this script.');
    }
  } catch (error) {
    console.error('Error seeding Super Admin:', error);
  } finally {
    process.exit(0);
  }
};

seedSuperAdmin();
