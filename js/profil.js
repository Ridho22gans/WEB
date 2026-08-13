/* ==========================================
   PROFIL.JS
   Render foto & data anggota pengurus MPK.
   Sumber utama: tabel "pengurus" di Supabase.
   Fallback: daftar statis di bawah (memakai foto lokal
   assets/image/) jika Supabase belum dikonfigurasi.
   ========================================== */

const FALLBACK_PENGURUS = [
  { nama: 'Avissa',    jabatan: 'Anggota MPK', foto_url: 'assets/image/avissa.png' },
  { nama: 'Bintang',   jabatan: 'Anggota MPK', foto_url: 'assets/image/bintang.png' },
  { nama: 'Christian', jabatan: 'Anggota MPK', foto_url: 'assets/image/christian.png' },
  { nama: 'Diva',      jabatan: 'Anggota MPK', foto_url: 'assets/image/diva.png' },
  { nama: 'Ferry',     jabatan: 'Anggota MPK', foto_url: 'assets/image/ferry.png' },
  { nama: 'Habsah',    jabatan: 'Anggota MPK', foto_url: 'assets/image/habsah.png' },
  { nama: 'Haifa',     jabatan: 'Anggota MPK', foto_url: 'assets/image/haifa.png' },
  { nama: 'Hasan',     jabatan: 'Anggota MPK', foto_url: 'assets/image/hasan.png' },
  { nama: 'Izza',      jabatan: 'Anggota MPK', foto_url: 'assets/image/izza.png' },
  { nama: 'Nadine',    jabatan: 'Anggota MPK', foto_url: 'assets/image/nadine.png' },
  { nama: 'Naura',     jabatan: 'Anggota MPK', foto_url: 'assets/image/naura.png' },
  { nama: 'Rahma',     jabatan: 'Anggota MPK', foto_url: 'assets/image/rahma.png' },
  { nama: 'Rahmat',    jabatan: 'Anggota MPK', foto_url: 'assets/image/rahmat.png' },
  { nama: 'Rehan',     jabatan: 'Anggota MPK', foto_url: 'assets/image/rehan.png' },
  { nama: 'Sigit',     jabatan: 'Anggota MPK', foto_url: 'assets/image/sigit.png' },
  { nama: 'Vera',      jabatan: 'Anggota MPK', foto_url: 'assets/image/vera.png' },
];

async function getPengurusData() {
  if (window.isSupabaseConfigured) {
    const { data, error } = await MpkDB.list('pengurus', { orderBy: 'urutan', ascending: true });
    if (!error && data.length) return data;
  }
  return FALLBACK_PENGURUS;
}

async function renderPengurus() {
  const container = document.getElementById('pengurus-container');
  const tpl = document.getElementById('tpl-pengurus-card');
  if (!container || !tpl) return;

  const list = await getPengurusData();
  if (!list.length) return;

  container.innerHTML = '';

  list.forEach((p) => {
    const clone = tpl.content.cloneNode(true);

    const avatarWrap = clone.querySelector('.pengurus-avatar');
    const nama = clone.querySelector('.pengurus-nama');
    const jabatan = clone.querySelector('.pengurus-jabatan');
    const desc = clone.querySelector('.pengurus-desc');

    if (avatarWrap) {
      avatarWrap.innerHTML = '';
      avatarWrap.style.background = 'var(--border-color)';
      avatarWrap.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.src = p.foto_url || 'assets/icons/logo.png';
      img.alt = `Foto ${p.nama}`;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';

      // Fallback jika foto gagal load -> tampilkan inisial
      img.onerror = () => {
        avatarWrap.innerHTML = '';
        avatarWrap.style.display = 'flex';
        avatarWrap.style.alignItems = 'center';
        avatarWrap.style.justifyContent = 'center';
        avatarWrap.style.fontWeight = 'bold';
        avatarWrap.style.fontSize = '1.5rem';
        avatarWrap.style.color = 'var(--primary)';
        avatarWrap.textContent = p.nama.charAt(0).toUpperCase();
      };

      avatarWrap.appendChild(img);
    }

    if (nama) nama.textContent = p.nama;
    if (jabatan) jabatan.textContent = p.jabatan;
    if (desc) desc.textContent = p.deskripsi || p.desc || '';

    container.appendChild(clone);
  });
}

document.addEventListener('DOMContentLoaded', renderPengurus);
