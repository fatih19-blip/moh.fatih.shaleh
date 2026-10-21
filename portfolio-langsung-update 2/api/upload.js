import crypto from 'node:crypto';
import { put } from '@vercel/blob';
import { isAuthenticated, readJson, sendJson, storageConfigured } from './_lib.js';

const allowed = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Sesi admin tidak aktif. Silakan login kembali.' });
  if (!storageConfigured()) return sendJson(res, 503, { error: 'Penyimpanan foto belum disiapkan. Buat Blob Store di Vercel dan hubungkan ke project ini.' });
  try {
    const body = await readJson(req);
    const contentType = String(body.contentType || '');
    const extension = allowed[contentType];
    const base64 = String(body.base64 || '');
    if (!extension || !base64) return sendJson(res, 400, { error: 'Pilih gambar JPG, PNG, WEBP, atau GIF.' });
    if (base64.length > 4_200_000) return sendJson(res, 413, { error: 'Ukuran gambar maksimal 3 MB.' });
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > 3 * 1024 * 1024) return sendJson(res, 413, { error: 'Ukuran gambar maksimal 3 MB.' });
    const pathname = `portfolio-uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000
    });
    return sendJson(res, 200, { ok: true, url: `${blob.url}?v=${Date.now()}` });
  } catch (error) {
    console.error('Upload error:', error);
    return sendJson(res, 500, { error: 'Foto gagal disimpan. Periksa konfigurasi Blob Store Vercel.' });
  }
}
