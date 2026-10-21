# Portofolio Kegiatan — Paket Upload GitHub (File Datar)

Paket ini sudah disusun supaya file penting berada langsung di satu folder, tanpa folder `public/` dan `data/` bersarang. Cocok untuk diunggah ke root repository GitHub.

## Isi folder

- `index.html` — halaman portofolio publik
- `style.css` — desain dan warna
- `app.js` — menampilkan data portofolio
- `admin.html` — halaman admin di `/admin`
- `server.js` — backend Node.js
- `portfolio.json` — data awal profil, kegiatan, pendidikan, pengalaman, organisasi, dan galeri
- `package.json` — daftar paket Node.js
- `.env.example` — contoh pengaturan rahasia
- `.gitignore` — mencegah file rahasia dan `node_modules` ikut diunggah

Folder `uploads/` akan dibuat otomatis ketika server dijalankan.

## Cara upload ke GitHub lewat browser

1. Ekstrak ZIP ini.
2. Buat repository baru di GitHub, misalnya `portfolio-kegiatan`.
3. Masuk ke repository → **Add file** → **Upload files**.
4. Seret semua isi folder hasil ekstrak ke area upload. Unggah berkas-berkasnya langsung, jangan mengunggah ZIP sebagai pengganti berkas.
5. Pastikan `.env` tidak ikut diunggah. File `.env.example` hanya template dan tidak memuat password aktif.
6. Klik **Commit changes**.

> GitHub menyimpan kode, tetapi tidak menjalankan backend Node.js hanya dengan mengunggahnya. Login admin, unggah foto, dan penyimpanan perubahan memerlukan server Node.js.

## Menjalankan di komputer atau Orange Pi

Memerlukan Node.js versi 18 atau lebih baru.

1. Salin `.env.example` menjadi `.env`.
2. Di `.env`, ubah `ADMIN_PASSWORD=isi-password-di-sini` menjadi `ADMIN_PASSWORD=Fatih123` sesuai permintaan. Sebelum dipublikasikan ke internet, gunakan password yang lebih kuat.
3. Ubah `SESSION_SECRET` menjadi rahasia acak yang panjang. Jangan bagikan atau mengunggah `.env` ke GitHub.
4. Buka terminal di folder ini, lalu jalankan:

   ```bash
   npm install
   npm start
   ```

5. Buka `http://localhost:3000` untuk portofolio dan `http://localhost:3000/admin` untuk admin.

## Catatan penting

- Data konten ditulis ke `portfolio.json`, jadi server harus memiliki izin tulis ke folder proyek.
- Foto yang diunggah disimpan di folder `uploads/`.
- Pada beberapa hosting gratis/serverless, penulisan file lokal tidak permanen. Untuk produksi, gunakan server dengan disk persisten atau database/storage persisten.
- Jangan pernah unggah file `.env`, yang berisi password nyata atau rahasia sesi.
