/* js/berita-detail.js - Detail Page Berita */
document.addEventListener('DOMContentLoaded', () => {
  initBeritaDetail();
});

async function initBeritaDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    showNotFound();
    return;
  }

  let item = null;

  if (window.isSupabaseConfigured) {
    const { data } = await MpkDB.getById('berita', id);
    item = data;
  }

  if (!item) {
    const cache = JSON.parse(localStorage.getItem('mpk_berita_cache') || '[]');
    item = cache.find(entry => String(entry.id) === String(id)) || null;
  }

  if (!item) {
    showNotFound();
    return;
  }

  displayBeritaDetail(item);
}

function displayBeritaDetail(item) {
  const title = document.getElementById('detail-title');
  const category = document.getElementById('detail-category');
  const date = document.getElementById('detail-date');
  const image = document.getElementById('detail-image');
  const content = document.getElementById('detail-content');

  if (title) title.textContent = item.title;
  if (category) category.textContent = item.category;
  if (date) date.textContent = item.date || '';

  if (image) {
    image.src = item.image || 'assets/icons/logo.png';
    image.alt = item.title;
  }

  if (content) {
    content.innerHTML = `<p>${(item.content || '').replace(/\n/g, '</p><p>')}</p>`;
  }
}

function showNotFound() {
  const item = {
    title: 'Berita tidak ditemukan',
    category: 'Informasi',
    date: new Date().toISOString().split('T')[0],
    image: 'assets/icons/logo.png',
    content: 'Berita yang Anda cari tidak tersedia atau telah dihapus.'
  };
  displayBeritaDetail(item);
}
