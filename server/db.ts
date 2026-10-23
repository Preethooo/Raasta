// Database access. Production: any Postgres via DATABASE_URL (or POSTGRES_URL, as Vercel's
// storage integrations name it). Local development: an embedded Postgres (PGlite) stored in
// .data/pglite, so the whole supplier portal runs with no setup.
import { hashPassword } from './auth.js';

export type Row = Record<string, unknown>;
export interface Db {
  query<T = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  exec(sql: string): Promise<void>;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('supplier', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  categories jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- A listing keeps two copies: the supplier's working draft and the version that is live
-- on the website. Admin approval copies draft -> published.
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'live', 'rejected')),
  draft jsonb NOT NULL,
  published jsonb,
  review_note text NOT NULL DEFAULT '',
  submitted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS listings_supplier_idx ON listings (supplier_id);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status);

-- Audit trail shown on the review screen.
CREATE TABLE IF NOT EXISTS listing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS listing_events_listing_idx ON listing_events (listing_id, created_at);

-- Uploaded photos live in Postgres, served from /api/media/<id>. One store, nothing else to configure.
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  mime text NOT NULL,
  bytes integer NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

let ready: Promise<Db> | null = null;

export function getDb(): Promise<Db> {
  if (!ready) {
    ready = connect().catch((e) => {
      ready = null; // allow a retry on the next request
      throw e;
    });
  }
  return ready;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let db: Db;
  if (url) {
    const { default: pg } = await import('pg');
    // max: 1 — each serverless instance only needs one connection; keeps managed Postgres
    // connection limits safe under bursts.
    const pool = new pg.Pool({ connectionString: url, max: 1, idleTimeoutMillis: 5000 });
    db = {
      query: async (sql, params) => (await pool.query(sql, params as unknown[])).rows,
      exec: async (sql) => {
        await pool.query(sql);
      },
    };
  } else if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is not set. Connect a Postgres database to this Vercel project.');
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const dir = process.env.PGLITE_DIR || '.data/pglite';
    (await import('node:fs')).mkdirSync(dir, { recursive: true });
    const lite = new PGlite(dir);
    db = {
      query: async (sql, params) => (await lite.query(sql, params as unknown[])).rows as never,
      exec: async (sql) => {
        await lite.exec(sql);
      },
    };
  }
  await db.exec(SCHEMA);
  await bootstrapAdmin(db);
  return db;
}

/** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if no admin exists yet. */
async function bootstrapAdmin(db: Db) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = await db.query(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`);
  if (existing.length) return;
  await db.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
    [email, hashPassword(password), process.env.ADMIN_NAME || 'Raasta admin'],
  );
}
