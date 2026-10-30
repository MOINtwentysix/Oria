import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import placesRouter from './routes/places';
import routingRouter from './routes/routing';
import aiRouter from './routes/ai';
import listsRouter from './routes/lists';
import usersRouter from './routes/users';
import partnersRouter from './routes/partners';
import { query } from './db';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Clerk Backend Authentication
if (process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  console.log('🔒 [Clerk Auth] JWT Verification enabled.');
} else {
  console.log('ℹ️  [Clerk Auth] CLERK_SECRET_KEY nicht gesetzt. Backend läuft im Entwicklermodus.');
}

// Health & Status
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const test = await query('SELECT 1 as connected');
    if (test.rows.length > 0) dbStatus = 'connected';
  } catch {}

  res.json({
    status: 'ok',
    service: 'Oria Location Discovery API',
    version: '1.0.0',
    database: dbStatus,
    aiProvider: process.env.MISTRAL_API_KEY ? 'mistral' : process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'grounded-engine',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/places', placesRouter);
app.use('/api/routing', routingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/lists', listsRouter);
app.use('/api/users', usersRouter);
app.use('/api/partners', partnersRouter);

// Auto-run schema migration if DATABASE_URL is set
async function initDb() {
  if (process.env.DATABASE_URL) {
    try {
      const schemaPath = path.join(__dirname, 'db', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await query(sql);
        console.log('[Neon PostgreSQL] Schema verified and up to date.');
      }
    } catch (err) {
      console.warn('[Neon PostgreSQL] Migration notice:', err);
    }
  }
}

let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized && process.env.DATABASE_URL) {
    dbInitialized = true;
    initDb().catch((e) => console.warn('Neon DB init error:', e));
  }
  next();
});

if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`✨ Oria Backend Server running on http://localhost:${PORT}`);
    await initDb();
  });
}

export default app;
