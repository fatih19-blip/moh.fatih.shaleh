import { sendJson, storageConfigured } from './_lib.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  return sendJson(res, 200, {
    ok: true,
    platform: 'vercel-functions',
    adminPasswordConfigured: Boolean(process.env.ADMIN_PASSWORD),
    sessionSecretConfigured: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32),
    blobStorageConfigured: storageConfigured()
  });
}
