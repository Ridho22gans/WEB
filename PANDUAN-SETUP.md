# Panduan Setup Website MPK (Supabase + Admin Panel + Cloudflare)

## 1. Buat Project Supabase
1. Buka https://supabase.com → buat project baru (region Singapore paling dekat).
2. Simpan **Project URL** dan **anon public key** di Settings → API.

## 2. Jalankan Skema Database
1. Buka **SQL Editor** di dashboard Supabase.
2. Copy seluruh isi file `supabase-schema.sql` dari folder ini.
3. Paste lalu klik **Run**.
   - Ini otomatis membuat tabel: `berita`, `agenda`, `pengurus`, `aspirasi`, `diskusi`, `diskusi_balasan`, `unduhan`.
   - Mengaktifkan Row Level Security (publik hanya boleh baca, tulis/hapus khusus admin login).
   - Membuat 3 storage bucket publik: `pengurus`, `berita`, `unduhan`.
   - Mengisi data awal 16 pengurus (memakai foto lokal `assets/image/...` yang sudah ada).

## 3. Buat Akun Admin (Login Panel)
1. Di dashboard Supabase → **Authentication** → **Users** → **Add user**.
2. Isi email & password untuk tiap pengurus yang perlu akses admin.
3. **Jangan** aktifkan pendaftaran publik (Sign Up) — akun admin hanya dibuat manual di sini.
4. Login admin panel nanti pakai email + password ini.

## 4. Hubungkan Website ke Supabase
1. Buka `js/supabase-config.js`.
2. Ganti:
   ```js
   const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   dengan nilai asli dari Settings → API.
3. Simpan. Semua halaman otomatis akan membaca/menulis dari Supabase setelah ini.

> Sebelum langkah ini diisi, website tetap berjalan normal memakai data contoh
> (fallback) supaya tidak error saat development.

## 5. Coba Panel Admin
1. Buka `admin.html` di browser (setelah deploy atau lewat local server).
2. Login pakai akun yang dibuat di langkah 3.
3. Tab yang tersedia: **Berita, Agenda, Pengurus, Aspirasi, Diskusi, Unduhan**.
   - Berita & Pengurus: bisa upload/ganti foto langsung (otomatis ke Supabase Storage).
   - Unduhan: upload file dokumen apa saja (PDF, DOCX, dll).
   - Aspirasi: kelola status (Baru/Diproses/Selesai), tidak bisa ditambah dari admin (memang diisi siswa lewat form Saran).
   - Diskusi: moderasi (hapus topik/balasan yang tidak pantas).

## 6. Deploy ke Cloudflare Pages
1. Push folder project ini ke repo GitHub/GitLab.
2. Di Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pilih repo, build settings:
   - Framework preset: **None**
   - Build command: (kosongkan — ini situs statis)
   - Build output directory: `/` (root, karena semua .html ada di root folder ini)
4. Deploy. Setelah selesai, tambahkan domain Cloudflare Pages Anda (mis. `mpk-smkn1bantul.pages.dev`) ke:
   - Supabase → Authentication → URL Configuration → **Site URL** & **Redirect URLs**.

## 7. Keamanan Penting
- `anon key` aman ditaruh di kode frontend — bukan rahasia. Yang menjaga keamanan adalah
  Row Level Security + status login, bukan key ini.
- Jangan pernah menaruh **service_role key** di kode frontend/publik.
- Batasi pembuatan akun admin hanya lewat Supabase Dashboard (langkah 3), jangan aktifkan sign-up publik.

## Catatan
- File dokumentasi lama (`README.md`, `SUPABASE-SETUP.md`, dll.) berisi bug format
  (baris barunya tertulis sebagai teks `\n`, bukan newline asli) — bisa diabaikan/dihapus,
  panduan ini menggantikannya untuk bagian Supabase & Admin.
