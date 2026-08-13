/* js/diskusi.js */
document.addEventListener('DOMContentLoaded', () => {
  renderDiskusi();

  const form = document.getElementById('form-diskusi');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('diskusi-author').value || 'Anonim';
    const title = document.getElementById('diskusi-title').value;
    const content = document.getElementById('diskusi-content').value;

    if (window.isSupabaseConfigured) {
      const { error } = await MpkDB.insert('diskusi', { author, title, content });
      if (error) {
        showToast('Gagal mengirim topik: ' + error.message, 'danger');
        return;
      }
    } else {
      const list = JSON.parse(localStorage.getItem('mpk_diskusi') || '[]');
      list.unshift({
        id: Date.now().toString(),
        author, title, content,
        date: new Date().toLocaleDateString('id-ID'),
        comments: []
      });
      localStorage.setItem('mpk_diskusi', JSON.stringify(list));
    }

    showToast('Topik diskusi berhasil dibuat!', 'success');
    form.reset();
    renderDiskusi();
  });
});

async function renderDiskusi() {
  const container = document.getElementById('diskusi-list');
  if (!container) return;

  let list = [];
  if (window.isSupabaseConfigured) {
    const { data } = await MpkDB.list('diskusi');
    list = data;
  } else {
    list = JSON.parse(localStorage.getItem('mpk_diskusi') || '[]');
  }

  if (!list.length) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted);">Belum ada topik diskusi. Mulai buat sekarang!</p>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <strong>${escapeHtmlDiskusi(item.author)}</strong>
          <small style="color: var(--text-muted);">${item.date || ''}</small>
        </div>
        <h3 class="card-title">${escapeHtmlDiskusi(item.title)}</h3>
        <p class="card-text">${escapeHtmlDiskusi(item.content)}</p>
        <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1rem 0;">
        <span style="font-size: 0.85rem; color: var(--text-muted);">${(item.comments && item.comments.length) || 0} Komentar</span>
      </div>
    </div>
  `).join('');
}

function escapeHtmlDiskusi(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
