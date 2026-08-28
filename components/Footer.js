import ContourDivider from "@/components/ContourDivider";

export default function Footer() {
  return (
    <footer className="bg-forest text-paper/90">
      <ContourDivider flip tone="dark" />
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold text-gold">
              Desa Wisata Sukorejo
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/70">
              Kec. Sambirejo, Kab. Sragen, Jawa Tengah — perbukitan
              teraseringnya lebih tinggi dari harapan siapa pun yang belum
              pernah datang.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">
              Jelajahi
            </p>
            <ul className="mt-3 space-y-2 text-sm text-paper/80">
              <li><a href="/webgis" className="hover:text-gold">Peta WebGIS</a></li>
              <li><a href="/katalog/wisata" className="hover:text-gold">Katalog Wisata</a></li>
              <li><a href="/katalog/umkm" className="hover:text-gold">Katalog UMKM</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">
              Kontak Desa
            </p>
            <ul className="mt-3 space-y-2 text-sm text-paper/80">
              <li>Kantor Desa Sukorejo, Sambirejo, Sragen</li>
              <li>0823-2424-7384</li>
              <li>desasukorejo09@gmail.com</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 flex flex-wrap items-center justify-between gap-2 text-xs text-paper/40">
          <span>
            © {new Date().getFullYear()} Pemerintah Desa Sukorejo. Data lokasi
            dikelola oleh perangkat desa melalui panel admin.
          </span>
          <a href="/login" className="text-paper/40 hover:text-gold hover:underline">
            Login Perangkat Desa
          </a>
        </p>
      </div>
    </footer>
  );
}
