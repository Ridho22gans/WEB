/* js/berita.js */
const DEFAULT_BERITA = [
  {
    id: '1',
    title: 'Pelaksanaan Pemilos SMK Negeri 1 Bantul 2026',
    category: 'Kegiatan',
    date: '2026-08-10',
    image: 'assets/documents/opec-poster.jpg',
    content: 'Pemilihan Ketua OSIS dan Ketua MPK berlangsung secara tertib dan demokratis dengan e-voting.'
  },
  {
    id: '2',
    title: 'Rapat Kerja & Sidang Pleno MPK',
    category: 'Organisasi',
    date: '2026-07-25',
    image: 'assets/icons/logo.png',
    content: 'Pembahasan Anggaran Dasar / Anggaran Rumah Tangga serta pengesahan program kerja setahun.'
  }
];

let ALL_BERITA = [];

document.addEventListener('DOMContentLoaded', async () => {
  ALL_BERITA = await getBeritaData();
  renderBerita('Semua');
});

async function getBeritaData() {
  if (window.isSupabaseConfigured) {
    const { data, error } = await MpkDB.list('berita');
    if (!error && data.length) {
      // simpan cache untuk halaman detail
      localStorage.setItem('mpk_berita_cache', JSON.stringify(data));
      return data;
    }
  }
  const localData = localStorage.getItem('mpk_berita_cache');
  if (localData) return JSON.parse(localData);
  return DEFAULT_BERITA;
}

function renderBerita(categoryFilter = 'Semua') {
  const container = document.getElementById('berita-container');
  if (!container) return;

  const filtered = categoryFilter === 'Semua'
    ? ALL_BERITA
    : ALL_BERITA.filter(b => b.category === categoryFilter);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Tidak ada berita ditemukan.</p>`;
    return;
  }

  container.innerHTML = filtered.map(b => `
    <article class="card">
      <img src="${b.image}" alt="${b.title}" style="height: 200px; object-fit: cover;" loading="lazy">
      <div class="card-body">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="badge badge-primary">${b.category}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted); align-self: center;">${b.date || ''}</span>
        </div>
        <h3 class="card-title">${b.title}</h3>
        <p class="card-text">${(b.content || '').substring(0, 100)}...</p>
        <a href="berita-detail.html?id=${b.id}" class="btn btn-secondary" style="margin-top: auto; align-self: flex-start;">Baca Selengkapnya</a>
      </div>
    </article>
  `).join('');
}

function filterBerita(cat) {
  renderBerita(cat);
}
