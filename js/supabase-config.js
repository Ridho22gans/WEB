/* ==========================================================
   SUPABASE CONFIG
   Ganti SUPABASE_URL & SUPABASE_ANON_KEY di bawah dengan milik
   proyek Anda (Supabase Dashboard > Settings > API).
   Kedua nilai ini AMAN ditaruh di frontend (bukan rahasia) -
   akses tulis tetap dijaga oleh RLS + login admin, bukan oleh
   key ini.
   ========================================================== */

const SUPABASE_URL = 'https://clzjrjkfjaohymccwyrg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempyamtmamFvaHltY2N3eXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDAwMjgsImV4cCI6MjEwMjIxNjAyOH0.moMntrTLXABoS_YlA7XqbIFjt8YU7tgt2hd0_aO9TKA';

/* window.supabase disuntik oleh CDN:
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   Harus dimuat SEBELUM file ini di setiap halaman HTML. */
let supabaseClient = null;
const isSupabaseConfigured =
  typeof window.supabase !== 'undefined' &&
  SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1 &&
  SUPABASE_ANON_KEY.indexOf('YOUR_SUPABASE_ANON_KEY') === -1;

if (typeof window.supabase !== 'undefined') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabaseClient = supabaseClient;
} else {
  console.warn('[Supabase] Library belum dimuat. Tambahkan script CDN sebelum supabase-config.js');
}

/* ==========================================================
   AUTH HELPERS
   ========================================================== */
const MpkAuth = {
  async login(email, password) {
    if (!supabaseClient) return { error: { message: 'Supabase belum dikonfigurasi.' } };
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async logout() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  },

  async getSession() {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getSession();
    return data?.session || null;
  },

  async getUser() {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getUser();
    return data?.user || null;
  },

  onChange(callback) {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((_event, session) => callback(session));
  }
};

/* ==========================================================
   GENERIC CRUD HELPER
   Contoh pakai: await MpkDB.list('berita')
                 await MpkDB.insert('berita', {title:'...', ...})
                 await MpkDB.update('berita', id, {title:'baru'})
                 await MpkDB.remove('berita', id)
   ========================================================== */
const MpkDB = {
  async list(table, { orderBy = 'created_at', ascending = false, filters = null } = {}) {
    if (!supabaseClient) return { data: [], error: { message: 'Supabase belum dikonfigurasi.' } };
    let query = supabaseClient.from(table).select('*').order(orderBy, { ascending });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }
    const { data, error } = await query;
    if (error) console.error(`[MpkDB.list:${table}]`, error.message);
    return { data: data || [], error };
  },

  async getById(table, id) {
    if (!supabaseClient) return { data: null, error: { message: 'Supabase belum dikonfigurasi.' } };
    const { data, error } = await supabaseClient.from(table).select('*').eq('id', id).single();
    if (error) console.error(`[MpkDB.getById:${table}]`, error.message);
    return { data, error };
  },

  async insert(table, payload) {
    if (!supabaseClient) return { data: null, error: { message: 'Supabase belum dikonfigurasi.' } };
    const { data, error } = await supabaseClient.from(table).insert(payload).select();
    if (error) console.error(`[MpkDB.insert:${table}]`, error.message);
    return { data, error };
  },

  async update(table, id, payload) {
    if (!supabaseClient) return { data: null, error: { message: 'Supabase belum dikonfigurasi.' } };
    const { data, error } = await supabaseClient.from(table).update(payload).eq('id', id).select();
    if (error) console.error(`[MpkDB.update:${table}]`, error.message);
    return { data, error };
  },

  async remove(table, id) {
    if (!supabaseClient) return { error: { message: 'Supabase belum dikonfigurasi.' } };
    const { error } = await supabaseClient.from(table).delete().eq('id', id);
    if (error) console.error(`[MpkDB.remove:${table}]`, error.message);
    return { error };
  }
};

/* ==========================================================
   STORAGE / UPLOAD HELPER
   Contoh pakai:
     const url = await MpkStorage.upload('pengurus', file);
     // url = link publik siap disimpan ke kolom foto_url
   ========================================================== */
const MpkStorage = {
  async upload(bucket, file, folder = '') {
    if (!supabaseClient) throw new Error('Supabase belum dikonfigurasi.');
    const ext = file.name.split('.').pop();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = folder ? `${folder}/${safeName}` : safeName;

    const { error: uploadError } = await supabaseClient.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) throw uploadError;

    const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  async remove(bucket, path) {
    if (!supabaseClient) return;
    await supabaseClient.storage.from(bucket).remove([path]);
  }
};

window.MpkAuth = MpkAuth;
window.MpkDB = MpkDB;
window.MpkStorage = MpkStorage;
window.isSupabaseConfigured = isSupabaseConfigured;
