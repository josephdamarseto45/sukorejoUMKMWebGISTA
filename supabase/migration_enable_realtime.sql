-- =========================================================
-- Migrasi: aktifkan Supabase Realtime untuk tabel wisata & umkm
-- Aman dijalankan berulang kali.
-- =========================================================
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
