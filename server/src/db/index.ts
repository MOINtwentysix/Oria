import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Check if DATABASE_URL is provided
const databaseUrl = process.env.DATABASE_URL;

let pool: Pool | null = null;

if (databaseUrl) {
  try {
    pool = new Pool({ connectionString: databaseUrl });
    console.log('[Neon PostgreSQL] Initialized database pool.');
  } catch (err) {
    console.error('[Neon PostgreSQL] Failed to initialize pool:', err);
  }
} else {
  console.log('[Neon PostgreSQL] Notice: DATABASE_URL not set in environment. Running in decoupled mode.');
}

export async function query(text: string, params?: any[]) {
  if (!pool) {
    return { rows: [] };
  }
  return pool.query(text, params);
}

export { pool };
