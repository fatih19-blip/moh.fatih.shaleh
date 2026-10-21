import { isAuthenticated, sendJson } from '../_lib.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  return sendJson(res, 200, { authenticated: isAuthenticated(req) });
}
