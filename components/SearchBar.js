export default function SearchBar({
  value,
  onChange,
  filter,
  onFilterChange,
  category,
  onCategoryChange,
  categoryOptions,
  placeholder
}) {
  // Kategori yang relevan untuk ditampilkan di dropdown, mengikuti jenis
  // yang sedang aktif (Semua -> tampilkan kedua grup dengan optgroup).
  const showWisata = filter === "semua" || filter === "wisata";
  const showUmkm = filter === "semua" || filter === "umkm";

  return (
    <div className="space-y-2.5">
      <div className="relative">
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
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Cari nama wisata atau UMKM..."}
          className="w-full rounded-full border border-ink/15 bg-white/70 py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-forest focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "semua", label: "Semua" },
          { id: "wisata", label: "Wisata" },
          { id: "umkm", label: "UMKM" }
        ].map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFilterChange(opt.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === opt.id
                ? "bg-forest text-paper"
                : "bg-forest/10 text-forest hover:bg-forest/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Dropdown filter kategori, mis. "Wisata Alam", "Kuliner", "Kerajinan" dst. */}
      {categoryOptions && (categoryOptions.wisata.length > 0 || categoryOptions.umkm.length > 0) && (
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full appearance-none rounded-full border border-ink/15 bg-white/70 py-2 pl-3.5 pr-9 text-xs font-medium text-ink focus:border-forest focus:outline-none"
          >
            <option value="semua">Semua Kategori</option>
            {showWisata && categoryOptions.wisata.length > 0 && (
              <optgroup label="Wisata">
                {categoryOptions.wisata.map((k) => (
                  <option key={`w-${k}`} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
            )}
            {showUmkm && categoryOptions.umkm.length > 0 && (
              <optgroup label="UMKM">
                {categoryOptions.umkm.map((k) => (
                  <option key={`u-${k}`} value={k}>
                    {k}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40"
          >
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}
