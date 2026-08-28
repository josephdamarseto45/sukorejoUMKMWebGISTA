-- =========================================================
-- Skema database WebGIS UMKM & Wisata Desa Sukorejo
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- Tabel WISATA ----------
create table if not exists public.wisata (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  kategori text not null,           -- Wisata Alam, Wisata Air, Wisata Budaya, dst
  deskripsi text,
  lat double precision not null,
  lng double precision not null,
  telepon text,
  lokasi text,                      -- alamat / dusun
  harga text,                       -- disimpan sebagai teks agar fleksibel ("Gratis", "Rp 5.000", dll)
  jam_buka text,
  foto_url text,
  created_at timestamptz default now()
);

-- ---------- Tabel UMKM ----------
create table if not exists public.umkm (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  kategori text not null,           -- Kuliner, Kerajinan, Oleh-oleh, Jasa & Penginapan, dst
  deskripsi text,
  lat double precision not null,
  lng double precision not null,
  telepon text,
  lokasi text,
  harga text,
  jam_buka text,
  foto_url text,
  created_at timestamptz default now()
);

-- Index spasial sederhana untuk mempercepat query berbasis bounding box
create index if not exists wisata_lat_lng_idx on public.wisata (lat, lng);
create index if not exists umkm_lat_lng_idx on public.umkm (lat, lng);

-- ---------- Row Level Security ----------
alter table public.wisata enable row level security;
alter table public.umkm enable row level security;

-- Kebijakan RLS dibuat lewat drop-lalu-create supaya file ini AMAN
-- dijalankan berulang kali (mis. saat setup ulang), karena Postgres tidak
-- mendukung "CREATE POLICY IF NOT EXISTS".

-- Publik hanya boleh membaca (SELECT).
drop policy if exists "Wisata dapat dibaca publik" on public.wisata;
create policy "Wisata dapat dibaca publik"
  on public.wisata for select
  using (true);

drop policy if exists "UMKM dapat dibaca publik" on public.umkm;
create policy "UMKM dapat dibaca publik"
  on public.umkm for select
  using (true);

-- Insert/update/delete hanya boleh dilakukan oleh pengguna yang sudah
-- login (perangkat desa lewat halaman /admin, lihat app/admin). Pengguna
-- publik yang mengakses situs tanpa login tidak bisa mengubah data apa pun.
drop policy if exists "Wisata dapat ditambah oleh admin login" on public.wisata;
create policy "Wisata dapat ditambah oleh admin login"
  on public.wisata for insert
  to authenticated
  with check (true);

drop policy if exists "Wisata dapat diubah oleh admin login" on public.wisata;
create policy "Wisata dapat diubah oleh admin login"
  on public.wisata for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Wisata dapat dihapus oleh admin login" on public.wisata;
create policy "Wisata dapat dihapus oleh admin login"
  on public.wisata for delete
  to authenticated
  using (true);

drop policy if exists "UMKM dapat ditambah oleh admin login" on public.umkm;
create policy "UMKM dapat ditambah oleh admin login"
  on public.umkm for insert
  to authenticated
  with check (true);

drop policy if exists "UMKM dapat diubah oleh admin login" on public.umkm;
create policy "UMKM dapat diubah oleh admin login"
  on public.umkm for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "UMKM dapat dihapus oleh admin login" on public.umkm;
create policy "UMKM dapat dihapus oleh admin login"
  on public.umkm for delete
  to authenticated
  using (true);

-- ---------- Realtime ----------
-- Mengaktifkan Supabase Realtime pada kedua tabel supaya perubahan data
-- (tambah/ubah/hapus) dari panel admin langsung disiarkan ke semua
-- pengunjung yang sedang membuka Peta WebGIS / Katalog (lihat
-- lib/useLiveLocations.js) — tanpa perlu me-reload halaman secara manual.
-- Aman dijalankan berulang; diabaikan jika tabel sudah terdaftar.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wisata'
  ) then
    alter publication supabase_realtime add table public.wisata;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'umkm'
  ) then
    alter publication supabase_realtime add table public.umkm;
  end if;
end $$;

-- ---------- Contoh data (opsional, boleh dihapus) ----------
insert into public.wisata (nama, kategori, deskripsi, lat, lng, telepon, lokasi, harga, jam_buka)
values
  ('Puncak Ndeso Kemuning', 'Wisata Alam', 'Gardu pandang bambu dengan panorama perbukitan Sambirejo.', -7.3521, 111.0512, '0812-2345-6701', 'Dusun Kemuning, Desa Sukorejo, Sambirejo, Sragen', 'Rp 5.000 / orang', '06.00 - 18.00 WIB'),
  ('Embung Sukorejo', 'Wisata Air', 'Embung untuk rekreasi keluarga dan spot foto.', -7.3548, 111.0439, '0812-2345-6703', 'Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen', 'Rp 5.000 / orang', '07.00 - 17.00 WIB')
on conflict do nothing;

insert into public.umkm (nama, kategori, deskripsi, lat, lng, telepon, lokasi, harga, jam_buka)
values
  ('Warung Pecel Mbok Jum', 'Kuliner', 'Pecel sayur khas Sragen dengan sambal kacang.', -7.3559, 111.0475, '0812-3456-7801', 'Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen', 'Rp 10.000 - Rp 15.000', '06.00 - 14.00 WIB'),
  ('Kerajinan Bambu Pak Sardi', 'Kerajinan', 'Anyaman bambu dan suvenir khas desa wisata.', -7.3538, 111.0498, '0813-3456-7802', 'Dusun Kemuning, Desa Sukorejo, Sambirejo, Sragen', 'Rp 5.000 - Rp 75.000', '08.00 - 16.00 WIB')
on conflict do nothing;

-- =========================================================
-- Membuat akun login untuk perangkat desa (halaman /admin)
-- =========================================================
-- Halaman admin memakai Supabase Auth (email + password) di balik layar,
-- tapi ditampilkan sebagai "username" ke perangkat desa (lihat lib/auth.js).
-- Username digabung otomatis dengan domain NEXT_PUBLIC_ADMIN_EMAIL_DOMAIN
-- (default: "@admin.desasukorejo.id") untuk dijadikan email login.
--
-- Cara membuat akun admin pertama:
-- 1. Buka Supabase Dashboard -> Authentication -> Users -> "Add user".
-- 2. Isi Email, misalnya: admin@admin.desasukorejo.id
--    (kalau mau username "kepaladesa", emailnya: kepaladesa@admin.desasukorejo.id)
-- 3. Isi Password, lalu centang "Auto Confirm User".
-- 4. Simpan. Perangkat desa lalu login di halaman /login dengan
--    Username: admin   Password: (sesuai yang dibuat)
