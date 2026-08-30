"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import SearchBar from "@/components/SearchBar";
import ListSidebar from "@/components/ListSidebar";
import IsochronePanel from "@/components/IsochronePanel";
import CatalogFocusModal from "@/components/CatalogFocusModal";
import { haversineDistance, isPointInBoundary } from "@/lib/geo";
import { villageBoundary } from "@/data/villageBoundary";
import { useLiveLocations } from "@/lib/useLiveLocations";

// Leaflet butuh `window`, jadi peta hanya dirender di client (ssr: false).
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-forest/5 text-sm text-ink/40">
      Memuat peta...
    </div>
  )
});

const ROUTE_COLORS = {
  walking: "#3E6E64",
  cycling: "#C89B3C",
  motorcycle: "#8B4A2B",
  car: "#2F4A3C"
};

export default function WebGISClient({ locations: initialLocations, initialSelectedId }) {
  // Data selalu diambil ulang langsung dari Supabase begitu peta dibuka di
  // browser (dan disinkronkan otomatis lewat Realtime), supaya data yang
  // baru ditambah/diubah/dihapus lewat panel admin langsung tampil di sini
  // tanpa tergantung cache halaman.
  const { items: locations } = useLiveLocations(initialLocations, "all");

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("semua");
  const [category, setCategory] = useState("semua");
  const [selected, setSelected] = useState(
    () => locations.find((l) => l.id === initialSelectedId) || null
  );
  // Dinaikkan setiap kali lokasi dipilih lewat daftar sisi kiri (bukan
  // klik marker langsung di peta) — dipakai sebagai "penanda" agar peta
  // selalu membuka popup lokasi itu setiap kali diklik dari daftar, bahkan
  // kalau lokasi yang sama diklik dua kali berturut-turut (mis. setelah
  // popup-nya sempat ditutup manual). Kalau hanya mengandalkan id lokasi
  // saja, klik ulang pada lokasi yang sudah aktif tidak akan mengubah
  // apa pun sehingga popup tidak akan terbuka lagi.
  const [listFocusToken, setListFocusToken] = useState(0);
  // Lokasi yang sedang dibuka detail lengkapnya (modal deskripsi penuh,
  // dipicu tombol "Baca selengkapnya" di popup marker peta) — pakai modal
  // yang sama dengan halaman katalog supaya tampilannya konsisten.
  const [detailItem, setDetailItem] = useState(null);

  // Jika halaman diakses dari kartu katalog (?id=...), fokuskan peta &
  // panel multimoda ke lokasi tersebut begitu data siap.
  useEffect(() => {
    if (initialSelectedId) {
      const match = locations.find((l) => l.id === initialSelectedId);
      if (match) setSelected(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectedId]);

  const [origin, setOrigin] = useState(null);
  const [pickingOrigin, setPickingOrigin] = useState(false);
  const [originError, setOriginError] = useState(null);

  const [isoMode, setIsoMode] = useState("walking");
  const [isoRanges, setIsoRanges] = useState([300, 600, 900]);
  const [isochroneGeoJSON, setIsochroneGeoJSON] = useState(null);
  const [isoLoading, setIsoLoading] = useState(false);
  const [isoError, setIsoError] = useState(null);
  const isoRequestIdRef = useRef(0);

  const [multiModes, setMultiModes] = useState(["walking", "motorcycle"]);
  const [multiResults, setMultiResults] = useState([]);
  const [multiLoading, setMultiLoading] = useState(false);
  const [multiError, setMultiError] = useState(null);
  const multiRequestIdRef = useRef(0);
  // Menandai bahwa pengguna sudah pernah menjalankan perbandingan rute
  // multimoda setidaknya sekali — dipakai untuk memutuskan apakah rute
  // harus dihitung ulang secara otomatis saat titik tujuan berganti.
  const hasComparedRef = useRef(false);

  // ---------- Dropdown kategori (Wisata / UMKM) ----------
  // Dikelompokkan berdasarkan jenis supaya dropdown bisa menampilkan
  // <optgroup> "Wisata" dan "UMKM" secara terpisah.
  const categoryOptions = useMemo(() => {
    const wisataCats = new Set();
    const umkmCats = new Set();
    for (const loc of locations) {
      if (!loc.kategori) continue;
      if (loc.jenis === "wisata") wisataCats.add(loc.kategori);
      else umkmCats.add(loc.kategori);
    }
    return {
      wisata: Array.from(wisataCats).sort(),
      umkm: Array.from(umkmCats).sort()
    };
  }, [locations]);

  // Mengganti jenis (Semua/Wisata/UMKM) mereset kategori terpilih supaya
  // pengguna tidak terjebak di kombinasi filter yang menghasilkan daftar
  // kosong (mis. filter=Wisata tapi kategori="Kuliner").
  const handleFilterChange = useCallback((value) => {
    setFilter(value);
    setCategory("semua");
  }, []);

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      const matchesFilter = filter === "semua" || loc.jenis === filter;
      const matchesCategory = category === "semua" || loc.kategori === category;
      const matchesQuery =
        !query.trim() ||
        loc.nama.toLowerCase().includes(query.toLowerCase()) ||
        loc.kategori.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesCategory && matchesQuery;
    });
  }, [locations, filter, category, query]);

  // Jarak lurus (haversine) dari titik asal ke setiap lokasi, dihitung
  // instan di client untuk ditampilkan di daftar & pada tiap marker peta,
  // tanpa perlu panggilan API.
  //
  // Catatan: di sini kita SENGAJA tidak lagi menyertakan estimasi durasi
  // (estimateDuration). Estimasi itu dulu dihitung kasar dari jarak lurus
  // + asumsi kecepatan per moda, sehingga angkanya sering tidak konsisten
  // dengan hasil Analisis Multimoda yang memakai rute nyata (API
  // directions/routing). Untuk menghindari kebingungan pengguna, Analisis
  // Isokron sekarang hanya menampilkan jarak, bukan perkiraan waktu.
  const distances = useMemo(() => {
    if (!origin) return {};
    const map = {};
    for (const loc of locations) {
      const dist = haversineDistance([origin.lat, origin.lng], [loc.lat, loc.lng]);
      map[loc.id] = { distance: dist };
    }
    return map;
  }, [origin, locations]);

  // Batasi titik asal analisis (isokron & multimoda) hanya boleh di dalam
  // batas administrasi Desa Sukorejo — di luar itu ditolak dengan pesan,
  // supaya hasil analisis selalu relevan untuk wilayah desa saja.
  const handlePickOrigin = useCallback((point) => {
    if (!isPointInBoundary(point, villageBoundary)) {
      setOriginError(
        "Titik yang dipilih berada di luar batas Desa Sukorejo. Pilih titik di dalam wilayah desa (area bergaris putus-putus di peta)."
      );
      return;
    }
    setOriginError(null);
    setOrigin(point);
    setPickingOrigin(false);
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (!isPointInBoundary(point, villageBoundary)) {
          setOriginError(
            "Lokasi perangkat Anda berada di luar batas Desa Sukorejo, jadi tidak bisa dipakai sebagai titik asal analisis."
          );
          return;
        }
        setOriginError(null);
        setOrigin(point);
      },
      () => setIsoError("Gagal mengambil lokasi perangkat. Izinkan akses lokasi di browser.")
    );
  }, []);

  const toggleRange = (seconds) => {
    setIsoRanges((prev) =>
      prev.includes(seconds) ? prev.filter((r) => r !== seconds) : [...prev, seconds].sort((a, b) => a - b)
    );
  };

  const toggleMultiMode = (mode) => {
    setMultiModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const runIsochrone = useCallback(async () => {
    if (!origin) return;
    setIsoLoading(true);
    setIsoError(null);
    try {
      const res = await fetch("/api/isochrone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: origin.lat,
          lng: origin.lng,
          mode: isoMode,
          ranges: isoRanges.length ? isoRanges : [300, 600, 900]
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat isokron.");

      // Tandai setiap feature dengan urutan (group) supaya gradasi warna
      // dari terdekat ke terjauh konsisten di MapView.
      const sorted = [...json.features].sort(
        (a, b) => a.properties.value - b.properties.value
      );
      sorted.forEach((f, i) => (f.properties.group = i));

      // renderKey unik per hasil, dipakai MapView untuk memaksa layer
      // GeoJSON di-remount setiap kali hasil baru datang (react-leaflet
      // tidak otomatis mendeteksi perubahan prop `data` pada GeoJSON).
      isoRequestIdRef.current += 1;
      setIsochroneGeoJSON({ ...json, features: sorted, renderKey: isoRequestIdRef.current });
    } catch (err) {
      setIsoError(err.message);
    } finally {
      setIsoLoading(false);
    }
  }, [origin, isoMode, isoRanges]);

  const runMultimoda = useCallback(async () => {
    if (!origin || !selected) return;
    setMultiLoading(true);
    setMultiError(null);
    try {
      const res = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination: { lat: selected.lat, lng: selected.lng },
          modes: multiModes.length ? multiModes : ["walking"]
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menghitung rute.");

      multiRequestIdRef.current += 1;
      setMultiResults(json.results.map((r) => ({ ...r, requestId: multiRequestIdRef.current })));
      hasComparedRef.current = true;
    } catch (err) {
      setMultiError(err.message);
    } finally {
      setMultiLoading(false);
    }
  }, [origin, selected, multiModes]);

  // Bug fix: sebelumnya rute multimoda yang sudah tampil tidak berubah
  // ketika titik tujuan diganti — hasil lama (dan garis rute lama di peta)
  // tetap tampil sampai tombol "Bandingkan Rute Multimoda" ditekan lagi.
  // Sekarang begitu tujuan berganti, hasil lama langsung dibersihkan, dan
  // jika pengguna sudah pernah menjalankan perbandingan sebelumnya, rute
  // otomatis dihitung ulang untuk tujuan yang baru.
  useEffect(() => {
    setMultiResults([]);
    setMultiError(null);
    if (hasComparedRef.current && origin && selected) {
      runMultimoda();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const routeLayers = multiResults
    .filter((r) => r.geometry)
    .map((r) => ({
      ...r,
      color: ROUTE_COLORS[r.mode] || "#2F4A3C",
      renderKey: `${r.mode}-${r.requestId}`
    }));

  // ---------- Layout: fit peta persis dengan sisa ruang layar di desktop ----------
  // Di layar besar (>= lg), WebGIS ditampilkan sebagai split-pane 3 kolom
  // dengan tinggi PERSIS mengisi sisa layar di bawah Navbar (dihitung nyata
  // via JS, bukan tebakan CSS calc()), dan scroll halaman dikunci — scroll
  // hanya terjadi di dalam list kiri & panel analisis kanan.
  //
  // Di layar kecil (mobile), kolom-kolom itu ditumpuk vertikal. Memaksakan
  // tinggi tetap + scroll terkunci di sini akan memotong daftar UMKM/Wisata
  // yang panjang (persis bug yang dilaporkan). Jadi di mobile kita BIARKAN
  // tinggi mengikuti konten dan scroll halaman berjalan normal, supaya
  // seluruh daftar bisa dijangkau dengan scroll.
  const [isDesktop, setIsDesktop] = useState(false);
  const [mapAreaHeight, setMapAreaHeight] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setMapAreaHeight(null);
      return;
    }
    const recalc = () => {
      const navbar = document.querySelector("header");
      const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      setMapAreaHeight(window.innerHeight - navbarHeight);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [isDesktop]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    if (isDesktop) {
      // Bug fix: kalau posisi scroll halaman belum di paling atas persis
      // saat overflow dikunci di bawah (mis. karena pengguna sempat
      // menggeser sedikit sebelum breakpoint desktop terdeteksi, atau
      // posisi scroll browser belum sempat direset setelah navigasi),
      // viewport akan "membeku" di posisi geser itu — Navbar di atas jadi
      // terlihat terpotong separuh dan Footer ikut mengintip di bawah,
      // padahal scroll sebenarnya sudah tidak bisa digerakkan lagi. Maka
      // paksa scroll ke (0, 0) DULU, baru kunci overflow-nya.
      window.scrollTo(0, 0);
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      html.style.overflow = prevHtmlOverflow || "";
      body.style.overflow = prevBodyOverflow || "";
    }
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [isDesktop]);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[320px_1fr_340px]"
      style={isDesktop && mapAreaHeight != null ? { height: `${mapAreaHeight}px` } : undefined}
    >
      {/* ---------- Kolom kiri: search + list ---------- */}
      <aside className="flex min-h-0 flex-col border-r border-ink/10 bg-paper">
        <div className="border-b border-ink/10 p-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            filter={filter}
            onFilterChange={handleFilterChange}
            category={category}
            onCategoryChange={setCategory}
            categoryOptions={categoryOptions}
          />
        </div>
        <ListSidebar
          items={filtered}
          selectedId={selected?.id}
          onSelect={(item) => {
            setSelected(item);
            setListFocusToken((t) => t + 1);
          }}
          distances={origin ? distances : null}
        />
      </aside>

      {/* ---------- Tengah: peta ---------- */}
      {/* `isolate` membuat stacking context baru khusus untuk peta, agar
          z-index internal Leaflet (kontrol, marker, popup — bisa sampai 1000)
          tidak "bocor" menimpa Navbar/Footer yang sticky saat halaman discroll. */}
      <div className="relative isolate z-0 h-[50vh] min-h-0 overflow-hidden lg:h-auto">
        <MapView
          locations={filtered}
          origin={origin}
          pickingOrigin={pickingOrigin}
          onPickOrigin={handlePickOrigin}
          selectedId={selected?.id}
          listFocusToken={listFocusToken}
          onSelectLocation={setSelected}
          onOpenDetail={setDetailItem}
          isochroneGeoJSON={isochroneGeoJSON}
          routeLayers={routeLayers}
          distances={origin ? distances : null}
        />
      </div>

      <CatalogFocusModal item={detailItem} onClose={() => setDetailItem(null)} showMapLink={false} />

      {/* ---------- Kanan: panel analisis ---------- */}
      <aside className="flex min-h-0 flex-col border-l border-ink/10 bg-paper p-3">
        <IsochronePanel
          origin={origin}
          pickingOrigin={pickingOrigin}
          onTogglePicking={() => setPickingOrigin((v) => !v)}
          onUseMyLocation={handleUseMyLocation}
          originError={originError}
          destination={selected}
          isoMode={isoMode}
          onIsoModeChange={setIsoMode}
          isoRanges={isoRanges}
          onToggleRange={toggleRange}
          onRunIsochrone={runIsochrone}
          isoLoading={isoLoading}
          isoError={isoError}
          multiModes={multiModes}
          onToggleMultiMode={toggleMultiMode}
          onRunMultimoda={runMultimoda}
          multiLoading={multiLoading}
          multiError={multiError}
          multiResults={multiResults}
        />
      </aside>
    </div>
  );
}
