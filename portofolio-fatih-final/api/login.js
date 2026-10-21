import crypto from 'node:crypto';
import { createSessionToken, sendJson, setSessionCookie, readJson } from '../server-lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  const expectedText = process.env.ADMIN_PASSWORD;
  if (!expectedText) return sendJson(res, 500, { error: 'Password admin belum diatur. Tambahkan ADMIN_PASSWORD pada Environment Variables Vercel.' });
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return sendJson(res, 500, { error: 'Pengaturan server belum lengkap: SESSION_SECRET harus minimal 32 karakter.' });
  }
  try {
    const body = await readJson(req);
    const supplied = Buffer.from(String(body.password ?? ''));
    const expected = Buffer.from(expectedText);
    const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
    if (!valid) return sendJson(res, 401, { error: 'Password salah. Periksa kembali password admin.' });
    setSessionCookie(req, res, createSessionToken());
    return sendJson(res, 200, { ok: true, message: 'Login berhasil.' });
  } catch (error) {
    console.error('Login error:', error.message);
    return sendJson(res, 500, { error: error.message || 'Login gagal karena konfigurasi server.' });
  }
}
