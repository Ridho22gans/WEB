/* ==========================================================
   ADMIN.JS - Panel Admin MPK
   Semua data dibaca/ditulis lewat Supabase (lihat js/supabase-config.js)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

async function initAdmin() {
  if (!window.isSupabaseConfigured) {
    document.getElementById('admin-config-warning').style.display = 'block';
  }

  // Cek sesi login yang sudah ada
  const session = await MpkAuth.getSession();
  if (session) {
    showDashboard(session);
  } else {
    showLoginScreen();
  }

  MpkAuth.onChange((session) => {
    if (session) showDashboard(session);
    else showLoginScreen();
  });

  bindLoginForm();
  bindLogout();
  bindTabs();
  bindBeritaForm();
  bindAgendaForm();
  bindPengurusForm();
  bindUnduhanForm();
}

function showLoginScreen() {
  document.getElementById('admin-login-wrap').style.display = 'flex';
  document.getElementById('admin-shell').classList.remove('active');
}

function showDashboard(session) {
  document.getElementById('admin-login-wrap').style.display = 'none';
  document.getElementById('admin-shell').classList.add('active');
  const emailEl = document.getElementById('admin-user-email');
  if (emailEl) emailEl.textContent = `Masuk sebagai: ${session.user.email}`;
  loadAllModules();
}

function bindLoginForm() {
  const form = document.getElementById('admin-login-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = document.getElementById('admin-login-btn');
    const errorBox = document.getElementById('admin-login-error');
    errorBox.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    const { data, error } = await MpkAuth.login(email, password);

    btn.disabled = false;
    btn.textContent = 'Masuk';

    if (error) {
      errorBox.textContent = error.message === 'Invalid login credentials'
        ? 'Email atau kata sandi salah.'
        : error.message;
      errorBox.style.display = 'block';
      return;
    }
    showToast('Berhasil masuk!', 'success');
    showDashboard(data.session);
  });
}

function bindLogout() {
  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await MpkAuth.logout();
    showToast('Anda telah keluar.');
    showLoginScreen();
  });
}

function bindTabs() {
  const tabs = document.querySelectorAll('.admin-tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

function loadAllModules() {
  loadBerita();
  loadAgenda();
  loadPengurus();
  loadAspirasi();
  loadDiskusi();
  loadUnduhan();
}

/* ==========================================================
   MODUL: BERITA
   ========================================================== */
let editingBeritaId = null;

document.getElementById('berita-image-file')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('berita-image-preview').src = URL.createObjectURL(file);
  }
});

function bindBeritaForm() {
  const form = document.getElementById('form-berita');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('berita-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      const title = document.getElementById('berita-title').value;
      const category = document.getElementById('berita-category').value;
      const content = document.getElementById('berita-content').value;
      const file = document.getElementById('berita-image-file').files[0];

      const payload = { title, category, content };

      if (file) {
        payload.image = await MpkStorage.upload('berita', file);
      }

      let result;
      if (editingBeritaId) {
        result = await MpkDB.update('berita', editingBeritaId, payload);
      } else {
        if (!payload.image) payload.image = 'assets/icons/logo.png';
        result = await MpkDB.insert('berita', payload);
      }
      if (result.error) throw new Error(result.error.message);
      showToast(editingBeritaId ? 'Berita berhasil diperbarui!' : 'Berita berhasil ditambahkan!', 'success');

      resetBeritaForm();
      loadBerita();
    } catch (err) {
      showToast('Gagal menyimpan berita: ' + err.message, 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Berita';
    }
  });

  document.getElementById('berita-cancel-edit')?.addEventListener('click', resetBeritaForm);
}

function resetBeritaForm() {
  editingBeritaId = null;
  document.getElementById('form-berita').reset();
  document.getElementById('berita-image-preview').src = 'assets/icons/logo.png';
  document.getElementById('berita-form-title').textContent = 'Tambah Berita Baru';
  document.getElementById('berita-submit-btn').textContent = 'Simpan Berita';
  document.getElementById('berita-cancel-edit').style.display = 'none';
}

async function loadBerita() {
  const { data } = await MpkDB.list('berita');
  document.getElementById('metric-berita').textContent = data.length;

  const tbody = document.getElementById('list-berita');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada berita.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(item => `
    <tr>
      <td><img class="admin-thumb" src="${escapeHtml(item.image || 'assets/icons/logo.png')}" alt=""></td>
      <td>${escapeHtml(item.title)}</td>
      <td><span class="badge badge-primary">${escapeHtml(item.category)}</span></td>
      <td>${escapeHtml(item.date || '')}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editBerita('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteBerita('${item.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function editBerita(id) {
  const { data } = await MpkDB.getById('berita', id);
  if (!data) return;
  editingBeritaId = id;
  document.getElementById('berita-id').value = id;
  document.getElementById('berita-title').value = data.title;
  document.getElementById('berita-category').value = data.category;
  document.getElementById('berita-content').value = data.content;
  document.getElementById('berita-image-preview').src = data.image || 'assets/icons/logo.png';
  document.getElementById('berita-form-title').textContent = 'Edit Berita';
  document.getElementById('berita-submit-btn').textContent = 'Perbarui Berita';
  document.getElementById('berita-cancel-edit').style.display = 'inline-block';
  document.getElementById('form-berita').scrollIntoView({ behavior: 'smooth' });
}

async function deleteBerita(id) {
  if (!confirm('Hapus berita ini?')) return;
  await MpkDB.remove('berita', id);
  showToast('Berita dihapus.');
  loadBerita();
}

/* ==========================================================
   MODUL: AGENDA
   ========================================================== */
let editingAgendaId = null;

function bindAgendaForm() {
  const form = document.getElementById('form-agenda');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('agenda-submit-btn');
    submitBtn.disabled = true;
    const payload = {
      title: document.getElementById('agenda-title').value,
      event_date: document.getElementById('agenda-date').value,
      location: document.getElementById('agenda-location').value,
      description: document.getElementById('agenda-description').value
    };

    try {
      let result;
      if (editingAgendaId) {
        result = await MpkDB.update('agenda', editingAgendaId, payload);
      } else {
        result = await MpkDB.insert('agenda', payload);
      }
      if (result.error) throw new Error(result.error.message);
      showToast(editingAgendaId ? 'Agenda diperbarui!' : 'Agenda ditambahkan!', 'success');
      resetAgendaForm();
      loadAgenda();
    } catch (err) {
      showToast('Gagal menyimpan agenda: ' + err.message, 'danger');
    } finally {
      submitBtn.disabled = false;
    }
  });

  document.getElementById('agenda-cancel-edit')?.addEventListener('click', resetAgendaForm);
}

function resetAgendaForm() {
  editingAgendaId = null;
  document.getElementById('form-agenda').reset();
  document.getElementById('agenda-form-title').textContent = 'Tambah Agenda Baru';
  document.getElementById('agenda-submit-btn').textContent = 'Simpan Agenda';
  document.getElementById('agenda-cancel-edit').style.display = 'none';
}

async function loadAgenda() {
  const { data } = await MpkDB.list('agenda', { orderBy: 'event_date', ascending: true });
  const tbody = document.getElementById('list-agenda');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Belum ada agenda.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${formatTanggalID(item.event_date)}</td>
      <td>${escapeHtml(item.title)}</td>
      <td>${escapeHtml(item.location || '-')}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editAgenda('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAgenda('${item.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function editAgenda(id) {
  const { data } = await MpkDB.getById('agenda', id);
  if (!data) return;
  editingAgendaId = id;
  document.getElementById('agenda-title').value = data.title;
  document.getElementById('agenda-date').value = data.event_date;
  document.getElementById('agenda-location').value = data.location || '';
  document.getElementById('agenda-description').value = data.description || '';
  document.getElementById('agenda-form-title').textContent = 'Edit Agenda';
  document.getElementById('agenda-submit-btn').textContent = 'Perbarui Agenda';
  document.getElementById('agenda-cancel-edit').style.display = 'inline-block';
  document.getElementById('form-agenda').scrollIntoView({ behavior: 'smooth' });
}

async function deleteAgenda(id) {
  if (!confirm('Hapus agenda ini?')) return;
  await MpkDB.remove('agenda', id);
  showToast('Agenda dihapus.');
  loadAgenda();
}

/* ==========================================================
   MODUL: PENGURUS
   ========================================================== */
let editingPengurusId = null;

document.getElementById('pengurus-foto-file')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    document.getElementById('pengurus-foto-preview').src = URL.createObjectURL(file);
  }
});

function bindPengurusForm() {
  const form = document.getElementById('form-pengurus');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('pengurus-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Menyimpan...';

    try {
      const payload = {
        nama: document.getElementById('pengurus-nama').value,
        jabatan: document.getElementById('pengurus-jabatan').value,
        deskripsi: document.getElementById('pengurus-deskripsi').value,
        urutan: parseInt(document.getElementById('pengurus-urutan').value, 10) || 0
      };
      const file = document.getElementById('pengurus-foto-file').files[0];
      if (file) {
        payload.foto_url = await MpkStorage.upload('pengurus', file);
      }

      let result;
      if (editingPengurusId) {
        result = await MpkDB.update('pengurus', editingPengurusId, payload);
      } else {
        result = await MpkDB.insert('pengurus', payload);
      }
      if (result.error) throw new Error(result.error.message);
      showToast(editingPengurusId ? 'Data pengurus diperbarui!' : 'Anggota pengurus ditambahkan!', 'success');
      resetPengurusForm();
      loadPengurus();
    } catch (err) {
      showToast('Gagal menyimpan: ' + err.message, 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Simpan Pengurus';
    }
  });

  document.getElementById('pengurus-cancel-edit')?.addEventListener('click', resetPengurusForm);
}

function resetPengurusForm() {
  editingPengurusId = null;
  document.getElementById('form-pengurus').reset();
  document.getElementById('pengurus-foto-preview').src = 'assets/icons/logo.png';
  document.getElementById('pengurus-form-title').textContent = 'Tambah Anggota Pengurus';
  document.getElementById('pengurus-submit-btn').textContent = 'Simpan Pengurus';
  document.getElementById('pengurus-cancel-edit').style.display = 'none';
}

async function loadPengurus() {
  const { data } = await MpkDB.list('pengurus', { orderBy: 'urutan', ascending: true });
  document.getElementById('metric-pengurus').textContent = data.length;

  const tbody = document.getElementById('list-pengurus');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada data pengurus.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><img class="admin-thumb admin-thumb-round" src="${escapeHtml(item.foto_url || 'assets/icons/logo.png')}" alt=""></td>
      <td>${escapeHtml(item.nama)}</td>
      <td>${escapeHtml(item.jabatan)}</td>
      <td>${item.urutan ?? 0}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editPengurus('${item.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deletePengurus('${item.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

async function editPengurus(id) {
  const { data } = await MpkDB.getById('pengurus', id);
  if (!data) return;
  editingPengurusId = id;
  document.getElementById('pengurus-nama').value = data.nama;
  document.getElementById('pengurus-jabatan').value = data.jabatan;
  document.getElementById('pengurus-deskripsi').value = data.deskripsi || '';
  document.getElementById('pengurus-urutan').value = data.urutan || 0;
  document.getElementById('pengurus-foto-preview').src = data.foto_url || 'assets/icons/logo.png';
  document.getElementById('pengurus-form-title').textContent = 'Edit Anggota Pengurus';
  document.getElementById('pengurus-submit-btn').textContent = 'Perbarui Pengurus';
  document.getElementById('pengurus-cancel-edit').style.display = 'inline-block';
  document.getElementById('form-pengurus').scrollIntoView({ behavior: 'smooth' });
}

async function deletePengurus(id) {
  if (!confirm('Hapus anggota pengurus ini?')) return;
  await MpkDB.remove('pengurus', id);
  showToast('Data pengurus dihapus.');
  loadPengurus();
}

/* ==========================================================
   MODUL: ASPIRASI (hanya kelola status & hapus, tidak bisa ditambah admin)
   ========================================================== */
async function loadAspirasi() {
  const { data } = await MpkDB.list('aspirasi');
  document.getElementById('metric-aspirasi').textContent = data.length;

  const tbody = document.getElementById('list-aspirasi');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Belum ada aspirasi masuk.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${escapeHtml(item.nama)}</td>
      <td>${escapeHtml(item.kelas)}</td>
      <td>${escapeHtml(item.kategori)}</td>
      <td style="max-width:280px;">${escapeHtml((item.isi || '').slice(0, 120))}${(item.isi || '').length > 120 ? '…' : ''}</td>
      <td>
        <select class="form-control" style="padding:0.35rem; font-size:0.8rem;" onchange="updateAspirasiStatus('${item.id}', this.value)">
          <option value="Baru" ${item.status === 'Baru' ? 'selected' : ''}>Baru</option>
          <option value="Diproses" ${item.status === 'Diproses' ? 'selected' : ''}>Diproses</option>
          <option value="Selesai" ${item.status === 'Selesai' ? 'selected' : ''}>Selesai</option>
        </select>
      </td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteAspirasi('${item.id}')">Hapus</button></td>
    </tr>
  `).join('');
}

async function updateAspirasiStatus(id, status) {
  await MpkDB.update('aspirasi', id, { status });
  showToast('Status aspirasi diperbarui.');
}

async function deleteAspirasi(id) {
  if (!confirm('Hapus aspirasi ini?')) return;
  await MpkDB.remove('aspirasi', id);
  showToast('Aspirasi dihapus.');
  loadAspirasi();
}

/* ==========================================================
   MODUL: DISKUSI (moderasi - hapus topik/balasan)
   ========================================================== */
async function loadDiskusi() {
  const { data: topics } = await MpkDB.list('diskusi');
  document.getElementById('metric-diskusi').textContent = topics.length;

  const container = document.getElementById('list-diskusi');
  if (!topics.length) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted);">Belum ada topik diskusi.</p>`;
    return;
  }

  const { data: allReplies } = await MpkDB.list('diskusi_balasan', { orderBy: 'created_at', ascending: true });

  container.innerHTML = topics.map(t => {
    const replies = allReplies.filter(r => r.diskusi_id === t.id);
    return `
      <div class="card" style="margin-bottom:1rem;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong>${escapeHtml(t.author)}</strong>
            <button class="btn btn-danger btn-sm" onclick="deleteDiskusi('${t.id}')">Hapus Topik</button>
          </div>
          <h4 style="margin-bottom:0.4rem;">${escapeHtml(t.title)}</h4>
          <p class="card-text">${escapeHtml(t.content)}</p>
          ${replies.length ? `<hr style="border:0;border-top:1px solid var(--border-color); margin:0.75rem 0;">
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${replies.map(r => `
                <div style="display:flex; justify-content:space-between; gap:1rem; font-size:0.85rem; background:var(--bg-main); padding:0.5rem 0.75rem; border-radius:8px;">
                  <span><strong>${escapeHtml(r.author)}:</strong> ${escapeHtml(r.content)}</span>
                  <button class="btn btn-danger btn-sm" onclick="deleteBalasan('${r.id}')">Hapus</button>
                </div>
              `).join('')}
            </div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function deleteDiskusi(id) {
  if (!confirm('Hapus topik diskusi ini beserta seluruh balasannya?')) return;
  await MpkDB.remove('diskusi', id);
  showToast('Topik diskusi dihapus.');
  loadDiskusi();
}

async function deleteBalasan(id) {
  if (!confirm('Hapus balasan ini?')) return;
  await MpkDB.remove('diskusi_balasan', id);
  showToast('Balasan dihapus.');
  loadDiskusi();
}

/* ==========================================================
   MODUL: UNDUHAN
   ========================================================== */
function bindUnduhanForm() {
  const form = document.getElementById('form-unduhan');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('unduhan-submit-btn');
    const file = document.getElementById('unduhan-file').files[0];
    if (!file) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengunggah...';
    try {
      const fileUrl = await MpkStorage.upload('unduhan', file);
      const result = await MpkDB.insert('unduhan', {
        title: document.getElementById('unduhan-title').value,
        description: document.getElementById('unduhan-description').value,
        file_url: fileUrl,
        file_name: file.name
      });
      if (result.error) throw new Error(result.error.message);
      showToast('Dokumen berhasil diunggah!', 'success');
      form.reset();
      loadUnduhan();
    } catch (err) {
      showToast('Gagal mengunggah: ' + err.message, 'danger');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Unggah Dokumen';
    }
  });
}

async function loadUnduhan() {
  const { data } = await MpkDB.list('unduhan');
  const tbody = document.getElementById('list-unduhan');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">Belum ada dokumen.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(item => `
    <tr>
      <td>${escapeHtml(item.title)}</td>
      <td><a href="${escapeHtml(item.file_url)}" target="_blank" rel="noreferrer">${escapeHtml(item.file_name || 'Buka')}</a></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteUnduhan('${item.id}')">Hapus</button></td>
    </tr>
  `).join('');
}

async function deleteUnduhan(id) {
  if (!confirm('Hapus dokumen ini?')) return;
  await MpkDB.remove('unduhan', id);
  showToast('Dokumen dihapus.');
  loadUnduhan();
}

/* ==========================================================
   UTIL
   ========================================================== */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTanggalID(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
