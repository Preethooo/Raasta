// Accounts and sessions: scrypt password hashes and an HMAC-signed session cookie.
import crypto from 'node:crypto';
import { HttpError, parseCookies, type Req, type Res } from './http.js';

const COOKIE = 'raasta_session';
const SESSION_HOURS = 24 * 7;

export type Session = { uid: string; role: 'supplier' | 'admin'; exp: number };

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.VERCEL) throw new HttpError(500, 'SESSION_SECRET (32+ characters) is not configured.');
  return 'local-development-secret-not-for-production-use';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, saltB64, hashB64] = stored.split('$');
  if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64url'), expected.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(actual, expected);
}

function sign(payload: string) {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionCookie(uid: string, role: Session['role']): string {
  const body = Buffer.from(JSON.stringify({ uid, role, exp: Date.now() + SESSION_HOURS * 3600_000 })).toString('base64url');
  const token = `${body}.${sign(body)}`;
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_HOURS * 3600}${secure}`;
}

export function clearSessionCookie(): string {
  const secure = process.env.VERCEL ? '; Secure' : '';
  return `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

export function readSession(req: Req): Session | null {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const s = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

export function requireSession(req: Req, role?: Session['role']): Session {
  const s = readSession(req);
  if (!s) throw new HttpError(401, 'Please sign in.');
  if (role && s.role !== role) throw new HttpError(403, 'You don’t have access to this.');
  return s;
}

/** CSRF guard: mutating requests must carry a custom header (forces a CORS preflight cross-site). */
export function requireCsrfHeader(req: Req) {
  if (req.headers['x-raasta-client'] !== '1') throw new HttpError(403, 'Missing client header.');
}

export function setCookie(res: Res, cookie: string) {
  res.setHeader('Set-Cookie', cookie);
}
