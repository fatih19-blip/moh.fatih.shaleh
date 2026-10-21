import { loadPortfolio, readJson, requireAdmin, savePortfolio, sendJson, validatePortfolio } from '../server-lib.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await loadPortfolio();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return sendJson(res, 200, data);
    } catch (error) {
      console.error('Load portfolio error:', error.message);
      return sendJson(res, 500, { error: 'Data portofolio gagal dimuat. Periksa file portfolio.json di repository.' });
    }
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!requireAdmin(req, res)) return;
  try {
    const data = await readJson(req);
    if (!validatePortfolio(data)) return sendJson(res, 400, { error: 'Struktur data portofolio tidak sesuai atau datanya terlalu besar. Gunakan link foto publik bila memungkinkan.' });
    await savePortfolio(data);
    return sendJson(res, 200, { ok: true, message: 'Perubahan tersimpan di GitHub. Website publik akan membaca data terbaru.' });
  } catch (error) {
    console.error('Save portfolio error:', error.message);
    return sendJson(res, error.status || 500, { error: error.message || 'Perubahan tidak dapat disimpan.' });
  }
}
