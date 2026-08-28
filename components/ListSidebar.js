import DistanceBadge from "@/components/DistanceBadge";

export default function ListSidebar({ items, selectedId, onSelect, distances }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-ink/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-ink/40">
        {items.length} lokasi ditemukan
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 min-h-[120px] items-center justify-center px-4 py-10 text-center text-sm text-ink/45">
          Tidak ada lokasi yang cocok dengan pencarian.
        </div>
      ) : (
        // min-h-0 penting di sini: tanpa itu, item flex ini tidak akan mengecil
        // mengikuti tinggi induknya (aside dengan tinggi tetap di desktop),
        // sehingga overflow-y-auto tidak pernah memicu scrollbar dan daftar
        // yang panjang jadi terpotong / tidak bisa discroll.
        <ul className="min-h-0 flex-1 divide-y divide-ink/8 overflow-y-auto">
          {items.map((item) => {
            const active = item.id === selectedId;
            const d = distances?.[item.id];
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item)}
                  className={`flex w-full flex-col items-start gap-1.5 px-4 py-3.5 text-left transition-colors ${
                    active ? "bg-forest/10" : "hover:bg-ink/5"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold text-ink line-clamp-1">
                      {item.nama}
                    </span>
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        item.jenis === "wisata" ? "bg-river" : "bg-clay"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-ink/50">{item.kategori}</span>
                  {d && <DistanceBadge distanceMeters={d.distance} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
