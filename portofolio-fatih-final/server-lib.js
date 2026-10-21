import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const defaultPortfolio = require('./portfolio.json');
const COOKIE_NAME = 'portfolio_admin';
const SESSION_SECONDS = 8 * 60 * 60;
const PORTFOLIO_PATH = 'portfolio.json';
const MAX_PORTFOLIO_BYTES = 1_000_000;

export const githubConfig = () => ({
  owner: process.env.GITHUB_OWNER || 'fatih19-blip',
  repo: process.env.GITHUB_REPO || 'moh.fatih.shaleh',
  branch: process.env.GITHUB_BRANCH || 'main'
});

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
  let size = 0;
  for await (const chunk of req) {
    const part = Buffer.from(chunk);
    size += part.length;
    if (size > 4 * 1024 * 1024) throw new Error('Permintaan terlalu besar. Kecilkan ukuran foto lalu coba lagi.');
    chunks.push(part);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(raw || '{}');
}

function timingSafeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionToken() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Pengaturan server belum lengkap: SESSION_SECRET harus minimal 32 karakter.');
  const payload = Buffer.from(JSON.stringify({ admin: true, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

export function isAuthenticated(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return false;
  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx < 1) return false;
  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  if (!timingSafeEqual(signature, sign(payload, secret))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.admin === true && Number(decoded.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function secureCookie(req) {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
}

export function setSessionCookie(req, res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secureCookie(req) ? '; Secure' : ''}`);
}

export function clearSessionCookie(req, res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureCookie(req) ? '; Secure' : ''}`);
}

export function requireAdmin(req, res) {
  if (!isAuthenticated(req)) {
    sendJson(res, 401, { error: 'Sesi admin sudah berakhir. Silakan login kembali.' });
    return false;
  }
  return true;
}

export function githubTokenConfigured() {
  return Boolean(process.env.GITHUB_TOKEN);
}

function repoPathUrl(path, query = {}) {
  const { owner, repo } = githubConfig();
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  const url = new URL(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
  return url;
}

async function githubFetch(path, options = {}, query = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const err = new Error('Token GitHub belum disiapkan di Vercel. Tambahkan GITHUB_TOKEN pada Settings → Environment Variables. Token tidak perlu dimasukkan ke halaman admin.');
    err.status = 503;
    throw err;
  }
  const response = await fetch(repoPathUrl(path, query), {
    method: options.method || 'GET',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = {}; }
  if (!response.ok) {
    const err = new Error(githubErrorMessage(response.status, payload.message));
    err.status = (response.status === 401 || response.status === 403) ? 502 : response.status;
    throw err;
  }
  return payload;
}

function githubErrorMessage(status, details = '') {
  if (status === 401) return 'Token GitHub tidak valid atau sudah kedaluwarsa. Perbarui GITHUB_TOKEN di Environment Variables Vercel.';
  if (status === 403) return 'GitHub menolak penulisan. Periksa token: Repository access harus mencakup repository ini dan Repository permissions → Contents harus Read and write.';
  if (status === 404) return 'Repository atau file tidak ditemukan. Pastikan GITHUB_OWNER, GITHUB_REPO, dan GITHUB_BRANCH sesuai dengan repository di GitHub.';
  if (status === 409 || status === 422) return 'GitHub menolak perubahan file (konflik atau validasi). Muat ulang halaman admin lalu coba simpan sekali lagi.';
  return `GitHub gagal memproses perubahan (HTTP ${status}). ${String(details || '').slice(0, 180)}`.trim();
}

async function readRepoFile(path) {
  const { branch } = githubConfig();
  try {
    const item = await githubFetch(path, {}, { ref: branch });
    if (item.type !== 'file' || !item.content) return null;
    const text = Buffer.from(String(item.content).replace(/\s/g, ''), 'base64').toString('utf8');
    return { text, sha: item.sha, size: item.size };
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function writeRepoFile(path, contentBuffer, message, contentType = 'application/octet-stream') {
  const { branch, owner, repo } = githubConfig();
  const buffer = Buffer.isBuffer(contentBuffer) ? contentBuffer : Buffer.from(contentBuffer);
  // Keep portfolio metadata small. Image upload uses a separate stricter limit.
  if (path === PORTFOLIO_PATH && buffer.length > MAX_PORTFOLIO_BYTES) {
    const err = new Error('Data portofolio terlalu besar. Gunakan link gambar publik untuk menghemat ukuran data.');
    err.status = 413;
    throw err;
  }
  const existing = await readRepoFile(path);
  const body = {
    message,
    content: buffer.toString('base64'),
    branch
  };
  if (existing?.sha) body.sha = existing.sha;
  const result = await githubFetch(path, { method: 'PUT', body });
  const rawPath = path.split('/').map(encodeURIComponent).join('/');
  const publicUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${rawPath}`;
  return { sha: result.content?.sha || '', url: publicUrl, contentType };
}

export async function loadPortfolio() {
  // First read from GitHub with the server-side token so the admin sees the latest value.
  if (githubTokenConfigured()) {
    try {
      const file = await readRepoFile(PORTFOLIO_PATH);
      if (file?.text) {
        const data = JSON.parse(file.text);
        if (validatePortfolio(data)) return data;
      }
    } catch (error) {
      // Keep the public page accessible if token configuration temporarily fails.
      console.error('Portfolio GitHub read failed:', error.message);
    }
  }
  // Public read fallback: repository and portfolio.json are public. Cache-busting avoids stale previews.
  try {
    const { owner, repo, branch } = githubConfig();
    const rawUrl = `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/portfolio.json?v=${Date.now()}`;
    const response = await fetch(rawUrl, { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (validatePortfolio(data)) return data;
    }
  } catch (error) {
    console.error('Portfolio public read fallback failed:', error.message);
  }
  return structuredClone(defaultPortfolio);
}

export async function savePortfolio(data) {
  const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf8');
  await writeRepoFile(PORTFOLIO_PATH, buffer, 'Perbarui data portofolio dari dashboard admin', 'application/json');
}

export function validatePortfolio(data) {
  const arrays = ['activities', 'experience', 'education', 'organizations', 'gallery'];
  if (!data || typeof data !== 'object' || !data.profile || typeof data.profile !== 'object') return false;
  if (!arrays.every(key => Array.isArray(data[key]))) return false;
  const jsonLength = Buffer.byteLength(JSON.stringify(data), 'utf8');
  return jsonLength <= MAX_PORTFOLIO_BYTES;
}

export function publicImageUrl(path) {
  const { owner, repo, branch } = githubConfig();
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${encodedPath}`;
}
