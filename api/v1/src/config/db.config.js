import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const db = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for hosted databases with self-signed certificates
      },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_db_password',
      database: process.env.DB_NAME || 'axomprahari',
    });
