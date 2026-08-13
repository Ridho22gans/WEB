# 🚀 DEPLOYMENT GUIDE - Cloudflare & Supabase

## Panduan Deploy Website MPK ke Cloudflare Pages & Gunakan Supabase Database

---

## 📋 Table of Contents

1. [Persiapan Awal](#persiapan-awal)
2. [Setup Supabase](#setup-supabase)
3. [Konfigurasi Database](#konfigurasi-database)
4. [Update Code untuk Supabase](#update-code-untuk-supabase)
5. [Deploy ke Cloudflare](#deploy-ke-cloudflare)
6. [Testing & Troubleshooting](#testing--troubleshooting)

---

## ✅ Persiapan Awal

### Yang Dibutuhkan:
- ✅ GitHub Account
- ✅ Cloudflare Account (gratis)
- ✅ Supabase Account (gratis)
- ✅ Git terinstall di komputer
- ✅ Text editor (VS Code)
- ✅ Terminal/Command Prompt

### Step 1: Upload ke GitHub

```bash
# 1. Buka Terminal/PowerShell di folder project
cd d:\MPK WEB

# 2. Inisialisasi Git
git init

# 3. Add semua file
git add .

# 4. Commit
git commit -m "Initial commit - MPK Website"

# 5. Create repository di GitHub.com
# - Login ke GitHub
# - Click "New Repository"
# - Nama: mpk-website
# - Jangan pilih "Initialize with README"
# - Copy URL repository

# 6. Add remote dan push
git remote add origin https://github.com/USERNAME/mpk-website.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Setup Supabase

### Step 1: Buat Akun Supabase

1. Buka https://supabase.com
2. Click "Start your project"
3. Sign up dengan GitHub atau email
4. Create new project:
   - **Project Name**: mpk-website
   - **Database Password**: simpan password ini!
   - **Region**: pilih Asia (Singapore)
   - Tunggu ~2 menit sampai project ready

### Step 2: Dapatkan API Keys

Setelah project selesai:

1. Buka project di Supabase dashboard
2. Klik "Settings" → "API"
3. Copy & simpan:
   - **Project URL** (Supabase URL)
   - **anon key** (Public key - untuk client-side)
   - **service_role key** (Private key - untuk server-side)

**⚠️ PENTING**: Jangan share `service_role key` ke public!

---

## 🗄️ Konfigurasi Database

### Step 1: Buat Tabel di Supabase

Buka Supabase Dashboard → SQL Editor → New Query

#### Buat Tabel Berita:
```sql
CREATE TABLE berita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  image TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE berita ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read" ON berita
FOR SELECT USING (true);
```

#### Buat Tabel Diskusi:
```sql
CREATE TABLE diskusi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE diskusi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON diskusi
FOR SELECT USING (true);

CREATE POLICY "public_insert" ON diskusi
FOR INSERT WITH CHECK (true);
```

#### Buat Tabel Aspirasi (Saran):
```sql
CREATE TABLE aspirasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  kategori TEXT NOT NULL,
  isi TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE aspirasi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON aspirasi
FOR SELECT USING (true);

CREATE POLICY "public_insert" ON aspirasi
FOR INSERT WITH CHECK (true);
```

### Step 2: Verifikasi Tabel

Di Supabase Dashboard → Table Editor, cek:
- ✅ Table "berita" sudah ada
- ✅ Table "diskusi" sudah ada
- ✅ Table "aspirasi" sudah ada

---

## 🔧 Update Code untuk Supabase

### Step 1: Buat File Konfigurasi Supabase

Buat file baru: `js/supabase-config.js`

```javascript
/* ==========================================
   SUPABASE CONFIGURATION
   ========================================== */

// Ganti dengan URL dan key dari Supabase Anda
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Inisialisasi Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export untuk digunakan di module lain
window.supabase = supabaseClient;

console.log('✓ Supabase config loaded');
```

### Step 2: Update HTML untuk Include Supabase Library

Edit semua HTML file, tambahkan sebelum `utils.js`:

```html
<!-- Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Supabase Configuration -->
<script src="js/supabase-config.js"></script>

<!-- Utility Functions -->
<script src="js/utils.js"></script>
```

Contoh untuk `index.html`:
```html
</head>
<body>
  <!-- Your content here -->
  
  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/supabase-config.js"></script>
  <script src="js/utils.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

### Step 3: Update berita.js untuk Supabase

Buat file baru: `js/berita-supabase.js`

```javascript
/* js/berita-supabase.js - Berita dengan Supabase */

const DEFAULT_BERITA = [
  {
    title: 'Pelaksanaan Pemilos SMK Negeri 1 Bantul 2026',
    category: 'Kegiatan',
    image: 'https://via.placeholder.com/600x400',
    content: 'Pemilihan Ketua OSIS dan Ketua MPK berlangsung secara tertib dan demokratis dengan e-voting.'
  },
  {
    title: 'Rapat Kerja & Sidang Pleno MPK',
    category: 'Organisasi',
    image: 'https://via.placeholder.com/600x400',
    content: 'Pembahasan Anggaran Dasar / Anggaran Rumah Tangga serta pengesahan program kerja setahun.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initBerita();
});

async function initBerita() {
  // Cek apakah ada data di Supabase
  const { data, error } = await window.supabase
    .from('berita')
    .select('*');

  if (error) {
    console.warn('Error loading from Supabase:', error);
    // Fallback ke localStorage
    loadBeritaFromStorage();
  } else if (!data || data.length === 0) {
    // Jika table kosong, insert default data
    await insertDefaultBerita();
  } else {
    renderBerita('Semua');
  }
}

async function insertDefaultBerita() {
  try {
    const { error } = await window.supabase
      .from('berita')
      .insert(DEFAULT_BERITA);

    if (error) throw error;
    
    console.log('✓ Default berita inserted');
    renderBerita('Semua');
  } catch (error) {
    console.error('Error inserting default data:', error);
    showToast('Error loading berita', 'danger');
  }
}

async function getBeritaData() {
  try {
    const { data, error } = await window.supabase
      .from('berita')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching berita:', error);
    // Fallback ke localStorage
    return JSON.parse(localStorage.getItem('mpk_berita') || '[]');
  }
}

async function renderBerita(categoryFilter = 'Semua') {
  const container = document.getElementById('berita-container');
  const template = document.getElementById('tpl-berita-card');
  
  if (!container || !template) {
    console.warn('Container or template not found');
    return;
  }

  container.replaceChildren();
  
  const list = await getBeritaData();
  const filtered = categoryFilter === 'Semua' 
    ? list 
    : list.filter(b => b.category === categoryFilter);

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.gridColumn = '1/-1';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = 'var(--text-muted)';
    emptyMsg.textContent = 'Tidak ada berita ditemukan.';
    container.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(b => {
    const clone = template.content.cloneNode(true);
    
    const img = clone.querySelector('.berita-img');
    img.src = b.image || 'https://via.placeholder.com/600x400';
    img.alt = b.title;

    clone.querySelector('.berita-category').textContent = b.category;
    clone.querySelector('.berita-date').textContent = b.date || new Date().toLocaleDateString('id-ID');
    clone.querySelector('.berita-title').textContent = b.title;
    
    const excerpt = b.content.length > 100 ? b.content.substring(0, 100) + '...' : b.content;
    clone.querySelector('.berita-excerpt').textContent = excerpt;

    clone.querySelector('.berita-link').href = `berita-detail.html?id=${b.id}`;

    container.appendChild(clone);
  });
}

function filterBerita(cat) {
  renderBerita(cat);
}

// Fallback untuk localStorage
function loadBeritaFromStorage() {
  const localData = localStorage.getItem('mpk_berita');
  if (!localData) {
    localStorage.setItem('mpk_berita', JSON.stringify(DEFAULT_BERITA));
  }
  renderBerita('Semua');
}

console.log('✓ Berita-supabase.js loaded');
```

### Step 4: Update diskusi.js untuk Supabase

```javascript
/* js/diskusi-supabase.js - Diskusi dengan Supabase */

document.addEventListener('DOMContentLoaded', () => {
  initDiskusi();
});

async function initDiskusi() {
  renderDiskusi();
  
  const form = document.getElementById('form-diskusi');
  if (!form) {
    console.warn('Diskusi form not found');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitDiskusi(form);
  });
}

async function submitDiskusi(form) {
  const author = document.getElementById('diskusi-author')?.value || 'Anonim';
  const title = document.getElementById('diskusi-title')?.value || '';
  const content = document.getElementById('diskusi-content')?.value || '';

  if (!title || !content) {
    showToast('Judul dan isi diskusi harus diisi!', 'danger');
    return false;
  }

  try {
    const { error } = await window.supabase
      .from('diskusi')
      .insert({
        author,
        title,
        content,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;

    showToast('Topik diskusi berhasil dibuat!', 'success');
    form.reset();
    renderDiskusi();
    return true;
  } catch (error) {
    console.error('Error submitting diskusi:', error);
    showToast('Error: ' + error.message, 'danger');
    return false;
  }
}

async function renderDiskusi() {
  const container = document.getElementById('diskusi-list');
  const template = document.getElementById('tpl-diskusi-card');
  
  if (!container || !template) {
    console.warn('Diskusi elements not found');
    return;
  }

  container.replaceChildren();

  try {
    const { data, error } = await window.supabase
      .from('diskusi')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.textAlign = 'center';
      emptyMsg.style.color = 'var(--text-muted)';
      emptyMsg.textContent = 'Belum ada topik diskusi. Mulai buat sekarang!';
      container.appendChild(emptyMsg);
      return;
    }

    data.forEach(item => {
      const clone = template.content.cloneNode(true);
      
      clone.querySelector('.diskusi-author').textContent = item.author;
      clone.querySelector('.diskusi-date').textContent = item.date;
      clone.querySelector('.diskusi-title').textContent = item.title;
      clone.querySelector('.diskusi-content').textContent = item.content;
      clone.querySelector('.diskusi-comments-count').textContent = `${item.comments || 0} Komentar`;

      container.appendChild(clone);
    });
  } catch (error) {
    console.error('Error rendering diskusi:', error);
    showToast('Error loading diskusi', 'danger');
  }
}

console.log('✓ Diskusi-supabase.js loaded');
```

### Step 5: Update saran.js untuk Supabase

```javascript
/* js/saran-supabase.js - Saran dengan Supabase */

document.addEventListener('DOMContentLoaded', () => {
  initSaran();
});

function initSaran() {
  const form = document.getElementById('form-saran');
  if (!form) {
    console.warn('Saran form not found');
    return;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitSaran(form);
  });
}

async function submitSaran(form) {
  const anonInput = document.getElementById('saran-anon');
  const namaInput = document.getElementById('saran-nama');
  const kelasInput = document.getElementById('saran-kelas');
  const kategoriInput = document.getElementById('saran-kategori');
  const isiInput = document.getElementById('saran-isi');

  const isAnon = anonInput?.checked ?? false;
  const nama = isAnon ? 'Anonim' : (namaInput?.value || '').trim();
  const kelas = kelasInput?.value || '';
  const kategori = kategoriInput?.value || 'Saran';
  const isi = isiInput?.value || '';

  if (!kelas || !isi) {
    showToast('Kelas dan isi saran wajib diisi.', 'danger');
    return false;
  }

  try {
    const { error } = await window.supabase
      .from('aspirasi')
      .insert({
        nama: nama || 'Anonim',
        kelas,
        kategori,
        isi,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;

    showToast('Terkirim! Terima kasih telah menyampaikan aspirasi.', 'success');
    form.reset();
    return true;
  } catch (error) {
    console.error('Error submitting saran:', error);
    showToast('Error: ' + error.message, 'danger');
    return false;
  }
}

console.log('✓ Saran-supabase.js loaded');
```

---

## 🚀 Deploy ke Cloudflare

### Step 1: Push Kode ke GitHub

```bash
# Di terminal, di folder project
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### Step 2: Deploy ke Cloudflare Pages

1. Buka https://pages.cloudflare.com
2. Sign in dengan Cloudflare Account
3. Click "Create a project" → "Connect to Git"
4. Pilih GitHub repository "mpk-website"
5. Configure build settings:
   - **Framework preset**: None
   - **Build command**: (biarkan kosong - tidak perlu build)
   - **Build output directory**: . (dot)
6. Jangan ubah environment variables untuk sekarang
7. Click "Save and Deploy"

### Step 3: Tunggu Deployment Selesai

Cloudflare akan:
- ✅ Clone repository dari GitHub
- ✅ Build project
- ✅ Deploy ke Cloudflare CDN global
- ✅ Generate URL: `mpk-website.pages.dev`

### Step 4: Setup Custom Domain (Opsional)

Jika punya domain sendiri:

1. Di Cloudflare Pages, buka project
2. Settings → Custom domain
3. Masukkan domain Anda (contoh: mpk.smkn1bantul.sch.id)
4. Follow DNS setup instructions
5. Tunggu DNS propagate (~15 menit)

---

## 📝 Update Environment Variables

### Di Cloudflare Pages Dashboard:

1. Buka project → Settings → Environment Variables
2. Add Variable:
   - **Name**: VITE_SUPABASE_URL
   - **Value**: https://YOUR_PROJECT_ID.supabase.co
3. Add Variable:
   - **Name**: VITE_SUPABASE_KEY
   - **Value**: your_anon_key_here
4. Click "Save"
5. Redeploy project

**Update `js/supabase-config.js`:**

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                     'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY || 
                          'your_key_here';
```

---

## 🧪 Testing & Troubleshooting

### Test 1: Cek Deployment

```
1. Buka: mpk-website.pages.dev (atau domain Anda)
2. Cek apakah halaman load dengan baik
3. Buka DevTools (F12) → Console
4. Cek apakah ada error messages
```

### Test 2: Test Berita

```
1. Buka berita.html
2. Cek apakah default berita muncul
3. Buka admin.html
4. Tambah berita baru
5. Refresh berita.html
6. Cek apakah berita baru muncul
```

### Test 3: Test Diskusi

```
1. Buka diskusi.html
2. Buat topik diskusi
3. Refresh halaman
4. Cek apakah topik masih ada
```

### Common Issues:

| Issue | Solusi |
|-------|--------|
| Berita tidak muncul | Cek Supabase URL & key di supabase-config.js |
| Error: CORS | Supabase CORS sudah auto-enabled, tapi cek browser console |
| Database timeout | Cek koneksi internet, Supabase server status |
| Form tidak submit | Cek RLS policies di Supabase |

---

## 🔒 Security Best Practices

### 1. **Jangan Expose Private Keys**

❌ Jangan:
```javascript
const SERVICE_KEY = 'sk_live_xxxxxxxxxxxxx'; // PRIVATE!
```

✅ Lakukan:
- Gunakan `anon key` di client-side
- Gunakan `service_role key` hanya di backend
- Simpan secrets di environment variables

### 2. **Enable Row Level Security (RLS)**

Di Supabase SQL Editor, pastikan RLS enabled untuk semua table:

```sql
ALTER TABLE berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE diskusi ENABLE ROW LEVEL SECURITY;
ALTER TABLE aspirasi ENABLE ROW LEVEL SECURITY;
```

### 3. **Create Policies untuk Akses**

```sql
-- Public read, authenticated insert
CREATE POLICY "Anyone can read" ON berita
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert" ON diskusi
FOR INSERT WITH CHECK (true);
```

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics:
- Login ke Cloudflare Dashboard
- Pilih Pages project
- Lihat traffic, performance, errors

### Supabase Analytics:
- Login ke Supabase Dashboard
- Lihat database usage, API calls, storage

---

## 🔄 Continuous Deployment

Setiap kali push ke GitHub main branch:

1. GitHub mendeteksi push
2. Cloudflare auto-trigger deployment
3. Build & deploy ke production
4. Update live dalam 1-2 menit

---

## 📚 Cheat Sheet Commands

```bash
# Inisialisasi Git (satu kali)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/mpk-website.git
git push -u origin main

# Update setelah ada perubahan
git add .
git commit -m "Deskripsi perubahan"
git push

# Lihat status
git status
git log

# Rollback ke versi sebelumnya
git revert HEAD
git push
```

---

## 🎓 Pembelajaran Lanjutan

### Selanjutnya bisa tambahkan:
- [ ] User authentication dengan Supabase Auth
- [ ] Real-time updates dengan Supabase Realtime
- [ ] File uploads ke Supabase Storage
- [ ] Edge Functions untuk backend logic
- [ ] Email notifications
- [ ] Admin dashboard yang lebih advanced

---

## 📞 Support Resources

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://discord.supabase.io
- **Cloudflare Community**: https://community.cloudflare.com

---

**Status**: ✅ Ready to Deploy  
**Version**: 1.0  
**Last Updated**: 2026-08-13
