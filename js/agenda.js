/* js/agenda.js */
const FALLBACK_AGENDA = [
  { title: 'Pelatihan Kepemimpinan', event_date: '2026-08-10', location: '', description: 'Pelatihan dasar kepemimpinan dan tata cara musyawarah untuk pengurus baru MPK.' },
  { title: 'Peringatan HUT RI', event_date: '2026-08-17', location: '', description: 'Kegiatan peringatan kemerdekaan dengan tema semangat nasionalisme siswa.' },
  { title: 'Forum Aspirasi Siswa', event_date: '2026-08-25', location: '', description: 'Mekanisme pengumpulan aspirasi dari seluruh kelas dan pembahasan tindak lanjutnya.' }
];

document.addEventListener('DOMContentLoaded', renderAgenda);

async function renderAgenda() {
  const container = document.getElementById('agenda-container');
  const tpl = document.getElementById('tpl-agenda-card');
  if (!container || !tpl) return;

  let list = FALLBACK_AGENDA;
  if (window.isSupabaseConfigured) {
    const { data, error } = await MpkDB.list('agenda', { orderBy: 'event_date', ascending: true });
    if (!error && data.length) list = data;
  }

  container.innerHTML = '';
  list.forEach((item) => {
    const clone = tpl.content.cloneNode(true);
    clone.querySelector('.agenda-date').textContent = formatTanggalAgendaID(item.event_date);
    clone.querySelector('.agenda-title').textContent = item.title;
    clone.querySelector('.agenda-description').textContent = item.description || '';
    const locEl = clone.querySelector('.agenda-location');
    locEl.textContent = item.location ? `📍 ${item.location}` : '';
    container.appendChild(clone);
  });
}

function formatTanggalAgendaID(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
