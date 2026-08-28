"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CatalogCard from "@/components/CatalogCard";
import CatalogFocusModal from "@/components/CatalogFocusModal";
import { useLiveLocations } from "@/lib/useLiveLocations";

export default function CatalogGrid({ items: initialItems, jenis }) {
  // Data selalu diambil ulang langsung dari Supabase begitu halaman katalog
  // dibuka di browser (dan disinkronkan otomatis lewat Realtime), supaya
  // data yang baru ditambah/diubah/dihapus lewat panel admin langsung
  // tampil di sini tanpa tergantung cache halaman.
  const { items: liveItems } = useLiveLocations(initialItems, jenis);

  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState("Semua");

  // Card yang sedang dibuka fokusnya (modal detail).
  const [focusedItem, setFocusedItem] = useState(null);
  // ID card yang baru saja discroll-ke lewat tautan langsung (?id=...),
  // dipakai untuk memberi denyut sorotan singkat pada card tersebut.
  const [highlightId, setHighlightId] = useState(null);
  const cardRefs = useRef({});
  const deepLinkHandledRef = useRef(false);

  const kategoriList = useMemo(
    () => ["Semua", ...new Set(liveItems.map((i) => i.kategori))],
    [liveItems]
  );

  const filtered = useMemo(() => {
    return liveItems
      .map((i) => ({ ...i, jenis }))
      .filter((i) => kategori === "Semua" || i.kategori === kategori)
      .filter(
        (i) =>
          !query.trim() ||
          i.nama.toLowerCase().includes(query.toLowerCase()) ||
          i.deskripsi?.toLowerCase().includes(query.toLowerCase())
      );
  }, [liveItems, jenis, kategori, query]);

  // Jika halaman katalog dibuka lewat tautan langsung berisi ?id=... (mis.
  // dibagikan dari peta atau hasil pencarian lain), lepas dulu filter yang
  // aktif supaya card tersebut pasti terlihat, lalu scroll & fokuskan ke
  // situ begitu data & DOM-nya siap.
  useEffect(() => {
    if (deepLinkHandledRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id");
    if (!targetId) return;

    const exists = liveItems.some((i) => String(i.id) === String(targetId));
    if (!exists) return;

    deepLinkHandledRef.current = true;
    setQuery("");
    setKategori("Semua");

    // Tunggu satu frame render supaya grid yang tidak lagi difilter sudah
    // ter-render dan ref card tersedia sebelum discroll.
    requestAnimationFrame(() => {
      const el = cardRefs.current[targetId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setHighlightId(targetId);
      setTimeout(() => setHighlightId(null), 2400);
    });
  }, [liveItems]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M17 17l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau deskripsi..."
            className="w-full rounded-full border border-ink/15 bg-white/70 py-2.5 pl-9 pr-4 text-sm placeholder:text-ink/40 focus:border-forest focus:outline-none"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            aria-label="Filter kategori"
            className="w-full appearance-none rounded-full border border-ink/15 bg-white/70 py-2.5 pl-4 pr-9 text-sm font-semibold text-forest focus:border-forest focus:outline-none"
          >
            {kategoriList.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
          >
            <path d="M5.5 8l4.5 4.5L14.5 8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                cardRefs.current[item.id] = el;
              }}
              className="h-full"
            >
              <CatalogCard
                item={item}
                onFocus={setFocusedItem}
                highlighted={String(item.id) === String(highlightId)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-16 text-center text-sm text-ink/45">
          Tidak ada hasil yang cocok dengan pencarian.
        </p>
      )}

      <CatalogFocusModal item={focusedItem} onClose={() => setFocusedItem(null)} />
    </div>
  );
}
