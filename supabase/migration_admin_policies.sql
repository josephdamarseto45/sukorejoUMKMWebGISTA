-- =========================================================
-- Migrasi: tambah kebijakan RLS untuk insert/update/delete
-- Aman dijalankan berulang kali (drop dulu kalau sudah ada).
-- =========================================================

drop policy if exists "Wisata dapat ditambah oleh admin login" on public.wisata;
drop policy if exists "Wisata dapat diubah oleh admin login" on public.wisata;
drop policy if exists "Wisata dapat dihapus oleh admin login" on public.wisata;
drop policy if exists "UMKM dapat ditambah oleh admin login" on public.umkm;
drop policy if exists "UMKM dapat diubah oleh admin login" on public.umkm;
drop policy if exists "UMKM dapat dihapus oleh admin login" on public.umkm;

create policy "Wisata dapat ditambah oleh admin login"
  on public.wisata for insert
  to authenticated
  with check (true);

create policy "Wisata dapat diubah oleh admin login"
  on public.wisata for update
  to authenticated
  using (true)
  with check (true);

create policy "Wisata dapat dihapus oleh admin login"
  on public.wisata for delete
  to authenticated
  using (true);

create policy "UMKM dapat ditambah oleh admin login"
  on public.umkm for insert
  to authenticated
  with check (true);

create policy "UMKM dapat diubah oleh admin login"
  on public.umkm for update
  to authenticated
  using (true)
  with check (true);

create policy "UMKM dapat dihapus oleh admin login"
  on public.umkm for delete
  to authenticated
  using (true);
