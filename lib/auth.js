import { supabase, isSupabaseConfigured } from "./supabaseClient";

// Perangkat desa login memakai "username" (bukan email) supaya lebih akrab
// dan mudah diingat. Di balik layar, Supabase Auth tetap memakai email,
// jadi username digabung dengan domain berikut untuk dijadikan email.
// Jika perangkat desa memasukkan sesuatu yang sudah berbentuk email
// (mengandung "@"), nilai itu dipakai apa adanya.
const ADMIN_EMAIL_DOMAIN =
  process.env.NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN || "@admin.desasukorejo.id";

export function usernameToEmail(username) {
  const trimmed = (username || "").trim();
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed.toLowerCase()}${ADMIN_EMAIL_DOMAIN}`;
}

export async function loginWithUsername(username, password) {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan key di file .env.local terlebih dahulu."
    };
  }
  const email = usernameToEmail(username);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    return { error: "Username atau kata sandi salah." };
  }
  return { data };
}

export async function logout() {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}
