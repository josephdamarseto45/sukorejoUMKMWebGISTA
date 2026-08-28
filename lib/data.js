import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { sampleWisata, sampleUmkm } from "@/data/sampleData";

/**
 * Semua fungsi di file ini mengembalikan bentuk data yang sama persis,
 * baik saat diambil dari Supabase maupun dari data contoh (fallback),
 * sehingga komponen UI tidak perlu tahu sumber datanya.
 */

export async function getWisata() {
  if (!isSupabaseConfigured) return sampleWisata;
  const { data, error } = await supabase
    .from("wisata")
    .select("*")
    .order("nama", { ascending: true });
  if (error) {
    console.error("getWisata:", error.message);
    return sampleWisata;
  }
  return data?.length ? data : sampleWisata;
}

export async function getUmkm() {
  if (!isSupabaseConfigured) return sampleUmkm;
  const { data, error } = await supabase
    .from("umkm")
    .select("*")
    .order("nama", { ascending: true });
  if (error) {
    console.error("getUmkm:", error.message);
    return sampleUmkm;
  }
  return data?.length ? data : sampleUmkm;
}

export async function getAllLocations() {
  const [wisata, umkm] = await Promise.all([getWisata(), getUmkm()]);
  return [
    ...wisata.map((w) => ({ ...w, jenis: "wisata" })),
    ...umkm.map((u) => ({ ...u, jenis: "umkm" }))
  ];
}

/**
 * Fungsi CRUD di bawah ini dipakai oleh halaman admin (lihat app/admin).
 * Semua fungsi memerlukan Supabase yang terkonfigurasi DAN sesi yang sudah
 * login (lihat lib/auth.js), karena penulisan data dibatasi oleh Row Level
 * Security (RLS) pada tabel `wisata` dan `umkm` — lihat supabase/schema.sql.
 */

const TABLES = { wisata: "wisata", umkm: "umkm" };

function assertTable(jenis) {
  const table = TABLES[jenis];
  if (!table) throw new Error(`Jenis data tidak dikenal: ${jenis}`);
  return table;
}

export async function createLocation(jenis, payload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  const table = assertTable(jenis);
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLocation(jenis, id, payload) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  const table = assertTable(jenis);
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteLocation(jenis, id) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  const table = assertTable(jenis);
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

/**
 * Upload file foto (dipilih/dijepret dari perangkat admin) ke Supabase
 * Storage, bucket `foto-lokasi` (lihat supabase/migration_storage_foto.sql).
 * Mengembalikan public URL yang langsung bisa disimpan ke kolom `foto_url`.
 */
const FOTO_BUCKET = "foto-lokasi";
const MAX_FOTO_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadFotoLokasi(jenis, file) {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  if (!file) throw new Error("File foto tidak ditemukan.");
  if (!file.type?.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }
  if (file.size > MAX_FOTO_SIZE) {
    throw new Error("Ukuran foto maksimal 5MB.");
  }

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${jenis}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(FOTO_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(FOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Menghapus file foto dari Supabase Storage berdasarkan public URL-nya.
 * Dipakai saat admin menghapus salah satu foto dari galeri (1-4 foto) di
 * form lokasi. Diam-diam gagal (tidak melempar error) kalau URL bukan
 * berasal dari bucket `foto-lokasi` (mis. foto lama yang diisi manual),
 * supaya proses hapus di form tidak pernah terhambat oleh ini.
 */
export async function deleteFotoLokasi(url) {
  if (!isSupabaseConfigured || !url) return;
  const marker = `/storage/v1/object/public/${FOTO_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return; // bukan foto dari bucket kita (mis. URL manual)
  const path = decodeURIComponent(url.slice(idx + marker.length));
  const { error } = await supabase.storage.from(FOTO_BUCKET).remove([path]);
  if (error) console.error("deleteFotoLokasi:", error.message);
}
