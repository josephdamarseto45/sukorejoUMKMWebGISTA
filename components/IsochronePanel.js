"use client";

import { useState } from "react";

const MODE_OPTIONS = [
  { id: "walking", label: "Jalan Kaki", icon: "🚶" },
  { id: "cycling", label: "Sepeda", icon: "🚴" },
  { id: "motorcycle", label: "Motor", icon: "🏍️" },
  { id: "car", label: "Mobil", icon: "🚗" }
];

const RANGE_OPTIONS = [
  { seconds: 300, label: "5 mnt" },
  { seconds: 600, label: "10 mnt" },
  { seconds: 900, label: "15 mnt" },
  { seconds: 1800, label: "30 mnt" }
];

export default function IsochronePanel({
  origin,
  pickingOrigin,
  onTogglePicking,
  onUseMyLocation,
  originError,
  destination,
  isoMode,
  onIsoModeChange,
  isoRanges,
  onToggleRange,
  onRunIsochrone,
  isoLoading,
  isoError,
  multiModes,
  onToggleMultiMode,
  onRunMultimoda,
  multiLoading,
  multiError,
  multiResults
}) {
  const [tab, setTab] = useState("isokron");

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/90 shadow-lg backdrop-blur lg:h-full">
      <div className="flex shrink-0 border-b border-ink/10">
        <TabButton active={tab === "isokron"} onClick={() => setTab("isokron")}>
          Wilayah Terjangkau
        </TabButton>
        <TabButton active={tab === "multimoda"} onClick={() => setTab("multimoda")}>
          Bandingkan Transportasi
        </TabButton>
      </div>

      {/* Scroll internal (overflow-y-auto + min-h-0) hanya dipaksa di layar
          desktop (lg:), tempat panel ini memang dikunci setinggi sisa layar
          oleh WebGISClient. Di mobile TIDAK diberi h-full/overflow-y-auto
          supaya panel bebas tumbuh mengikuti kontennya (mis. hasil
          perbandingan multimoda / legenda isokron yang baru muncul setelah
          analisis dijalankan) dan seluruh halaman tetap bisa discroll
          secara normal alih-alih kontennya malah terpotong (overflow-hidden
          pada wrapper) sementara area scroll internalnya sendiri tidak
          punya tinggi untuk discroll. Ini penyebab bug "halaman tidak bisa
          discroll setelah analisis dijalankan" di layar kecil. */}
      <div className="flex-1 p-4 lg:min-h-0 lg:overflow-y-auto">
        {/* ---------- Titik asal (dipakai kedua tab) ---------- */}
        <div className="mb-4 rounded-xl bg-forest/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
            Titik Asal
          </p>
          {origin ? (
            <p className="mt-1 font-mono text-xs text-ink/70">
              {origin.lat.toFixed(5)}, {origin.lng.toFixed(5)}
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink/50">Belum dipilih</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              onClick={onTogglePicking}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                pickingOrigin
                  ? "bg-gold text-ink"
                  : "bg-forest text-paper hover:bg-forest-light"
              }`}
            >
              {pickingOrigin ? "Klik peta untuk set titik..." : "Pilih titik di peta"}
            </button>
            <button
              onClick={onUseMyLocation}
              className="rounded-full border border-forest/30 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/10"
            >
              Gunakan lokasi saya
            </button>
          </div>
          {originError && (
            <p className="mt-2.5 rounded-lg bg-clay/10 p-2.5 text-xs text-clay">
              {originError}
            </p>
          )}
        </div>

        {tab === "isokron" ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                Seberapa jauh saya bisa pergi dari titik asal?
              </p>
              <p className="mt-0.5 text-[11px] text-ink/45">
                Istilah teknisnya: Analisis Isokron
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
                Moda Transportasi
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {MODE_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onIsoModeChange(m.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                      isoMode === m.id
                        ? "border-forest bg-forest text-paper"
                        : "border-ink/15 text-ink/70 hover:border-forest/40"
                    }`}
                  >
                    <span>{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
                Cakupan Waktu Tempuh
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RANGE_OPTIONS.map((r) => (
                  <button
                    key={r.seconds}
                    onClick={() => onToggleRange(r.seconds)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isoRanges.includes(r.seconds)
                        ? "border-river bg-river text-paper"
                        : "border-ink/15 text-ink/70 hover:border-river/40"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink/45">
                Peta akan menampilkan area yang bisa dijangkau dari titik asal
                dalam rentang waktu yang dipilih — semakin gelap warna,
                semakin dekat waktu tempuhnya.
              </p>
            </div>

            <button
              onClick={onRunIsochrone}
              disabled={!origin || isoLoading}
              className="w-full rounded-full bg-clay px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-clay-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isoLoading ? "Menghitung wilayah terjangkau..." : "Tampilkan Wilayah Terjangkau"}
            </button>

            {isoError && (
              <p className="rounded-lg bg-clay/10 p-2.5 text-xs text-clay">
                {isoError}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <LegendSwatch color="#8B4A2B" opacity={0.55} label="Terdekat" />
              <LegendSwatch color="#8B4A2B" opacity={0.3} label="Sedang" />
              <LegendSwatch color="#8B4A2B" opacity={0.12} label="Terjauh" />
            </div>

            <p className="rounded-lg bg-ink/5 p-2.5 text-[11px] leading-relaxed text-ink/50">
              Catatan: batas wilayah pada peta ini adalah estimasi. Untuk
              waktu tempuh yang presisi ke satu lokasi tertentu, gunakan tab
              &ldquo;Bandingkan Transportasi&rdquo;.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                Naik apa paling cepat ke tujuan ini?
              </p>
              <p className="mt-0.5 text-[11px] text-ink/45">
                Istilah teknisnya: Analisis Multimoda
              </p>
            </div>

            <div className="rounded-xl bg-forest/5 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
                Tujuan
              </p>
              <p className="mt-1 text-xs text-ink/70">
                {destination
                  ? destination.nama
                  : "Pilih lokasi wisata/UMKM dari daftar di sebelah kiri"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink/45">
                Bandingkan Moda
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {MODE_OPTIONS.map((m) => (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                      multiModes.includes(m.id)
                        ? "border-forest bg-forest text-paper"
                        : "border-ink/15 text-ink/70 hover:border-forest/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={multiModes.includes(m.id)}
                      onChange={() => onToggleMultiMode(m.id)}
                    />
                    <span>{m.icon}</span>
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={onRunMultimoda}
              disabled={!origin || !destination || multiLoading}
              className="w-full rounded-full bg-river px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-river-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              {multiLoading ? "Menghitung waktu tempuh..." : "Bandingkan Waktu Tempuh"}
            </button>

            {multiError && (
              <p className="rounded-lg bg-clay/10 p-2.5 text-xs text-clay">
                {multiError}
              </p>
            )}

            {multiResults?.length > 0 && (
              <ul className="space-y-2">
                {multiResults.map((r) => (
                  <li
                    key={r.mode}
                    className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2 text-xs"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-ink/80">
                      {MODE_OPTIONS.find((m) => m.id === r.mode)?.icon}
                      {MODE_OPTIONS.find((m) => m.id === r.mode)?.label}
                    </span>
                    {r.error ? (
                      <span className="text-clay">Gagal dihitung</span>
                    ) : (
                      <span className="font-mono text-river">
                        {(r.distance / 1000).toFixed(1)} km ·{" "}
                        {Math.round(r.duration / 60)} mnt
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
        active
          ? "border-b-2 border-clay text-clay"
          : "text-ink/40 hover:text-ink/70"
      }`}
    >
      {children}
    </button>
  );
}

function LegendSwatch({ color, opacity, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-sm"
        style={{ backgroundColor: color, opacity }}
      />
      <span className="text-[11px] text-ink/55">{label}</span>
    </div>
  );
}
