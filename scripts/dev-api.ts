// Local API server for `npm run dev:api` (Vite proxies /api here). Uses the embedded database
// in .data/pglite. First run: an admin is created from ADMIN_EMAIL / ADMIN_PASSWORD, or use
// `npm run admin:create -- you@example.com your-password`.
import http from 'node:http';
import { handle } from '../server/routes.js';

const PORT = Number(process.env.API_PORT || 8787);
process.env.ADMIN_EMAIL ||= 'admin@raasta.local';
process.env.ADMIN_PASSWORD ||= 'raasta-admin';

http
  .createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    void handle(req, res, url.pathname.replace(/^\/api\/?/, ''), url.searchParams);
  })
  .listen(PORT, () => console.log(`Raasta API on http://localhost:${PORT} (admin: ${process.env.ADMIN_EMAIL})`));
