import { formatDistance } from "@/lib/geo";

/**
 * Menampilkan jarak lurus dari titik asal yang dipilih pengguna ke sebuah
 * lokasi wisata/UMKM.
 *
 * Catatan: badge ini SENGAJA hanya menampilkan jarak, tanpa perkiraan
 * waktu tempuh. Dulu ada estimasi durasi di sini yang dihitung kasar dari
 * jarak lurus (haversine) + asumsi kecepatan per moda — angkanya sering
 * tidak sama dengan hasil Analisis Multimoda yang menghitung waktu tempuh
 * dari rute nyata (API directions/routing), sehingga membingungkan
 * pengguna. Untuk waktu tempuh yang akurat, arahkan pengguna ke tab
 * Analisis Multimoda.
 */
export default function DistanceBadge({ distanceMeters }) {
  if (distanceMeters == null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-river/10 px-2.5 py-1 font-mono text-[11px] font-medium text-river">
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
        <path d="M10 2v16M2 10h16" strokeLinecap="round" />
      </svg>
      {formatDistance(distanceMeters)}
    </span>
  );
}
