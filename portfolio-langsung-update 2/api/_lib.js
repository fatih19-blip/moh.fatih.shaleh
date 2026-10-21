import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { list, put } from '@vercel/blob';

const require = createRequire(import.meta.url);
const defaultPortfolio = require('../portfolio.json');
const COOKIE_NAME = 'portfolio_admin';
const SESSION_SECONDS = 8 * 60 * 60;
const DATA_PATH = 'portfolio-data.json';

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString('utf8'));
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}');
}

function constantTimeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET belum diatur. Atur rahasia minimal 32 karakter di Environment Variables Vercel.');
  const payload = Buffer.from(JSON.stringify({ admin: true, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function isAuthenticated(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return false;
  const header = req.headers.cookie || '';
  const token = header.split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot < 1) return false;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  if (!constantTimeEqual(signature, sign(payload, secret))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.admin === true && Number(decoded.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function setSessionCookie(req, res, token) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`);
}

export function clearSessionCookie(req, res) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
}

export function storageConfigured() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

export async function loadPortfolio() {
  if (!storageConfigured()) return defaultPortfolio;
  const result = await list({ prefix: DATA_PATH, limit: 20 });
  const blob = (result.blobs || []).find(item => item.pathname === DATA_PATH);
  if (!blob) return defaultPortfolio;
  const response = await fetch(`${blob.url}?_fresh=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Data portofolio di penyimpanan tidak dapat dibaca.');
  return await response.json();
}

export async function savePortfolio(data) {
  if (!storageConfigured()) {
    const error = new Error('Penyimpanan belum disiapkan. Di Vercel, buka Storage, buat Blob Store, lalu hubungkan ke project ini.');
    error.code = 'STORAGE_NOT_CONFIGURED';
    throw error;
  }
  await put(DATA_PATH, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json; charset=utf-8',
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 5
  });
}

export function validatePortfolio(data) {
  const arrays = ['activities', 'experience', 'education', 'organizations', 'gallery'];
  return Boolean(data && typeof data === 'object' && data.profile && typeof data.profile === 'object' && arrays.every(key => Array.isArray(data[key])));
}

export function requireAdmin(req, res) {
  if (!isAuthenticated(req)) {
    sendJson(res, 401, { error: 'Sesi admin tidak aktif. Silakan login kembali.' });
    return false;
  }
  return true;
}
