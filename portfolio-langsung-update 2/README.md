# Portofolio Kegiatan — Simpan langsung dari panel admin

Paket ini membuat halaman publik tetap satu halaman utama (`index.html`). Di bagian footer ada tautan kecil **kelola portofolio** yang membuka panel admin pada halaman yang sama. Setelah login, perubahan disimpan langsung ke Vercel Blob; tidak perlu mengunggah ulang file setiap kali mengedit konten.

## Upload satu kali

1. Ekstrak ZIP.
2. Unggah **seluruh isi paket** ke root repository GitHub yang terhubung ke project Vercel. Pilih `index.html`, `admin.html`, `app.js`, `style.css`, `portfolio.json`, `package.json`, `vercel.json`, serta folder `api/`. Jangan mengunggah folder pembungkusnya.
3. Commit perubahan dan tunggu deployment Vercel selesai.
4. Di Vercel → **Settings → Environment Variables**, tambahkan:
   - `ADMIN_PASSWORD` = `Fatih123`
   - `SESSION_SECRET` = string acak rahasia minimal 32 karakter.
5. Di Vercel project → **Storage → Create Database → Blob**, buat Blob Store dengan akses **Public** dan hubungkan ke project. Vercel membuat `BLOB_READ_WRITE_TOKEN` otomatis saat store dibuat dari project. Lihat dokumentasi resmi Vercel Blob.
6. Setelah environment variable dan Blob terpasang, lakukan **Redeploy**.

## Cara mengelola setelah selesai

Buka halaman utama website, gulir sampai bagian paling bawah, klik **kelola portofolio**, lalu masukkan password `Fatih123`. Edit profil, kegiatan, pengalaman, pendidikan, organisasi/posisi, atau galeri. Klik tombol simpan pada formulir. Data dan foto disimpan di server dan halaman publik memuat data terbaru tanpa harus mengunggah file lewat GitHub setiap kali.

## File yang disertakan

- `index.html` — halaman publik; tautan admin kecil di footer.
- `admin.html` — antarmuka dashboard yang dibuka dari panel di halaman utama (juga tersedia langsung di `/admin.html`).
- `app.js`, `style.css` — fungsi tampilan publik.
- `api/` — fungsi server untuk login, sesi, baca/simpan data, unggah foto, dan health check. Folder `api/` harus ada di root repo karena Vercel menjalankan file di sana sebagai Functions.
- `portfolio.json` — data contoh awal.

## Tes konfigurasi

Sesudah deployment, buka `/api/health`. Nilai `adminPasswordConfigured`, `sessionSecretConfigured`, dan `blobStorageConfigured` harus semuanya `true`. Jika belum, periksa pengaturan Vercel lalu redeploy.

**Catatan keamanan:** `Fatih123` digunakan sesuai permintaan untuk tahap awal, tetapi mudah ditebak. Ganti dengan password kuat sebelum membagikan website ke publik. Jangan mengunggah `.env` atau token rahasia ke GitHub. Data portofolio serta foto adalah data publik karena memang ditampilkan di website.
