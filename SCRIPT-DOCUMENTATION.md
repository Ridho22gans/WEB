# MPK Website - Script Documentation

## 📋 Overview
Semua script website MPK telah diintegrasikan dan saling terhubung dengan baik. Berikut adalah panduan lengkap tentang bagaimana semua script bekerja bersama.

## 🏗️ Arsitektur Script

### 1. **utils.js** - Utility Functions (Dimuat Pertama)
File ini berisi fungsi-fungsi global yang digunakan oleh semua halaman:
- **showToast()** - Menampilkan notifikasi toast
- **StorageManager** - Mengelola localStorage dengan aman
- **formatDate()** - Memformat tanggal
- **getQueryParam()** - Mengambil parameter URL
- **DOM** - Helper untuk manipulasi DOM
- **Navigation** - Helper untuk navigasi
- **Validators** - Validasi data

### 2. **main.js** - Main Script Global (Dimuat Kedua)
File ini dimuat di semua halaman dan menginisialisasi:
- **initTheme()** - Mengelola tema gelap/terang
- **initNavbar()** - Inisialisasi navbar dan hamburger menu
- **initCounters()** - Animasi counter di homepage
- **initScrollReveal()** - Animasi reveal saat scroll
- **initPageLinks()** - Sistem navigasi terstruktur
- **updateActiveNavLink()** - Update link aktif di navbar
- Error handling dan network monitoring

### 3. **Module Scripts Khusus Halaman** (Dimuat Ketiga)

#### **berita.js** - Halaman Berita
- **renderBerita()** - Menampilkan daftar berita
- **filterBerita()** - Filter berita berdasarkan kategori
- **getBeritaData()** - Mengambil data berita dari localStorage
- Default data: 2 berita contoh yang otomatis dimuat jika belum ada data

#### **berita-detail.js** - Halaman Detail Berita
- **initBeritaDetail()** - Inisialisasi halaman detail
- **displayBeritaDetail()** - Menampilkan detail berita
- **showNotFound()** - Menampilkan pesan jika berita tidak ditemukan

#### **diskusi.js** - Forum Diskusi
- **initDiskusi()** - Inisialisasi forum diskusi
- **submitDiskusi()** - Mengirim topik diskusi baru
- **renderDiskusi()** - Menampilkan daftar diskusi
- Fitur: Simpan sebagai anonim, hitung komentar

#### **saran.js** - Kotak Saran & Aspirasi
- **initSaran()** - Inisialisasi form saran
- **submitSaran()** - Mengirim saran ke localStorage
- Fitur: Pilih kategori (Kritik/Saran/Aspirasi/Pengaduan), pilihan anonim

#### **admin.js** - Panel Admin
- **initAdmin()** - Inisialisasi panel admin
- **submitNews()** - Tambah berita baru
- **updateDashboardMetrics()** - Update statistik dashboard
- **renderAdminBeritaTable()** - Tampilkan tabel berita
- **deleteBerita()** - Hapus berita dengan konfirmasi

## 📄 Loading Order untuk Setiap Halaman

Semua halaman mengikuti urutan loading yang sama:

```html
<script src="js/utils.js"></script>        <!-- 1. Utilities global -->
<script src="js/main.js"></script>         <!-- 2. Main script global -->
<script src="js/[page-name].js"></script>  <!-- 3. Script spesifik halaman (jika ada) -->
```

### Halaman yang Ada:

1. **index.html** → utils.js + main.js
2. **profil.html** → utils.js + main.js
3. **berita.html** → utils.js + main.js + berita.js
4. **berita-detail.html** → utils.js + main.js + berita-detail.js
5. **agenda.html** → utils.js + main.js
6. **diskusi.html** → utils.js + main.js + diskusi.js
7. **unduhan.html** → utils.js + main.js
8. **saran.html** → utils.js + main.js + saran.js
9. **kontak.html** → utils.js + main.js
10. **admin.html** → utils.js + main.js + admin.js

## 🔗 Referensi Antar Script

### Dari main.js ke Module Scripts
```javascript
// Window object yang tersedia di semua script:
window.mpkNavigation       // Navigasi terstruktur
window.showToast()         // Menampilkan notifikasi
window.StorageManager      // Mengelola data
```

### Dari Module Scripts ke Utils
```javascript
showToast()               // Notifikasi
StorageManager.get/set()  // Simpan data
Validators                // Validasi input
```

## 💾 Data Storage

Semua data disimpan di localStorage dengan key:
- `mpk_theme` - Tema pengguna (light/dark)
- `mpk_berita` - Daftar berita
- `mpk_diskusi` - Daftar diskusi
- `mpk_aspirasi` - Daftar saran/aspirasi

## 🚀 Fitur Utama

### 1. Tema (Light/Dark)
- Toggle tersedia di semua halaman
- Tersimpan di localStorage
- Konsisten di semua halaman

### 2. Responsive Navigation
- Hamburger menu untuk mobile
- Active link indicator
- Smooth scroll pada scroll header

### 3. Animasi
- Scroll reveal untuk elemen
- Counter animation di homepage
- Toast notifications dengan animasi

### 4. Data Management
- Semua data di localStorage
- Tidak perlu backend
- Fallback data default

### 5. Form Validation
- Validasi input di semua form
- Error messages yang jelas
- Success notifications

## 📊 Alur Data

```
User Input (Form)
    ↓
Validasi (Validators)
    ↓
Show Toast (showToast)
    ↓
Simpan ke localStorage (StorageManager)
    ↓
Render/Tampilkan Data (Module Script)
    ↓
UI Update
```

## 🛠️ Troubleshooting

Jika script tidak bekerja:

1. **Buka Developer Console** (F12)
2. **Cek console.log()** - Setiap modul log jika berhasil dimuat
3. **Cek Network Tab** - Pastikan semua file JS terload
4. **Cek di localStorage** - Buka DevTools → Application → Local Storage

### Common Issues:

| Issue | Solusi |
|-------|--------|
| Toast tidak muncul | Pastikan utils.js dimuat sebelum main.js |
| Berita tidak tampil | Buka admin.html dan tambah berita |
| Form tidak berfungsi | Cek console untuk error message |
| Data hilang saat refresh | Buka DevTools dan cek localStorage |

## 📝 Cara Menambah Fitur Baru

1. **Tambah HTML Element** di file HTML yang sesuai
2. **Buat selector/ID** untuk elemen tersebut
3. **Tambah function** di module script yang sesuai
4. **Call function** saat DOMContentLoaded
5. **Log ke console** untuk debugging

Contoh:
```javascript
// Di module-name.js
function initNewFeature() {
  const element = document.getElementById('new-element');
  if (!element) return console.warn('Element not found');
  
  element.addEventListener('click', () => {
    showToast('Fitur baru berhasil!', 'success');
  });
  
  console.log('✓ New feature initialized');
}

// Di initModule()
document.addEventListener('DOMContentLoaded', () => {
  initNewFeature();
});
```

## ✅ Checklist Persiapan Deployment

- [x] Semua HTML file memiliki script loading yang benar
- [x] Semua JS file menggunakan console.log untuk debugging
- [x] Error handling di semua form
- [x] Fallback data default
- [x] Toast notifications berfungsi
- [x] localStorage management terpusat
- [x] Responsive design
- [x] Tema light/dark berfungsi

## 📞 Support

Jika ada pertanyaan atau masalah, periksa:
1. Console log di DevTools
2. Network tab untuk file loading
3. localStorage di Application tab
4. File dokumentasi ini

---

**Last Updated**: 2026-08-13  
**Version**: 1.0  
**Status**: ✅ Production Ready
