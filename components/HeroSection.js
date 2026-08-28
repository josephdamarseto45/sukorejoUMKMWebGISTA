export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-forest">
      <TerraceIllustration />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col px-5 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
          Kec. Sambirejo · Kab. Sragen · Jawa Tengah
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-paper sm:text-5xl md:text-6xl">
          Desa Wisata Sukorejo,
          <br />
          <span className="italic text-gold">berundak dari sawah ke usaha warga.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/75 md:text-lg">
          Dari puncak bukit ke embung desa, dari warung pecel ke sanggar
          batik — jelajahi ragam wisata dan UMKM Sukorejo lewat satu peta
          interaktif, lengkap dengan hitungan jarak dan waktu tempuh.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a
            href="/webgis"
            className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-gold-light"
          >
            Buka Peta WebGIS
          </a>
          <a
            href="#tentang-desa"
            className="rounded-full border border-paper/30 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-paper/10"
          >
            Kenali Desa Kami
          </a>
        </div>
      </div>
    </section>
  );
}

// Ilustrasi bukit & sawah terasering berlapis, elemen visual khas halaman ini.
function TerraceIllustration() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] w-full"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 220 L1440 160 L1440 400 L0 400 Z" fill="#243D31" />
      <path d="M0 270 L1440 230 L1440 400 L0 400 Z" fill="#1C2E24" />
      <path d="M0 320 L1440 300 L1440 400 L0 400 Z" fill="#162419" />
      {Array.from({ length: 7 }).map((_, i) => (
        <line
          key={i}
          x1="0"
          x2="1440"
          y1={230 + i * 22}
          y2={210 + i * 22}
          stroke="#C89B3C"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
