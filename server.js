require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'portfolio.json');
const UPLOADS_DIR = path.join(ROOT, 'uploads');

if (!process.env.ADMIN_PASSWORD) {
  console.error('ADMIN_PASSWORD belum diatur. Salin .env.example menjadi .env terlebih dahulu.');
  process.exit(1);
}
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 24 || process.env.SESSION_SECRET.startsWith('ganti-dengan')) {
  console.warn('PERINGATAN: ganti SESSION_SECRET di .env dengan rahasia acak yang panjang sebelum website dipublikasikan.');
}
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) throw new Error('File portfolio.json tidak ditemukan.');

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '2mb' }));
app.use(session({
  name: 'portfolio.sid',
  secret: process.env.SESSION_SECRET || 'local-only-session-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const allowed = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
      const ext = allowed[file.mimetype];
      if (!ext) return cb(new Error('Format gambar harus JPG, PNG, WEBP, atau GIF.'));
      cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);
    cb(valid ? null : new Error('Format gambar harus JPG, PNG, WEBP, atau GIF.'), valid);
  }
});

function readPortfolio() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function writePortfolio(data) {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE);
}
function isAuthenticated(req) {
  return Boolean(req.session && req.session.isAdmin === true);
}
function requireAdmin(req, res, next) {
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'Silakan login sebagai admin terlebih dahulu.' });
  next();
}
function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

app.get('/api/portfolio', (_req, res) => {
  try { res.json(readPortfolio()); }
  catch (err) { console.error(err); res.status(500).json({ error: 'Data portofolio tidak dapat dibaca.' }); }
});

app.post('/api/login', (req, res) => {
  const password = req.body && req.body.password;
  if (typeof password !== 'string' || !safeEqual(password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Password belum tepat. Coba lagi.' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Sesi login gagal dibuat.' });
    req.session.isAdmin = true;
    req.session.save((saveErr) => {
      if (saveErr) return res.status(500).json({ error: 'Sesi login gagal disimpan.' });
      res.json({ ok: true });
    });
  });
});

app.get('/api/admin/status', (req, res) => res.json({ authenticated: isAuthenticated(req) }));
app.post('/api/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => {
    res.clearCookie('portfolio.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' });
    res.json({ ok: true });
  });
});

app.post('/api/portfolio', requireAdmin, (req, res) => {
  const data = req.body;
  const arrayFields = ['activities', 'experience', 'education', 'organizations', 'gallery'];
  if (!data || typeof data !== 'object' || !data.profile || typeof data.profile !== 'object' || arrayFields.some(k => !Array.isArray(data[k]))) {
    return res.status(400).json({ error: 'Struktur data tidak sesuai.' });
  }
  try {
    writePortfolio({ profile: data.profile, activities: data.activities, experience: data.experience, education: data.education, organizations: data.organizations, gallery: data.gallery });
    res.json({ ok: true, message: 'Perubahan berhasil disimpan.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Perubahan tidak dapat disimpan.' });
  }
});

app.post('/api/upload', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Gagal mengunggah gambar.' });
    if (!req.file) return res.status(400).json({ error: 'Pilih file gambar terlebih dahulu.' });
    res.json({ ok: true, url: `/uploads/${req.file.filename}` });
  });
});

app.get('/admin', (_req, res) => res.sendFile(path.join(ROOT, 'admin.html')));
app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));
app.get('/style.css', (_req, res) => res.sendFile(path.join(ROOT, 'style.css')));
app.get('/app.js', (_req, res) => res.sendFile(path.join(ROOT, 'app.js')));
app.use('/uploads', express.static(UPLOADS_DIR, { fallthrough: false, maxAge: '7d' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portofolio berjalan di http://localhost:${PORT}`);
  console.log(`Halaman admin: http://localhost:${PORT}/admin`);
});
