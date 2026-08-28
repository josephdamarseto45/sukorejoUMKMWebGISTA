// Data contoh untuk Desa Wisata Sukorejo, Kec. Sambirejo, Kab. Sragen, Jawa Tengah.
// Titik koordinat bersifat perkiraan (dummy) — ganti dengan data asli via Supabase
// begitu tabel `wisata` dan `umkm` sudah diisi (lihat supabase/schema.sql).

export const VILLAGE_CENTER = [-7.3565, 111.0485];

export const sampleWisata = [
  {
    id: "w1",
    nama: "Puncak Ndeso Kemuning",
    kategori: "Wisata Alam",
    deskripsi:
      "Spot ketinggian dengan gardu pandang bambu, menyajikan panorama perbukitan Sambirejo dan hamparan sawah berundak khas Sukorejo.",
    lat: -7.3521,
    lng: 111.0512,
    telepon: "0812-2345-6701",
    lokasi: "Dusun Kemuning, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 5.000 / orang",
    jam_buka: "06.00 - 18.00 WIB",
    foto_url: null
  },
  {
    id: "w2",
    nama: "Bukit Cumbleng",
    kategori: "Wisata Alam",
    deskripsi:
      "Bukit kapur dengan jalur trekking ringan dan area kemah, favorit untuk melihat matahari terbit di atas kabut lembah.",
    lat: -7.3602,
    lng: 111.0456,
    telepon: "0813-2345-6702",
    lokasi: "Dusun Cumbleng, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 10.000 / orang",
    jam_buka: "05.00 - 17.30 WIB",
    foto_url: null
  },
  {
    id: "w3",
    nama: "Embung Sukorejo",
    kategori: "Wisata Air",
    deskripsi:
      "Embung penampung air hujan yang jadi wahana rekreasi keluarga: perahu kayuh, spot foto, dan area duduk di tepi embung.",
    lat: -7.3548,
    lng: 111.0439,
    telepon: "0812-2345-6703",
    lokasi: "Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 5.000 / orang, sewa perahu Rp 15.000",
    jam_buka: "07.00 - 17.00 WIB",
    foto_url: null
  },
  {
    id: "w4",
    nama: "Rumah Joglo Budaya Sukorejo",
    kategori: "Wisata Budaya",
    deskripsi:
      "Joglo tua yang dipakai untuk pentas tari tradisional, gamelan, dan workshop membatik bagi pengunjung rombongan.",
    lat: -7.3579,
    lng: 111.0501,
    telepon: "0813-2345-6704",
    lokasi: "Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Gratis (donasi), paket workshop Rp 35.000",
    jam_buka: "08.00 - 16.00 WIB (Sel-Ming)",
    foto_url: null
  },
  {
    id: "w5",
    nama: "Jalur Susur Sawah Terasering",
    kategori: "Wisata Alam",
    deskripsi:
      "Jalur pematang sawah berundak sepanjang 1,5 km, cocok untuk jalan santai dan fotografi golden hour.",
    lat: -7.3495,
    lng: 111.0468,
    telepon: "0812-2345-6705",
    lokasi: "Dusun Ngrampal, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 3.000 / orang",
    jam_buka: "06.00 - 17.00 WIB",
    foto_url: null
  }
];

export const sampleUmkm = [
  {
    id: "u1",
    nama: "Warung Pecel Mbok Jum",
    kategori: "Kuliner",
    deskripsi:
      "Pecel sayur khas Sragen dengan sambal kacang gurih pedas, disajikan bersama rempeyek buatan sendiri.",
    lat: -7.3559,
    lng: 111.0475,
    telepon: "0812-3456-7801",
    lokasi: "Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 10.000 - Rp 15.000",
    jam_buka: "06.00 - 14.00 WIB",
    foto_url: null
  },
  {
    id: "u2",
    nama: "Kerajinan Bambu Pak Sardi",
    kategori: "Kerajinan",
    deskripsi:
      "Produsen anyaman bambu: tampah, besek, dan suvenir gantungan kunci khas desa wisata, bisa custom motif.",
    lat: -7.3538,
    lng: 111.0498,
    telepon: "0813-3456-7802",
    lokasi: "Dusun Kemuning, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 5.000 - Rp 75.000",
    jam_buka: "08.00 - 16.00 WIB",
    foto_url: null
  },
  {
    id: "u3",
    nama: "Kopi Lereng Sukorejo",
    kategori: "Kuliner",
    deskripsi:
      "Kedai kopi robusta lokal hasil kebun warga, disangrai manual, dengan teras memandang lembah.",
    lat: -7.3592,
    lng: 111.0472,
    telepon: "0812-3456-7803",
    lokasi: "Dusun Cumbleng, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 8.000 - Rp 20.000",
    jam_buka: "09.00 - 21.00 WIB",
    foto_url: null
  },
  {
    id: "u4",
    nama: "Batik Tulis Sukorejo Asri",
    kategori: "Kerajinan",
    deskripsi:
      "Sanggar batik tulis dengan motif khas terasering dan flora lokal, menerima pesanan kain & workshop.",
    lat: -7.3573,
    lng: 111.0509,
    telepon: "0813-3456-7804",
    lokasi: "Dusun Krajan, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 75.000 - Rp 350.000",
    jam_buka: "08.00 - 17.00 WIB (Sen-Sab)",
    foto_url: null
  },
  {
    id: "u5",
    nama: "Keripik Tempe Bu Sri",
    kategori: "Oleh-oleh",
    deskripsi:
      "Keripik tempe renyah dengan varian original, pedas, dan balado, dikemas untuk oleh-oleh wisatawan.",
    lat: -7.3512,
    lng: 111.0451,
    telepon: "0812-3456-7805",
    lokasi: "Dusun Ngrampal, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 12.000 / bungkus",
    jam_buka: "07.00 - 16.00 WIB",
    foto_url: null
  },
  {
    id: "u6",
    nama: "Homestay Griya Terasering",
    kategori: "Jasa & Penginapan",
    deskripsi:
      "Homestay keluarga dengan 3 kamar menghadap sawah berundak, termasuk sarapan menu rumahan.",
    lat: -7.3487,
    lng: 111.0483,
    telepon: "0813-3456-7806",
    lokasi: "Dusun Ngrampal, Desa Sukorejo, Sambirejo, Sragen",
    harga: "Rp 150.000 / malam",
    jam_buka: "Check-in 12.00 - Check-out 11.00",
    foto_url: null
  }
];
