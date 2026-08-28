import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import ContourDivider from "@/components/ContourDivider";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ContourDivider />

      {/* ---------- Deskripsi umum desa ---------- */}
      <section id="tentang-desa" className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-clay">
              Tentang Desa
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-forest">
              Sukorejo, Sambirejo, Sragen
            </h2>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white/50 p-8 md:col-span-3">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Lokasi
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  Desa Sukorejo terletak di kaki perbukitan Kecamatan
                  Sambirejo, sekitar 25 km timur laut pusat Kabupaten
                  Sragen, Jawa Tengah.
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Ciri Khas
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  Sawah berundak (terasering), bukit-bukit kapur dengan
                  spot pandang, embung desa, serta kerajinan bambu dan
                  batik tulis warisan turun-temurun.
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                  Kondisi Desa Wisata
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  Ditetapkan sebagai desa wisata rintisan, Sukorejo
                  mengandalkan gotong royong warga dalam mengelola
                  destinasi alam, budaya, dan menumbuhkan UMKM lokal
                  sebagai penopang ekonomi wisatawan yang berkunjung.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <ContourDivider />

      {/* ---------- 3 kartu navigasi utama ---------- */}
      <section className="bg-forest/[0.04] py-16">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-clay">
            Jelajahi Sukorejo
          </p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold text-forest">
            Tiga pintu masuk untuk mengenal desa kami
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard
              href="/webgis"
              eyebrow="Halaman Peta"
              title="Peta WebGIS"
              description="Lihat sebaran titik wisata & UMKM di peta interaktif, lengkap dengan analisis isokron dan multimoda."
              icon={<MapIcon />}
            />
            <FeatureCard
              href="/katalog/wisata"
              eyebrow="Katalog"
              title="Katalog Wisata"
              description="Jelajahi destinasi wisata alam, air, dan budaya Sukorejo lengkap dengan harga dan jam buka."
              icon={<MountainIcon />}
            />
            <FeatureCard
              href="/katalog/umkm"
              eyebrow="Katalog"
              title="Katalog UMKM"
              description="Temukan kuliner, kerajinan, dan oleh-oleh khas warga Sukorejo untuk dikunjungi langsung."
              icon={<StoreIcon />}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" strokeLinejoin="round" />
      <path d="M9 4v14M15 6v14" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path d="M3 20l6-11 4 6 2-3 6 8H3z" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="17" cy="6" r="2" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
      <path d="M4 9l1-5h14l1 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9v10h14V9" strokeLinecap="round" />
      <path d="M9 19v-6h6v6" strokeLinecap="round" />
    </svg>
  );
}
