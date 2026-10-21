import { isAuthenticated, loadPortfolio, readJson, requireAdmin, savePortfolio, sendJson, validatePortfolio, storageConfigured } from './_lib.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await loadPortfolio();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return sendJson(res, 200, data);
    } catch (error) {
      console.error('Read portfolio error:', error);
      return sendJson(res, 500, { error: 'Data portofolio gagal dimuat. Periksa konfigurasi Blob Store Vercel.' });
    }
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!requireAdmin(req, res)) return;
  try {
    const data = await readJson(req);
    if (!validatePortfolio(data)) return sendJson(res, 400, { error: 'Struktur data portofolio tidak sesuai.' });
    if (!storageConfigured()) return sendJson(res, 503, { error: 'Penyimpanan belum disiapkan. Di Vercel, buka Storage → Create Database → Blob, lalu hubungkan Blob Store ke project ini.' });
    await savePortfolio(data);
    return sendJson(res, 200, { ok: true, message: 'Perubahan berhasil disimpan.' });
  } catch (error) {
    console.error('Save portfolio error:', error);
    return sendJson(res, 500, { error: error.message || 'Perubahan tidak dapat disimpan.' });
  }
}
