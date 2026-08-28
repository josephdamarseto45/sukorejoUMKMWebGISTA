import Link from "next/link";

// Kelas Tailwind harus statis (bukan diinterpolasi) agar tetap ikut di-scan
// oleh compiler, sehingga dipetakan lewat objek berikut.
const ACCENT = {
  wisata: {
    tile: "bg-river/10",
    text: "text-river",
    badge: "bg-river/10 text-river"
  },
  umkm: {
    tile: "bg-clay/10",
    text: "text-clay",
    badge: "bg-clay/10 text-clay"
  }
};

export default function CatalogCard({ item, onFocus, highlighted }) {
  const accent = ACCENT[item.jenis] || ACCENT.umkm;

  return (
    <div
      onClick={() => onFocus?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFocus?.(item);
        }
      }}
      aria-label={`Buka detail ${item.nama}`}
      className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white/50 transition-shadow hover:shadow-md ${
        highlighted
          ? "catalog-card-highlighted border-gold"
          : "border-ink/10"
      }`}
    >
      {item.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.foto_url}
          alt={item.nama}
          className="h-32 w-full shrink-0 object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        className={`flex h-32 shrink-0 items-center justify-center ${accent.tile} ${
          item.foto_url ? "hidden" : ""
        }`}
      >
        <span className={`font-display text-3xl font-semibold ${accent.text}`}>
          {item.nama
            .split(" ")
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Wrapper ini yang mengambil sisa ruang (flex-1), sehingga tombol
            di bawahnya selalu rata bawah antar-kartu, TAPI jarak minimum ke
            tombol tetap terjaga lewat mt-6 pada tombol (lihat di bawah). */}
        <div className="flex-1">
          <span
            className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${accent.badge}`}
          >
            {item.kategori}
          </span>
          <h3 className="mt-2.5 line-clamp-2 font-display text-lg font-semibold text-forest">
            {item.nama}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink/65">
            {item.deskripsi}
          </p>

          <dl className="mt-4 space-y-2 border-t border-ink/8 pt-4 text-xs text-ink/70">
            <Row icon={<PinIcon />} text={item.lokasi} />
            <Row icon={<PhoneIcon />} text={item.telepon} />
            <Row icon={<TagIcon />} text={item.harga} />
            <Row icon={<ClockIcon />} text={item.jam_buka} />
          </dl>
        </div>

        <Link
          href={`/webgis?id=${item.id}`}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 mt-6 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-forest-light"
        >
          Lihat di Peta WebGIS
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function Row({ icon, text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-ink/40">{icon}</span>
      <span className="line-clamp-1 break-words">{text}</span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
      <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
      <path d="M4 4l3 1 1 3-2 2c1 2.5 2.5 4 5 5l2-2 3 1 1 3c-6 2-13-5-13-13z" strokeLinejoin="round" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
      <path d="M10 3h5a2 2 0 012 2v5l-8 8-7-7z" strokeLinejoin="round" />
      <circle cx="13.5" cy="6.5" r="1" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  );
}
