import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const isHosted = !!process.env.DATABASE_URL;

// Determine if SSL is needed:
// - Disabled if DB_SSL=false, or when connecting to localhost/127.0.0.1 without sslmode=require (e.g. GitHub Actions CI)
// - Enabled for cloud databases (Neon, Render, Supabase, AWS RDS)
const getSslConfig = () => {
  if (process.env.DB_SSL === 'false') return false;
  if (!process.env.DATABASE_URL) return false;

  const url = process.env.DATABASE_URL;
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');

  if (isLocal && !url.includes('sslmode=require')) {
    return false;
  }

  return {
    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true',
  };
};

const sslConfig = getSslConfig();

export const db = isHosted
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ...(sslConfig ? { ssl: sslConfig } : {}),
      max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
      idleTimeoutMillis: 30000, // Close idle clients after 30s (prevents holding ghost connections when Neon auto-suspends)
      connectionTimeoutMillis: 10000, // 10s connection timeout for cold-start wakeups
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'your_db_password',
      database: process.env.DB_NAME || 'axomprahari',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

// Critical for serverless databases like Neon:
// When Neon scales compute to zero, idle connections are closed server-side.
// Handling this listener prevents unhandled error exceptions from terminating the Express process.
db.on('error', (err) => {
  console.error('[PostgreSQL Pool Warning] Unexpected idle client error:', err.message);
});
