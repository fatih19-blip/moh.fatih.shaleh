import crypto from 'node:crypto';
import { createSessionToken, sendJson, setSessionCookie, readJson } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!process.env.ADMIN_PASSWORD) {
    return sendJson(res, 500, { error: 'Password admin belum diatur. Buka Vercel → Settings → Environment Variables, lalu tambahkan ADMIN_PASSWORD.' });
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return sendJson(res, 500, { error: 'SESSION_SECRET belum diatur. Tambahkan rahasia acak minimal 32 karakter di Environment Variables Vercel.' });
  }
  try {
    const body = await readJson(req);
    const supplied = Buffer.from(String(body.password ?? ''));
    const expected = Buffer.from(process.env.ADMIN_PASSWORD);
    const valid = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
    if (!valid) return sendJson(res, 401, { error: 'Password salah. Periksa lagi password yang dimasukkan.' });
    const token = createSessionToken();
    setSessionCookie(req, res, token);
    return sendJson(res, 200, { ok: true, message: 'Login berhasil.' });
  } catch (error) {
    console.error('Login error:', error);
    return sendJson(res, 500, { error: 'Login gagal karena konfigurasi server. Periksa Environment Variables Vercel.' });
  }
}
