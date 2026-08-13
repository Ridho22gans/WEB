/* js/saran.js */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-saran');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isAnon = document.getElementById('saran-anon').checked;
    const nama = isAnon ? 'Anonim' : (document.getElementById('saran-nama').value || 'Anonim');
    const kelas = document.getElementById('saran-kelas').value;
    const kategori = document.getElementById('saran-kategori').value;
    const isi = document.getElementById('saran-isi').value;

    if (window.isSupabaseConfigured) {
      const { error } = await MpkDB.insert('aspirasi', { nama, kelas, kategori, isi });
      if (error) {
        showToast('Gagal mengirim: ' + error.message, 'danger');
        return;
      }
    } else {
      const aspirasi = {
        id: Date.now().toString(),
        nama, kelas, kategori, isi,
        date: new Date().toISOString().split('T')[0]
      };
      const existing = JSON.parse(localStorage.getItem('mpk_aspirasi') || '[]');
      existing.unshift(aspirasi);
      localStorage.setItem('mpk_aspirasi', JSON.stringify(existing));
    }

    showToast('Terkirim! Terima kasih telah menyampaikan aspirasi.', 'success');
    form.reset();
  });
});
