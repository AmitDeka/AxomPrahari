import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ [Database Warning] DATABASE_URL is not set in environment variables.');
}

// Determine if SSL is needed:
// - Disabled if DB_SSL=false, or when connecting to localhost/127.0.0.1 without sslmode=require (e.g. GitHub Actions CI)
// - Enabled for cloud databases (Neon, Render, Supabase, AWS RDS)
const getSslConfig = () => {
  if (process.env.DB_SSL === 'false') return false;
  if (!connectionString) return false;

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  if (isLocal && !connectionString.includes('sslmode=require')) {
    return false;
  }

  return {
    rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true',
  };
};

const sslConfig = getSslConfig();

export const db = new Pool({
  connectionString: connectionString || 'postgresql://postgres:postgres@localhost:5432/axomprahari',
  ...(sslConfig ? { ssl: sslConfig } : {}),
  max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
  idleTimeoutMillis: 30000, // Close idle clients after 30s (prevents holding ghost connections when Neon auto-suspends)
  connectionTimeoutMillis: 10000, // 10s connection timeout for cold-start wakeups
});

// Critical for serverless databases like Neon:
// When Neon scales compute to zero, idle connections are closed server-side.
// Handling this listener prevents unhandled error exceptions from terminating the Express process.
db.on('error', (err) => {
  console.error('[PostgreSQL Pool Warning] Unexpected idle client error:', err.message);
});
