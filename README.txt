PORTOFOLIO STATIS - VERSI PALING SEDERHANA

FILE DI ROOT:
- index.html       halaman publik
- admin.html       dashboard admin
- portfolio.json   data awal portofolio
- README.txt       panduan ini

CARA UPLOAD:
1. Ekstrak ZIP ini. Pilih file di dalamnya, bukan folder pembungkus.
2. Unggah index.html, admin.html, dan portfolio.json ke ROOT repository GitHub yang terhubung ke Vercel. Timpa file yang lama jika diminta.
3. Commit changes dan tunggu deployment selesai.
4. Website: https://NAMA-PROJECT.vercel.app/
   Admin:   https://NAMA-PROJECT.vercel.app/admin.html
5. Password admin: Fatih123

CARA MENGUBAH KONTEN:
1. Login ke admin.html.
2. Tambahkan/edit/hapus isi bagian profil, kegiatan, pengalaman, pendidikan, organisasi/posisi, dan galeri.
3. Klik Ekspor portfolio.json. File ini terunduh ke komputer.
4. Kembali ke GitHub repository, klik Add file > Upload files.
5. Upload file portfolio.json hasil ekspor dan pilih Commit changes untuk mengganti file lama.
6. Tunggu Vercel selesai deploy. Semua pengunjung akan melihat data yang baru.

PENTING - BATASAN TANPA BACKEND:
- Website ini tidak menggunakan API folder, Node.js, atau database eksternal.
- Simpan di dashboard hanya menyimpan perubahan pada browser/perangkat admin tersebut. Agar publik ikut melihat, lakukan ekspor portfolio.json dan unggah ulang ke GitHub sesuai langkah di atas.
- Password berada dalam JavaScript halaman statis, sehingga TIDAK aman untuk melindungi data sensitif. Orang yang paham dapat membaca source code. Jangan gunakan untuk informasi rahasia.
- Galeri menggunakan URL gambar, bukan mengunggah file foto langsung. Gunakan URL gambar yang dapat diakses publik.
