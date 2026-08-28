-- =========================================================
-- Migrasi: Storage bucket untuk foto UMKM/Wisata
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query)
-- Aman dijalankan berulang kali.
-- =========================================================

-- Bucket publik (foto boleh dilihat siapa saja tanpa login), tapi hanya
-- bisa diunggah/diubah/dihapus oleh admin yang sudah login (lihat
-- kebijakan storage.objects di bawah).
insert into storage.buckets (id, name, public)
values ('foto-lokasi', 'foto-lokasi', true)
on conflict (id) do update set public = true;

-- Publik hanya boleh membaca (SELECT) file di bucket ini.
drop policy if exists "Foto lokasi dapat dibaca publik" on storage.objects;
create policy "Foto lokasi dapat dibaca publik"
  on storage.objects for select
  using (bucket_id = 'foto-lokasi');

-- Upload (INSERT) hanya oleh pengguna yang sudah login (perangkat desa
-- lewat halaman /admin).
drop policy if exists "Foto lokasi dapat diunggah oleh admin login" on storage.objects;
create policy "Foto lokasi dapat diunggah oleh admin login"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'foto-lokasi');

-- Update (mis. replace/overwrite) hanya oleh admin login.
drop policy if exists "Foto lokasi dapat diubah oleh admin login" on storage.objects;
create policy "Foto lokasi dapat diubah oleh admin login"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'foto-lokasi')
  with check (bucket_id = 'foto-lokasi');

-- Hapus foto (mis. saat ganti foto atau hapus data lokasi) hanya oleh
-- admin login.
drop policy if exists "Foto lokasi dapat dihapus oleh admin login" on storage.objects;
create policy "Foto lokasi dapat dihapus oleh admin login"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'foto-lokasi');
