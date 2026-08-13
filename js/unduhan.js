/* js/unduhan.js */
const FALLBACK_UNDUHAN = [
  { title: 'Panduan Aspirasi Siswa', description: 'Pedoman untuk menulis dan menyampaikan aspirasi secara tertib, jelas, dan tepat sasaran.', file_url: 'assets/documents/panduan-aspirasi.pdf' },
  { title: 'Format Laporan Kegiatan', description: 'Template laporan kegiatan organisasi siswa untuk kebutuhan administrasi dan dokumentasi.', file_url: 'assets/documents/laporan-kegiatan.docx' },
  { title: 'Proposal Program MPK', description: 'Dokumen proposal program kerja MPK yang dapat dijadikan acuan perencanaan kegiatan.', file_url: 'assets/documents/proposal-mpk.pdf' }
];

document.addEventListener('DOMContentLoaded', renderUnduhan);

async function renderUnduhan() {
  const container = document.getElementById('unduhan-container');
  const tpl = document.getElementById('tpl-unduhan-card');
  if (!container || !tpl) return;

  let list = FALLBACK_UNDUHAN;
  if (window.isSupabaseConfigured) {
    const { data, error } = await MpkDB.list('unduhan');
    if (!error && data.length) list = data;
  }

  container.innerHTML = '';
  list.forEach((item) => {
    const clone = tpl.content.cloneNode(true);
    clone.querySelector('.unduhan-title').textContent = item.title;
    clone.querySelector('.unduhan-description').textContent = item.description || '';
    clone.querySelector('.unduhan-link').href = item.file_url;
    container.appendChild(clone);
  });
}
