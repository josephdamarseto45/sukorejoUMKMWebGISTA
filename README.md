# WebGIS UMKM & Wisata — Desa Wisata Sukorejo

Website WebGIS untuk Desa Wisata Sukorejo, Kecamatan Sambirejo, Kabupaten
Sragen, Jawa Tengah. Dibangun dengan **Next.js (App Router)**, **Tailwind
CSS**, **Leaflet/react-leaflet**, database **Supabase**, dan siap di-deploy
ke **Vercel**.

## Fitur

1. **Beranda** — deskripsi umum desa (lokasi & ciri khas) dan 3 kartu
   navigasi ke Peta WebGIS, Katalog Wisata, dan Katalog UMKM.
2. **Peta WebGIS** (`/webgis`) — peta interaktif dengan search bar & daftar
   lokasi di sisi kiri, serta panel **Analisis Isokron** (area jangkauan
   berdasarkan waktu tempuh) dan **Analisis Multimoda** (bandingkan
   jarak/waktu tempuh jalan kaki, sepeda, motor, mobil) di sisi kanan.
3. **Katalog Wisata & UMKM** (`/katalog/wisata`, `/katalog/umkm`) — kartu
   berisi deskripsi, telepon, lokasi, harga, dan jam buka, dengan tombol
   "Lihat di Peta WebGIS" yang membawa ke lokasi terkait di peta.

Selama tabel Supabase masih kosong, halaman tetap berjalan menggunakan data
contoh di `data/sampleData.js` (5 wisata + 6 UMKM) supaya tampilan langsung
bisa dicoba.

## 1. Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilai di dalamnya
npm run dev
```

Buka `http://localhost:3000`.

## 2. Menyiapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor** → jalankan isi file `supabase/schema.sql`. Ini akan
   membuat tabel `wisata` dan `umkm` beserta kebijakan Row Level Security
   (publik hanya bisa membaca / `SELECT`). Jalankan juga
   `supabase/migration_admin_policies.sql` (kebijakan insert/update/delete
   untuk admin login) dan `supabase/migration_storage_foto.sql` (bucket
   Storage `foto-lokasi` untuk foto yang diunggah lewat halaman admin).
3. Ambil **Project URL** dan **anon public key** dari
   **Project Settings → API**, lalu isi ke `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Tambah/ubah data lewat **Table Editor** Supabase, atau lewat SQL insert
   seperti contoh di `supabase/schema.sql`. Kolom penting per baris:

   | Kolom      | Keterangan                                   |
   |------------|-----------------------------------------------|
   | `nama`     | Nama tempat/usaha                              |
   | `kategori` | Kategori bebas, mis. "Wisata Alam", "Kuliner"  |
   | `deskripsi`| Deskripsi singkat                              |
   | `lat`,`lng`| Koordinat titik lokasi                         |
   | `telepon`  | Nomor kontak                                   |
   | `lokasi`   | Alamat/dusun                                   |
   | `harga`    | Teks bebas, mis. "Rp 5.000" atau "Gratis"      |
   | `jam_buka` | Teks bebas jam operasional                     |

   Insert/update/delete langsung dari browser (client) sengaja **tidak**
   diizinkan oleh RLS di atas — kelola data lewat dashboard Supabase, atau
   tambahkan form admin terpisah yang memakai *service role key* di sisi
   server bila diperlukan nanti.

## 3. Menyiapkan analisis isokron & multimoda (OpenRouteService)

Fitur isokron dan multimoda memanggil [OpenRouteService](https://openrouteservice.org/)
lewat dua API Route internal (`/api/isochrone` dan `/api/directions`) supaya
API key tidak terekspos ke browser.

1. Daftar akun gratis di https://openrouteservice.org/dev/#/signup.
2. Buat API key, lalu isi ke `.env.local` dan ke environment variable
   Vercel:

   ```
   ORS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
   ```

Tanpa `ORS_API_KEY`, kedua tombol analisis akan menampilkan pesan error
yang menjelaskan bahwa key belum diatur — bagian lain website tetap
berfungsi normal.

## 4. Deploy ke Vercel

**Lewat dashboard (disarankan):**

1. Push folder ini ke repository GitHub/GitLab/Bitbucket.
2. Buka [vercel.com/new](https://vercel.com/new) → import repository
   tersebut. Vercel otomatis mendeteksi framework Next.js.
3. Di step **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ORS_API_KEY`
4. Klik **Deploy**.

**Lewat Vercel CLI:**

```bash
npm i -g vercel
vercel login
vercel            # deploy preview
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ORS_API_KEY
vercel --prod     # deploy production
```

## Struktur proyek

```
app/
  page.js                  # Beranda
  webgis/page.js            # Halaman peta WebGIS
  katalog/wisata/page.js    # Katalog wisata
  katalog/umkm/page.js      # Katalog UMKM
  api/isochrone/route.js    # Proxy analisis isokron (ORS)
  api/directions/route.js   # Proxy analisis multimoda (ORS)
components/                 # Semua komponen UI (Navbar, MapView, dst.)
lib/
  supabaseClient.js         # Inisialisasi Supabase client
  data.js                   # Layer akses data (Supabase + fallback contoh)
  geo.js                    # Utilitas jarak/durasi (haversine)
data/sampleData.js          # Data contoh Desa Sukorejo
supabase/schema.sql         # Skema tabel + RLS + contoh data
```

## Catatan

- Data lokasi pada `data/sampleData.js` bersifat **contoh/perkiraan**.
  Ganti dengan koordinat asli lewat Supabase begitu tersedia.
- Ikon peta memakai marker HTML kustom (bukan sprite default Leaflet) agar
  kompatibel dengan proses build Next.js.
- Palet warna & tipografi mengikuti identitas visual "desa terasering":
  hijau hutan, emas panen, dan terracotta tanah liat.
