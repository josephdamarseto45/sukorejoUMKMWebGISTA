import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Mendukung dua format key Supabase: format lama (anon key, `eyJ...`) dan
// format baru (publishable key, `sb_publishable_...`). Pakai yang tersedia
// duluan supaya .env yang sudah terisi salah satu tetap berfungsi.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// `supabase` bernilai null jika env belum diisi, supaya app tetap jalan
// dengan data contoh (lihat data/sampleData.js) saat development awal.
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);
