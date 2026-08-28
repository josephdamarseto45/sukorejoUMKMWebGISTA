-- =========================================================
-- Migrasi: Dukungan multi-foto (1-4 foto) untuk Wisata & UMKM
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query)
-- Aman dijalankan berulang kali.
-- =========================================================

-- Kolom baru `foto_urls` menyimpan array URL foto (maksimal 4).
-- Kolom lama `foto_url` TETAP dipertahankan dan otomatis diisi dengan
-- foto pertama (cover) dari `foto_urls`, supaya bagian aplikasi yang
-- masih menampilkan satu foto saja (kartu katalog, popup peta) tidak
-- perlu diubah.
alter table public.wisata add column if not exists foto_urls text[] not null default '{}';
alter table public.umkm add column if not exists foto_urls text[] not null default '{}';

-- Backfill: pindahkan foto_url yang sudah ada ke foto_urls, khusus baris
-- yang foto_urls-nya masih kosong.
update public.wisata
set foto_urls = array[foto_url]
where foto_url is not null and (foto_urls is null or array_length(foto_urls, 1) is null);

update public.umkm
set foto_urls = array[foto_url]
where foto_url is not null and (foto_urls is null or array_length(foto_urls, 1) is null);

-- Batasi maksimal 4 foto per lokasi langsung di level database.
alter table public.wisata drop constraint if exists wisata_foto_urls_max4;
alter table public.wisata add constraint wisata_foto_urls_max4 check (array_length(foto_urls, 1) is null or array_length(foto_urls, 1) <= 4);

alter table public.umkm drop constraint if exists umkm_foto_urls_max4;
alter table public.umkm add constraint umkm_foto_urls_max4 check (array_length(foto_urls, 1) is null or array_length(foto_urls, 1) <= 4);

-- Jaga `foto_url` (kolom lama/cover) tetap sinkron otomatis dengan foto
-- pertama di `foto_urls`, baik saat insert maupun update dari mana pun
-- (termasuk lewat Supabase Table Editor secara manual).
create or replace function public.sync_foto_url_cover()
returns trigger as $$
begin
  new.foto_url := case
    when new.foto_urls is not null and array_length(new.foto_urls, 1) > 0
      then new.foto_urls[1]
    else null
  end;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_wisata_sync_foto_url on public.wisata;
create trigger trg_wisata_sync_foto_url
  before insert or update on public.wisata
  for each row execute function public.sync_foto_url_cover();

drop trigger if exists trg_umkm_sync_foto_url on public.umkm;
create trigger trg_umkm_sync_foto_url
  before insert or update on public.umkm
  for each row execute function public.sync_foto_url_cover();
