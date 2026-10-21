// Compatibility endpoint for older deployments that used api/_lib.js as a helper.
// The current server helper is kept safely outside /api in /lib/server.js.
import { sendJson } from '../server-lib.js';

export default function handler(_req, res) {
  return sendJson(res, 404, { error: 'Endpoint tidak tersedia.' });
}
