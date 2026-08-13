-- =====================================================================
-- SKEMA DATABASE WEBSITE MPK SMKN 1 BANTUL
-- Jalankan seluruh file ini sekali di: Supabase Dashboard > SQL Editor
-- Aman dijalankan ulang (pakai IF NOT EXISTS / DROP POLICY IF EXISTS)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL BERITA
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS berita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Informasi',
  date DATE DEFAULT CURRENT_DATE,
  image TEXT,               -- URL publik dari Supabase Storage
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 2. TABEL AGENDA
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3. TABEL PENGURUS (Profil anggota MPK)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pengurus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  jabatan TEXT NOT NULL DEFAULT 'Anggota MPK',
  deskripsi TEXT,
  foto_url TEXT,             -- URL publik dari Supabase Storage
  urutan INTEGER DEFAULT 0,  -- untuk mengatur urutan tampil
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. TABEL ASPIRASI / SARAN
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS aspirasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL DEFAULT 'Anonim',
  kelas TEXT NOT NULL,
  kategori TEXT NOT NULL DEFAULT 'Saran',
  isi TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Baru', -- Baru | Diproses | Selesai
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 5. TABEL DISKUSI (topik forum)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diskusi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL DEFAULT 'Anonim',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 6. TABEL BALASAN DISKUSI
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diskusi_balasan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diskusi_id UUID NOT NULL REFERENCES diskusi(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT 'Anonim',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 7. TABEL UNDUHAN (dokumen)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unduhan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,    -- URL publik dari Supabase Storage
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Aturan: SIAPA SAJA boleh membaca (SELECT).
--         HANYA user yang sudah login (admin) boleh tambah/ubah/hapus.
-- Pengecualian: tabel "aspirasi" dan "diskusi"/"diskusi_balasan" boleh
--         di-INSERT oleh publik (karena diisi oleh siswa lewat form),
--         tapi UPDATE/DELETE tetap khusus admin.
-- =====================================================================

ALTER TABLE berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE diskusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE diskusi_balasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE unduhan ENABLE ROW LEVEL SECURITY;

-- BERITA
DROP POLICY IF EXISTS "berita_public_read" ON berita;
CREATE POLICY "berita_public_read" ON berita FOR SELECT USING (true);
DROP POLICY IF EXISTS "berita_admin_write" ON berita;
CREATE POLICY "berita_admin_write" ON berita FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- AGENDA
DROP POLICY IF EXISTS "agenda_public_read" ON agenda;
CREATE POLICY "agenda_public_read" ON agenda FOR SELECT USING (true);
DROP POLICY IF EXISTS "agenda_admin_write" ON agenda;
CREATE POLICY "agenda_admin_write" ON agenda FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- PENGURUS
DROP POLICY IF EXISTS "pengurus_public_read" ON pengurus;
CREATE POLICY "pengurus_public_read" ON pengurus FOR SELECT USING (true);
DROP POLICY IF EXISTS "pengurus_admin_write" ON pengurus;
CREATE POLICY "pengurus_admin_write" ON pengurus FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ASPIRASI (publik boleh insert/kirim, admin boleh baca+kelola)
DROP POLICY IF EXISTS "aspirasi_public_insert" ON aspirasi;
CREATE POLICY "aspirasi_public_insert" ON aspirasi FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "aspirasi_admin_read" ON aspirasi;
CREATE POLICY "aspirasi_admin_read" ON aspirasi FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "aspirasi_admin_update" ON aspirasi;
CREATE POLICY "aspirasi_admin_update" ON aspirasi FOR UPDATE
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "aspirasi_admin_delete" ON aspirasi;
CREATE POLICY "aspirasi_admin_delete" ON aspirasi FOR DELETE USING (auth.role() = 'authenticated');

-- DISKUSI (publik boleh baca & buat topik, admin boleh hapus/moderasi)
DROP POLICY IF EXISTS "diskusi_public_read" ON diskusi;
CREATE POLICY "diskusi_public_read" ON diskusi FOR SELECT USING (true);
DROP POLICY IF EXISTS "diskusi_public_insert" ON diskusi;
CREATE POLICY "diskusi_public_insert" ON diskusi FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "diskusi_admin_delete" ON diskusi;
CREATE POLICY "diskusi_admin_delete" ON diskusi FOR DELETE USING (auth.role() = 'authenticated');

-- DISKUSI BALASAN
DROP POLICY IF EXISTS "balasan_public_read" ON diskusi_balasan;
CREATE POLICY "balasan_public_read" ON diskusi_balasan FOR SELECT USING (true);
DROP POLICY IF EXISTS "balasan_public_insert" ON diskusi_balasan;
CREATE POLICY "balasan_public_insert" ON diskusi_balasan FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "balasan_admin_delete" ON diskusi_balasan;
CREATE POLICY "balasan_admin_delete" ON diskusi_balasan FOR DELETE USING (auth.role() = 'authenticated');

-- UNDUHAN
DROP POLICY IF EXISTS "unduhan_public_read" ON unduhan;
CREATE POLICY "unduhan_public_read" ON unduhan FOR SELECT USING (true);
DROP POLICY IF EXISTS "unduhan_admin_write" ON unduhan;
CREATE POLICY "unduhan_admin_write" ON unduhan FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- =====================================================================
-- STORAGE BUCKETS (untuk foto pengurus, gambar berita, file unduhan)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pengurus', 'pengurus', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('berita', 'berita', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('unduhan', 'unduhan', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: publik boleh lihat (download), hanya admin boleh upload/hapus
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
CREATE POLICY "storage_public_read" ON storage.objects FOR SELECT
  USING (bucket_id IN ('pengurus', 'berita', 'unduhan'));

DROP POLICY IF EXISTS "storage_admin_write" ON storage.objects;
CREATE POLICY "storage_admin_write" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id IN ('pengurus', 'berita', 'unduhan') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "storage_admin_update" ON storage.objects;
CREATE POLICY "storage_admin_update" ON storage.objects FOR UPDATE
  USING (bucket_id IN ('pengurus', 'berita', 'unduhan') AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "storage_admin_delete" ON storage.objects;
CREATE POLICY "storage_admin_delete" ON storage.objects FOR DELETE
  USING (bucket_id IN ('pengurus', 'berita', 'unduhan') AND auth.role() = 'authenticated');

-- =====================================================================
-- DATA AWAL (opsional) - foto pengurus tetap dari file lokal assets/image/
-- kalau mau tetap pakai foto default yang sudah ada di repo, cukup isi
-- foto_url dengan path relatif 'assets/image/nama.png' (bukan Storage URL).
-- =====================================================================
INSERT INTO pengurus (nama, jabatan, foto_url, urutan) VALUES
  ('Avissa', 'Anggota MPK', 'assets/image/avissa.png', 1),
  ('Bintang', 'Anggota MPK', 'assets/image/bintang.png', 2),
  ('Christian', 'Anggota MPK', 'assets/image/christian.png', 3),
  ('Diva', 'Anggota MPK', 'assets/image/diva.png', 4),
  ('Ferry', 'Anggota MPK', 'assets/image/ferry.png', 5),
  ('Habsah', 'Anggota MPK', 'assets/image/habsah.png', 6),
  ('Haifa', 'Anggota MPK', 'assets/image/haifa.png', 7),
  ('Hasan', 'Anggota MPK', 'assets/image/hasan.png', 8),
  ('Izza', 'Anggota MPK', 'assets/image/izza.png', 9),
  ('Nadine', 'Anggota MPK', 'assets/image/nadine.png', 10),
  ('Naura', 'Anggota MPK', 'assets/image/naura.png', 11),
  ('Rahma', 'Anggota MPK', 'assets/image/rahma.png', 12),
  ('Rahmat', 'Anggota MPK', 'assets/image/rahmat.png', 13),
  ('Rehan', 'Anggota MPK', 'assets/image/rehan.png', 14),
  ('Sigit', 'Anggota MPK', 'assets/image/sigit.png', 15),
  ('Vera', 'Anggota MPK', 'assets/image/vera.png', 16)
ON CONFLICT DO NOTHING;
