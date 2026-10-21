import { clearSessionCookie, sendJson } from '../server-lib.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  clearSessionCookie(req, res);
  return sendJson(res, 200, { ok: true });
}
