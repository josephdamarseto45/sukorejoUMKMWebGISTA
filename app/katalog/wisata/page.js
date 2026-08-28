import { getWisata } from "@/lib/data";
import CatalogGrid from "@/components/CatalogGrid";
import ContourDivider from "@/components/ContourDivider";

// Data wisata dikelola lewat panel admin dan bisa berubah kapan saja, jadi
// halaman ini dirender ulang di setiap request (tidak di-cache statis)
// supaya penambahan/penghapusan data langsung terlihat.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Katalog Wisata | Desa Wisata Sukorejo"
};

export default async function KatalogWisataPage() {
  const wisata = await getWisata();

  return (
    <div>
      <section className="bg-forest px-5 py-14 text-paper md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            Katalog
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            Wisata Desa Sukorejo
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-paper/70">
            Dari punggung bukit hingga sentra durian — setiap destinasi
            terhubung langsung ke Peta WebGIS untuk melihat rute dan
            estimasi waktu tempuh.
          </p>
        </div>
      </section>
      <ContourDivider />

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <CatalogGrid items={wisata} jenis="wisata" />
      </section>
    </div>
  );
}
