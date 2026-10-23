// Vercel function: every /api/* request is rewritten here (see vercel.json) with ?__path=.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle } from '../server/routes.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || '/', 'http://localhost');
  const path = url.searchParams.get('__path') || url.pathname.replace(/^\/api\/?/, '');
  url.searchParams.delete('__path');
  await handle(req, res, path, url.searchParams);
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };
