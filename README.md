# Portofolio Kegiatan — versi Vercel dengan Admin

Paket ini disiapkan khusus untuk situs statis + Vercel Functions. Berbeda dari paket sebelumnya yang memakai `server.js`/Express, versi ini menyediakan endpoint API di folder `api/`, sehingga tombol login admin tidak lagi memanggil endpoint yang tidak tersedia.

## Berkas utama

- `index.html`, `style.css`, `app.js` — website portofolio publik.
- `admin.html` — dashboard admin.
- `api/login.js` — pemeriksaan password dan pembuatan cookie sesi.
- `api/admin/status.js` — pemeriksaan status login.
- `api/logout.js` — keluar dari dashboard.
- `api/portfolio.js` — membaca/menyimpan data portofolio.
- `api/upload.js` — mengunggah foto ke Vercel Blob.
- `api/health.js` — memeriksa apakah pengaturan Vercel sudah lengkap.
- `api/_lib.js` — fungsi bantuan bersama; tanda garis bawah sengaja digunakan agar tidak dijadikan endpoint tersendiri.
- `portfolio.json` — data contoh awal.

## 1. Unggah ke GitHub

1. Ekstrak ZIP ini.
2. Masuk ke repository GitHub yang terhubung ke project Vercel.
3. Unggah/replace file di root repository dengan file dari paket ini.
4. Pastikan folder `api/` dan subfolder `api/admin/` ikut terunggah. Folder `api/` memang diperlukan Vercel untuk menjalankan backend; jangan pindahkan file API ke root.
5. Commit perubahan dan tunggu deployment Vercel selesai.

Jika sebelumnya ada `server.js` dari paket lama, Vercel tidak menggunakannya pada versi ini. File itu boleh dihapus dari repository agar tidak membingungkan.

## 2. Atur password di Vercel

Di Dashboard Vercel:

1. Buka project portofolio.
2. Pilih **Settings → Environment Variables**.
3. Tambahkan `ADMIN_PASSWORD` dengan nilai `Fatih123`.
4. Tambahkan `SESSION_SECRET` dengan teks acak rahasia yang panjang, minimal 32 karakter. Contoh format: `Sesi-Portfolio-2026-ganti-dengan-random-yang-panjang-8xK2mQ9p` — sebaiknya buat nilai unik sendiri.
5. Simpan, lalu lakukan **Redeploy**. Perubahan environment variables tidak berlaku ke deployment yang sudah terbit sebelum dilakukan redeploy.

Jangan mengunggah file `.env` atau menaruh rahasia sesi di HTML/JavaScript.

## 3. Aktifkan penyimpanan foto dan perubahan data

Login tidak memerlukan Blob Store, tetapi menyimpan perubahan portofolio dan mengunggah foto memerlukannya.

1. Di Dashboard Vercel, buka **Storage**.
2. Pilih untuk membuat **Blob Store** dengan akses **Public** (gambar dan data portofolio memang akan ditampilkan ke pengunjung).
3. Hubungkan/Connect Blob Store tersebut ke project portofolio dan aktifkan untuk Production.
4. Pastikan environment variable koneksi Blob dari Vercel telah tersedia, lalu redeploy jika diminta.

Vercel Blob akan menyimpan `portfolio-data.json` dan file gambar yang diunggah. Jika belum ada data tersimpan di Blob, website akan memakai isi `portfolio.json` sebagai data awal. Jangan menaruh data rahasia di data portofolio karena isi portofolio memang untuk publik.

## 4. Tes setelah deployment

- Website: `/`
- Admin: `/admin.html` atau `/admin`
- Tes konfigurasi: `/api/health`

Buka `/api/health`. Pastikan nilai `adminPasswordConfigured` dan `sessionSecretConfigured` bernilai `true`. Untuk menyimpan konten serta unggah foto, `blobStorageConfigured` juga harus `true`.

Jika `adminPasswordConfigured` bernilai `false`, tambahkan Environment Variable `ADMIN_PASSWORD`. Jika `sessionSecretConfigured` bernilai `false`, atur `SESSION_SECRET` minimal 32 karakter. Setelah mengubah environment variables, lakukan redeploy.

## Catatan keamanan dan batas upload

- Password bawaan sesuai permintaan adalah `Fatih123`, disimpan di Environment Variables Vercel, bukan di kode browser.
- Password ini relatif mudah ditebak. Ganti dengan password yang lebih kuat setelah pengujian awal.
- Login menggunakan cookie sesi HttpOnly dengan masa berlaku 8 jam.
- Upload server-side dibatasi 3 MB karena batas payload request Vercel. Gambar tersimpan sebagai file publik di Blob.
- Paket ini belum memiliki pembatasan percobaan login berbasis database; hindari menggunakan password yang lemah untuk website publik.
