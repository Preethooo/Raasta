// Creates (or promotes) an admin account.
//   npm run admin:create -- you@example.com 'a-strong-password' "Your name"
// Uses DATABASE_URL when set (production), otherwise the local embedded database.
import { getDb } from '../server/db.js';
import { hashPassword } from '../server/auth.js';

const [email, password, name = 'Raasta admin'] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- <email> <password (10+ chars)> [name]');
  process.exit(1);
}
const db = await getDb();
await db.query(
  `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'admin')
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', name = EXCLUDED.name`,
  [email.toLowerCase(), hashPassword(password), name],
);
console.log(`Admin ready: ${email.toLowerCase()}`);
process.exit(0);
