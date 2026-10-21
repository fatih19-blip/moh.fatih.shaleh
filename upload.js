import crypto from 'node:crypto';
import multer from 'multer';
import { put } from '@vercel/blob';
import { requireAdmin, sendJson, storageConfigured } from './_lib.js';

const mimeExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const valid = Object.prototype.hasOwnProperty.call(mimeExtensions, file.mimetype);
    callback(valid ? null : new Error('Format gambar harus JPG, PNG, WEBP, atau GIF.'), valid);
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!requireAdmin(req, res)) return;
  if (!storageConfigured()) return sendJson(res, 503, { error: 'Penyimpanan foto belum disiapkan. Buat Blob Store di Vercel dan hubungkan ke project ini.' });

  uploader.single('image')(req, res, async error => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE' ? 'Ukuran gambar maksimal 3 MB untuk upload dari Vercel.' : (error.message || 'Gagal membaca file gambar.');
      return sendJson(res, 400, { error: message });
    }
    if (!req.file) return sendJson(res, 400, { error: 'Pilih file gambar terlebih dahulu.' });
    try {
      const extension = mimeExtensions[req.file.mimetype];
      const pathname = `portfolio-uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
      const blob = await put(pathname, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype,
        addRandomSuffix: false,
        cacheControlMaxAge: 31536000
      });
      return sendJson(res, 200, { ok: true, url: `${blob.url}?v=${Date.now()}` });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return sendJson(res, 500, { error: 'Foto gagal disimpan. Periksa koneksi dan konfigurasi Blob Store.' });
    }
  });
}
