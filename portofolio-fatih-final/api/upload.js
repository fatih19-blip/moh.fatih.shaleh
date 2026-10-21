import crypto from 'node:crypto';
import { isAuthenticated, readJson, sendJson, writeRepoFile, publicImageUrl } from '../server-lib.js';

const allowed = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak diizinkan.' });
  if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Sesi admin sudah berakhir. Silakan login kembali.' });
  try {
    const body = await readJson(req);
    const contentType = String(body.contentType || '').toLowerCase();
    const extension = allowed[contentType];
    const base64 = String(body.base64 || '').replace(/^data:[^,]*,/, '');
    if (!extension || !base64) return sendJson(res, 400, { error: 'Pilih gambar JPG, PNG, WEBP, atau GIF.' });
    if (base64.length > 2_900_000) return sendJson(res, 413, { error: 'Ukuran foto maksimal 2 MB. Kecilkan foto atau tempel link gambar publik.' });
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return sendJson(res, 413, { error: 'Ukuran foto maksimal 2 MB. Kecilkan foto atau tempel link gambar publik.' });
    // Check the actual file signature rather than trusting only the uploaded MIME type.
    const signatures = {
      'image/jpeg': buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8,
      'image/png': buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
      'image/gif': buffer.length > 5 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii')),
      'image/webp': buffer.length > 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    };
    if (!signatures[contentType]) return sendJson(res, 400, { error: 'Isi file tidak sesuai dengan format gambar yang dipilih.' });
    const filename = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${extension}`;
    const path = `media/${filename}`;
    await writeRepoFile(path, buffer, `Unggah foto portofolio ${filename}`, contentType);
    const url = `${publicImageUrl(path)}?v=${Date.now()}`;
    return sendJson(res, 200, { ok: true, url, path, message: 'Foto berhasil disimpan sebagai link publik GitHub. Masukkan/cek URL foto tersebut lalu simpan item portofolio.' });
  } catch (error) {
    console.error('Upload GitHub image error:', error.message);
    return sendJson(res, error.status || 500, { error: error.message || 'Foto gagal diunggah ke GitHub.' });
  }
}
