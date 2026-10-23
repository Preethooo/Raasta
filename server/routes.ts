// Every /api route. One function on Vercel (Hobby plan allows only 12), routed here.
import crypto from 'node:crypto';
import { getDb, type Db } from './db.js';
import {
  clearSessionCookie,
  createSessionCookie,
  hashPassword,
  requireCsrfHeader,
  requireSession,
  readSession,
  setCookie,
  verifyPassword,
  type Session,
} from './auth.js';
import { HttpError, readJson, send, type Req, type Res } from './http.js';
import { EMPTY_LISTING, SUPPLIER_CATEGORIES, normaliseListing, type ListingContent } from '../src/shared/marketplace.js';

type Ctx = { req: Req; res: Res; db: Db; params: Record<string, string>; query: URLSearchParams };
type Handler = (ctx: Ctx) => Promise<void>;

// ---- helpers ---------------------------------------------------------------------------

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const categoriesFrom = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter((c) => SUPPLIER_CATEGORIES.some((k) => k.id === c)).slice(0, 10);

type ListingRow = {
  id: string;
  supplier_id: string;
  status: string;
  draft: ListingContent;
  published: ListingContent | null;
  review_note: string;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const listingOut = (r: ListingRow) => ({
  id: r.id,
  status: r.status,
  draft: r.draft,
  published: r.published,
  reviewNote: r.review_note,
  submittedAt: r.submitted_at,
  publishedAt: r.published_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  hasDraftChanges: !!r.published && JSON.stringify(r.published) !== JSON.stringify(r.draft),
});

type SupplierRow = {
  id: string;
  user_id: string;
  business_name: string;
  phone: string;
  city: string;
  about: string;
  categories: string[];
  status: string;
  created_at: string;
  email?: string;
  name?: string;
};
const supplierOut = (s: SupplierRow) => ({
  id: s.id,
  businessName: s.business_name,
  phone: s.phone,
  city: s.city,
  about: s.about,
  categories: s.categories,
  status: s.status,
  createdAt: s.created_at,
  ...(s.email ? { email: s.email, contactName: s.name } : {}),
});

async function supplierFor(db: Db, s: Session): Promise<SupplierRow> {
  const [row] = await db.query<SupplierRow>(`SELECT * FROM suppliers WHERE user_id = $1`, [s.uid]);
  if (!row) throw new HttpError(403, 'No supplier profile for this account.');
  return row;
}

async function ownListing(db: Db, supplierId: string, id: string): Promise<ListingRow> {
  if (!UUID.test(id)) throw new HttpError(404, 'Listing not found.');
  const [row] = await db.query<ListingRow>(`SELECT * FROM listings WHERE id = $1 AND supplier_id = $2`, [id, supplierId]);
  if (!row) throw new HttpError(404, 'Listing not found.');
  return row;
}

async function logEvent(db: Db, listingId: string, actorId: string, action: string, note = '') {
  await db.query(`INSERT INTO listing_events (listing_id, actor_id, action, note) VALUES ($1, $2, $3, $4)`, [
    listingId,
    actorId,
    action,
    note,
  ]);
}

// Best-effort brute-force brake (per warm instance).
const attempts = new Map<string, { n: number; until: number }>();
function throttle(key: string) {
  const a = attempts.get(key);
  if (a && a.until > Date.now() && a.n >= 8) throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
}
function recordFailure(key: string) {
  const a = attempts.get(key);
  const fresh = !a || a.until < Date.now();
  attempts.set(key, { n: fresh ? 1 : a!.n + 1, until: Date.now() + 10 * 60_000 });
}

// ---- auth ------------------------------------------------------------------------------

const signup: Handler = async ({ req, res, db }) => {
  requireCsrfHeader(req);
  const b = await readJson(req);
  const email = text(b.email, 200).toLowerCase();
  const password = typeof b.password === 'string' ? b.password : '';
  const name = text(b.name, 100);
  const businessName = text(b.businessName, 120);
  if (!EMAIL.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (password.length < 8) throw new HttpError(400, 'Use a password of at least 8 characters.');
  if (!name || !businessName) throw new HttpError(400, 'Your name and business name are required.');
  const [exists] = await db.query(`SELECT 1 FROM users WHERE email = $1`, [email]);
  if (exists) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
  const [user] = await db.query<{ id: string }>(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'supplier') RETURNING id`,
    [email, hashPassword(password), name],
  );
  await db.query(
    `INSERT INTO suppliers (user_id, business_name, phone, city, categories) VALUES ($1, $2, $3, $4, $5)`,
    [user.id, businessName, text(b.phone, 40), text(b.city, 80), JSON.stringify(categoriesFrom(b.categories))],
  );
  setCookie(res, createSessionCookie(user.id, 'supplier'));
  send(res, 201, { ok: true });
};

const login: Handler = async ({ req, res, db }) => {
  requireCsrfHeader(req);
  const b = await readJson(req);
  const email = text(b.email, 200).toLowerCase();
  const key = `login:${email}`;
  throttle(key);
  const [user] = await db.query<{ id: string; password_hash: string; role: Session['role'] }>(
    `SELECT id, password_hash, role FROM users WHERE email = $1`,
    [email],
  );
  if (!user || !verifyPassword(String(b.password || ''), user.password_hash)) {
    recordFailure(key);
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  attempts.delete(key);
  setCookie(res, createSessionCookie(user.id, user.role));
  send(res, 200, { ok: true, role: user.role });
};

const logout: Handler = async ({ req, res }) => {
  requireCsrfHeader(req);
  setCookie(res, clearSessionCookie());
  send(res, 200, { ok: true });
};

const me: Handler = async ({ req, res, db }) => {
  const s = readSession(req);
  if (!s) return send(res, 200, { user: null });
  const [user] = await db.query<{ id: string; email: string; name: string; role: string }>(
    `SELECT id, email, name, role FROM users WHERE id = $1`,
    [s.uid],
  );
  if (!user) return send(res, 200, { user: null });
  const supplier = user.role === 'supplier' ? supplierOut(await supplierFor(db, s)) : null;
  send(res, 200, { user, supplier });
};

// ---- supplier ---------------------------------------------------------------------------

const getProfile: Handler = async ({ req, res, db }) => {
  const s = requireSession(req, 'supplier');
  send(res, 200, { supplier: supplierOut(await supplierFor(db, s)) });
};

const updateProfile: Handler = async ({ req, res, db }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const b = await readJson(req);
  const businessName = text(b.businessName, 120);
  if (!businessName) throw new HttpError(400, 'Business name is required.');
  const [row] = await db.query<SupplierRow>(
    `UPDATE suppliers SET business_name = $2, phone = $3, city = $4, about = $5, categories = $6, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [sup.id, businessName, text(b.phone, 40), text(b.city, 80), text(b.about, 2000), JSON.stringify(categoriesFrom(b.categories))],
  );
  send(res, 200, { supplier: supplierOut(row) });
};

const myListings: Handler = async ({ req, res, db }) => {
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const rows = await db.query<ListingRow>(`SELECT * FROM listings WHERE supplier_id = $1 ORDER BY updated_at DESC`, [sup.id]);
  send(res, 200, { listings: rows.map(listingOut) });
};

const createListing: Handler = async ({ req, res, db }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const b = await readJson(req);
  const { value } = normaliseListing({ ...EMPTY_LISTING, ...(b.draft as object) });
  const [row] = await db.query<ListingRow>(`INSERT INTO listings (supplier_id, draft) VALUES ($1, $2) RETURNING *`, [
    sup.id,
    JSON.stringify(value),
  ]);
  await logEvent(db, row.id, s.uid, 'created');
  send(res, 201, { listing: listingOut(row) });
};

const getMyListing: Handler = async ({ req, res, db, params }) => {
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  send(res, 200, { listing: listingOut(await ownListing(db, sup.id, params.id)) });
};

const updateListing: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const current = await ownListing(db, sup.id, params.id);
  const b = await readJson(req);
  const { value } = normaliseListing(b.draft);
  // Editing always returns the listing to draft; the live version stays live until approved.
  const [row] = await db.query<ListingRow>(
    `UPDATE listings SET draft = $2, status = 'draft', review_note = '', updated_at = now() WHERE id = $1 RETURNING *`,
    [current.id, JSON.stringify(value)],
  );
  if (current.status === 'pending') await logEvent(db, current.id, s.uid, 'withdrawn', 'Edited after submitting');
  send(res, 200, { listing: listingOut(row) });
};

const submitListing: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const current = await ownListing(db, sup.id, params.id);
  const { problems } = normaliseListing(current.draft);
  if (problems.length) throw new HttpError(400, 'Complete the listing before submitting.', problems);
  if (current.published && JSON.stringify(current.published) === JSON.stringify(current.draft)) {
    throw new HttpError(400, 'Nothing has changed since the live version.');
  }
  const [row] = await db.query<ListingRow>(
    `UPDATE listings SET status = 'pending', submitted_at = now(), review_note = '', updated_at = now() WHERE id = $1 RETURNING *`,
    [current.id],
  );
  await logEvent(db, current.id, s.uid, 'submitted');
  send(res, 200, { listing: listingOut(row) });
};

const takeOffline: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const current = await ownListing(db, sup.id, params.id);
  const [row] = await db.query<ListingRow>(
    `UPDATE listings SET published = NULL, published_at = NULL, status = 'draft', updated_at = now() WHERE id = $1 RETURNING *`,
    [current.id],
  );
  await logEvent(db, current.id, s.uid, 'taken offline', 'By supplier');
  send(res, 200, { listing: listingOut(row) });
};

const deleteListing: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'supplier');
  const sup = await supplierFor(db, s);
  const current = await ownListing(db, sup.id, params.id);
  if (current.published) throw new HttpError(409, 'Take the listing offline before deleting it.');
  await db.query(`DELETE FROM listings WHERE id = $1`, [current.id]);
  send(res, 200, { ok: true });
};

// ---- media ------------------------------------------------------------------------------

const MEDIA_TYPES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};
const MAX_MEDIA = 3 * 1024 * 1024;

const uploadMedia: Handler = async ({ req, res, db }) => {
  requireCsrfHeader(req);
  const s = requireSession(req);
  const b = await readJson<{ mime?: string; data?: string }>(req);
  const mime = String(b.mime || '');
  const magic = MEDIA_TYPES[mime];
  if (!magic) throw new HttpError(400, 'Upload a JPEG, PNG or WebP image.');
  const buf = Buffer.from(String(b.data || ''), 'base64');
  if (!buf.length) throw new HttpError(400, 'The image is empty.');
  if (buf.length > MAX_MEDIA) throw new HttpError(413, 'Image is too large (max 3 MB after resizing).');
  if (!magic.every((byte, i) => buf[i] === byte)) throw new HttpError(400, 'That file isn’t a valid image.');
  const [row] = await db.query<{ id: string }>(
    `INSERT INTO media (owner_id, mime, bytes, data) VALUES ($1, $2, $3, $4) RETURNING id`,
    [s.uid, mime, buf.length, buf],
  );
  send(res, 201, { url: `/api/media/${row.id}` });
};

const getMedia: Handler = async ({ res, db, params }) => {
  const id = params.id.slice(0, 36);
  if (!UUID.test(id)) throw new HttpError(404, 'Not found.');
  const [row] = await db.query<{ mime: string; data: Uint8Array }>(`SELECT mime, data FROM media WHERE id = $1`, [id]);
  if (!row) throw new HttpError(404, 'Not found.');
  res.statusCode = 200;
  res.setHeader('Content-Type', row.mime);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(Buffer.from(row.data));
};

// ---- admin ------------------------------------------------------------------------------

const adminOverview: Handler = async ({ req, res, db }) => {
  requireSession(req, 'admin');
  const [c] = await db.query<Record<string, string>>(
    `SELECT
       (SELECT count(*) FROM listings WHERE status = 'pending') AS pending,
       (SELECT count(*) FROM listings WHERE published IS NOT NULL) AS live,
       (SELECT count(*) FROM suppliers WHERE status = 'pending') AS suppliers_pending,
       (SELECT count(*) FROM suppliers) AS suppliers`,
  );
  send(res, 200, {
    pending: Number(c.pending),
    live: Number(c.live),
    suppliersPending: Number(c.suppliers_pending),
    suppliers: Number(c.suppliers),
  });
};

const adminListings: Handler = async ({ req, res, db, query }) => {
  requireSession(req, 'admin');
  const status = query.get('status') || 'pending';
  const where =
    status === 'all' ? '' : status === 'live' ? 'WHERE l.published IS NOT NULL' : 'WHERE l.status = $1';
  const rows = await db.query<ListingRow & { business_name: string; supplier_status: string }>(
    `SELECT l.*, s.business_name, s.status AS supplier_status FROM listings l JOIN suppliers s ON s.id = l.supplier_id
     ${where} ORDER BY COALESCE(l.submitted_at, l.updated_at) DESC LIMIT 200`,
    where.includes('$1') ? [status] : [],
  );
  send(res, 200, {
    listings: rows.map((r) => ({ ...listingOut(r), supplier: { name: r.business_name, status: r.supplier_status } })),
  });
};

const adminListing: Handler = async ({ req, res, db, params }) => {
  requireSession(req, 'admin');
  if (!UUID.test(params.id)) throw new HttpError(404, 'Listing not found.');
  const [row] = await db.query<ListingRow>(`SELECT * FROM listings WHERE id = $1`, [params.id]);
  if (!row) throw new HttpError(404, 'Listing not found.');
  const [sup] = await db.query<SupplierRow>(
    `SELECT s.*, u.email, u.name FROM suppliers s JOIN users u ON u.id = s.user_id WHERE s.id = $1`,
    [row.supplier_id],
  );
  const events = await db.query(
    `SELECT e.action, e.note, e.created_at AS "createdAt", u.name AS actor, u.role AS "actorRole"
     FROM listing_events e LEFT JOIN users u ON u.id = e.actor_id WHERE e.listing_id = $1 ORDER BY e.created_at DESC`,
    [row.id],
  );
  send(res, 200, { listing: listingOut(row), supplier: supplierOut(sup), events });
};

const approveListing: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'admin');
  if (!UUID.test(params.id)) throw new HttpError(404, 'Listing not found.');
  const [row] = await db.query<ListingRow & { supplier_status: string }>(
    `SELECT l.*, s.status AS supplier_status FROM listings l JOIN suppliers s ON s.id = l.supplier_id WHERE l.id = $1`,
    [params.id],
  );
  if (!row) throw new HttpError(404, 'Listing not found.');
  if (row.status !== 'pending') throw new HttpError(409, 'Only submitted listings can be approved.');
  if (row.supplier_status !== 'verified') throw new HttpError(409, 'Verify this supplier before approving their listing.');
  const [updated] = await db.query<ListingRow>(
    `UPDATE listings SET published = draft, status = 'live', published_at = now(), review_note = '', updated_at = now()
     WHERE id = $1 RETURNING *`,
    [row.id],
  );
  await logEvent(db, row.id, s.uid, 'approved');
  send(res, 200, { listing: listingOut(updated) });
};

const rejectListing: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'admin');
  const b = await readJson(req);
  const note = text(b.note, 1000);
  if (!note) throw new HttpError(400, 'Tell the supplier what to change.');
  if (!UUID.test(params.id)) throw new HttpError(404, 'Listing not found.');
  const [row] = await db.query<ListingRow>(
    `UPDATE listings SET status = 'rejected', review_note = $2, updated_at = now() WHERE id = $1 AND status = 'pending' RETURNING *`,
    [params.id, note],
  );
  if (!row) throw new HttpError(409, 'Only submitted listings can be sent back.');
  await logEvent(db, row.id, s.uid, 'changes requested', note);
  send(res, 200, { listing: listingOut(row) });
};

const adminUnpublish: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  const s = requireSession(req, 'admin');
  if (!UUID.test(params.id)) throw new HttpError(404, 'Listing not found.');
  const [row] = await db.query<ListingRow>(
    `UPDATE listings SET published = NULL, published_at = NULL, status = 'draft', updated_at = now() WHERE id = $1 RETURNING *`,
    [params.id],
  );
  if (!row) throw new HttpError(404, 'Listing not found.');
  await logEvent(db, row.id, s.uid, 'taken offline', 'By Raasta');
  send(res, 200, { listing: listingOut(row) });
};

const adminSuppliers: Handler = async ({ req, res, db }) => {
  requireSession(req, 'admin');
  const rows = await db.query<SupplierRow & { listings: string; live: string }>(
    `SELECT s.*, u.email, u.name,
       (SELECT count(*) FROM listings l WHERE l.supplier_id = s.id) AS listings,
       (SELECT count(*) FROM listings l WHERE l.supplier_id = s.id AND l.published IS NOT NULL) AS live
     FROM suppliers s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC`,
  );
  send(res, 200, {
    suppliers: rows.map((r) => ({ ...supplierOut(r), listings: Number(r.listings), live: Number(r.live) })),
  });
};

const setSupplierStatus: Handler = async ({ req, res, db, params }) => {
  requireCsrfHeader(req);
  requireSession(req, 'admin');
  const b = await readJson(req);
  const status = String(b.status);
  if (!['pending', 'verified', 'suspended'].includes(status)) throw new HttpError(400, 'Unknown status.');
  if (!UUID.test(params.id)) throw new HttpError(404, 'Supplier not found.');
  const [row] = await db.query<SupplierRow>(
    `UPDATE suppliers SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [params.id, status],
  );
  if (!row) throw new HttpError(404, 'Supplier not found.');
  send(res, 200, { supplier: supplierOut(row) });
};

// ---- public -----------------------------------------------------------------------------

const catalog: Handler = async ({ res, db, query }) => {
  const category = query.get('category');
  const adventure = query.get('adventure');
  const filters: string[] = [];
  const args: string[] = [];
  if (category) filters.push(`AND l.published->>'category' = $${args.push(category)}`);
  if (adventure) filters.push(`AND l.published->'adventures' ? $${args.push(adventure)}`);
  const rows = await db.query<{ id: string; published: ListingContent; published_at: string; business_name: string; city: string }>(
    `SELECT l.id, l.published, l.published_at, s.business_name, s.city
     FROM listings l JOIN suppliers s ON s.id = l.supplier_id
     WHERE l.published IS NOT NULL AND s.status = 'verified'
       ${filters.join(' ')}
     ORDER BY l.published_at DESC LIMIT 200`,
    args,
  );
  send(
    res,
    200,
    {
      items: rows.map((r) => ({
        id: r.id,
        ...EMPTY_LISTING,
        ...r.published,
        supplier: { name: r.business_name, city: r.city },
        publishedAt: r.published_at,
      })),
    },
    { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' },
  );
};

// ---- routing ----------------------------------------------------------------------------

const ROUTES: [string, string, Handler][] = [
  ['POST', 'auth/signup', signup],
  ['POST', 'auth/login', login],
  ['POST', 'auth/logout', logout],
  ['GET', 'auth/me', me],
  ['GET', 'supplier/profile', getProfile],
  ['PUT', 'supplier/profile', updateProfile],
  ['GET', 'supplier/listings', myListings],
  ['POST', 'supplier/listings', createListing],
  ['GET', 'supplier/listings/:id', getMyListing],
  ['PUT', 'supplier/listings/:id', updateListing],
  ['DELETE', 'supplier/listings/:id', deleteListing],
  ['POST', 'supplier/listings/:id/submit', submitListing],
  ['POST', 'supplier/listings/:id/offline', takeOffline],
  ['POST', 'media', uploadMedia],
  ['GET', 'media/:id', getMedia],
  ['GET', 'admin/overview', adminOverview],
  ['GET', 'admin/listings', adminListings],
  ['GET', 'admin/listings/:id', adminListing],
  ['POST', 'admin/listings/:id/approve', approveListing],
  ['POST', 'admin/listings/:id/reject', rejectListing],
  ['POST', 'admin/listings/:id/unpublish', adminUnpublish],
  ['GET', 'admin/suppliers', adminSuppliers],
  ['POST', 'admin/suppliers/:id/status', setSupplierStatus],
  ['GET', 'catalog', catalog],
];

const compiled = ROUTES.map(([method, pattern, handler]) => {
  const names: string[] = [];
  const re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, n) => (names.push(n), '([^/]+)')) + '$');
  return { method, re, names, handler };
});

/** Entry point shared by Vercel (api/index.ts) and the local dev server. */
export async function handle(req: Req, res: Res, path: string, query: URLSearchParams) {
  try {
    const clean = path.replace(/^\/+|\/+$/g, '').replace(/^api\//, '');
    let methodMismatch = false;
    for (const r of compiled) {
      const m = clean.match(r.re);
      if (!m) continue;
      if (r.method !== req.method) {
        methodMismatch = true;
        continue;
      }
      const params: Record<string, string> = {};
      r.names.forEach((n, i) => (params[n] = decodeURIComponent(m[i + 1])));
      const db = await getDb();
      return await r.handler({ req, res, db, params, query });
    }
    throw new HttpError(methodMismatch ? 405 : 404, methodMismatch ? 'Method not allowed.' : 'Not found.');
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message, details: e.details });
    console.error('[api]', e);
    send(res, 500, { error: 'Something went wrong on our side.' });
  }
}

export const newId = () => crypto.randomUUID();
