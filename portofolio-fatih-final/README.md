# Portofolio pribadi — versi final sederhana

Website ini memakai halaman publik dengan tautan admin kecil di footer. Di halaman admin, kamu cukup memasukkan **password**. Tidak ada kolom token GitHub pada website.

## Cara kerja

- Profil, kegiatan, pengalaman, pendidikan, organisasi/posisi, dan galeri disimpan di `portfolio.json` pada repository GitHub.
- Foto yang diunggah disimpan sebagai file di folder `media/` pada repository GitHub.
- URL foto menggunakan `https://raw.githubusercontent.com/...`; repository perlu tetap **Public** agar gambar dapat dilihat pengunjung.
- Admin login memakai password server `ADMIN_PASSWORD`. Token GitHub hanya disimpan rahasia di Environment Variables Vercel, tidak dimasukkan ke kode frontend dan tidak ditampilkan kepada pengunjung.
- Di admin, kamu juga bisa menempelkan URL gambar publik secara langsung untuk menghemat ukuran dan jumlah file di repository.

## Upload pertama kali

1. Ekstrak ZIP ini di komputer.
2. Buka repository `fatih19-blip/moh.fatih.shaleh` di GitHub.
3. Pilih **Add file → Upload files**.
4. Unggah seluruh isi folder hasil ekstrak ke **root repository** (tingkat yang sama dengan `index.html` lama). Jika ditanya, ganti file lama dengan file baru. Pastikan folder `api/` ikut terunggah. Jangan mengunggah file `.env`.
5. Klik **Commit changes** dan tunggu Vercel selesai deployment.

## Pengaturan server satu kali di Vercel

Halaman admin hanya meminta password, tetapi server tetap perlu izin untuk menyimpan file ke GitHub. Atur tiga Environment Variables berikut:

- `ADMIN_PASSWORD` = `Fatih123`
- `SESSION_SECRET` = string acak rahasia minimal 32 karakter (jangan pakai contoh dari dokumen ini)
- `GITHUB_TOKEN` = fine-grained personal access token untuk repository ini

Caranya:

1. Buka [GitHub Fine-grained Personal Access Tokens](https://github.com/settings/personal-access-tokens/new) lalu buat token baru.
2. **Resource owner**: `fatih19-blip`.
3. **Repository access**: pilih **Only select repositories**, lalu pilih `moh.fatih.shaleh`.
4. Di **Repository permissions**, tambahkan **Contents → Read and write**.
5. Generate token dan salin satu kali saja. Jangan mengirim token lewat chat atau menyimpannya dalam file website.
6. Buka Vercel → project portofolio → **Settings → Environment Variables**. Tambahkan `ADMIN_PASSWORD`, `SESSION_SECRET`, dan `GITHUB_TOKEN` untuk Production. Jangan membuat file `.env` publik.
7. Setelah menyimpan environment variables, lakukan **Redeploy** agar konfigurasi diterapkan.

Owner/repository/branch default mengikuti `fatih19-blip/moh.fatih.shaleh`, branch `main`. Jika repository berbeda, ubah nilai `GITHUB_OWNER`, `GITHUB_REPO`, dan `GITHUB_BRANCH` pada Environment Variables Vercel.

## Cara memakai setelah pengaturan awal

1. Buka website utama dan gulir sampai footer.
2. Klik tulisan kecil **kelola portofolio**.
3. Login dengan password yang sudah diatur pada `ADMIN_PASSWORD` (default awal yang diminta: `Fatih123`).
4. Edit profil, tambah kegiatan/pengalaman/pendidikan/organisasi/galeri, unggah foto maksimal **2 MB**, lalu klik tombol simpan di formulir.
5. Perubahan konten disimpan ke `portfolio.json`. Foto diunggah ke `media/` dan mendapat URL publik. Tidak perlu memasukkan token di halaman admin dan tidak perlu mengunggah file secara manual setelah pengaturan awal.

## Pemeriksaan konfigurasi

Buka `https://moh-fatih-shaleh.vercel.app/api/health`. Idealnya `adminPasswordConfigured`, `sessionSecretConfigured`, dan `githubTokenConfigured` bernilai `true`.

Jika penyimpanan gagal, dashboard akan menampilkan error yang lebih spesifik. Untuk error izin GitHub, pastikan token mencakup repository yang benar dan `Contents: Read and write`.

## Hemat penyimpanan

- Gunakan gambar JPG/WEBP yang sudah dikompres dan maksimal 2 MB untuk upload.
- Atau tempel URL gambar langsung pada kolom foto. Gunakan **direct image URL** berawalan `https://` (bukan sekadar halaman posting/album). Coba buka link dalam tab baru; jika gambar tampil langsung tanpa login, link tersebut dapat ditampilkan secara publik.
- Karena foto dan data disimpan dalam repository Public, file yang diunggah memang publik. Jangan unggah dokumen pribadi atau foto yang tidak ingin dilihat umum.
- Foto yang sudah diunggah tidak otomatis terhapus ketika item galeri dihapus; jika mau menghapus file foto lama, hapus file tersebut dari folder `media/` di GitHub.

## Keamanan

`Fatih123` dipakai sesuai permintaan untuk awal. Ganti ke password yang lebih kuat sebelum banyak orang mengetahui alamat admin. Jangan commit `GITHUB_TOKEN` atau file `.env` ke GitHub. Token perlu dibatasi hanya ke repository ini.
