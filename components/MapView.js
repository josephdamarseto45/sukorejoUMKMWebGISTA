"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import { villageBoundary } from "@/data/villageBoundary";
import { formatDistance } from "@/lib/geo";

// Ikon default Leaflet mengandalkan path asset yang tidak ikut ter-bundle
// di Next.js, jadi kita ganti dengan divIcon custom (lihat globals.css).
function pinIcon(className) {
  return L.divIcon({
    className: "",
    html: `<div class="marker-pin ${className}"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28]
  });
}

const wisataIcon = pinIcon("wisata");
const umkmIcon = pinIcon("umkm");
const originIcon = pinIcon("origin");

// Bounds (kotak pembatas) dari poligon batas Desa Sukorejo — dipakai supaya
// tampilan awal peta langsung fokus & pas ke seluruh wilayah desa, bukan
// titik pusat + zoom tetap yang bisa saja meleset dari cakupan sebenarnya.
const VILLAGE_BOUNDS = L.geoJSON(villageBoundary).getBounds();

function ClickHandler({ active, onPick }) {
  useMapEvents({
    click(e) {
      if (active) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

// Bug fix: sebelumnya scrollWheelZoom selalu aktif, jadi begitu kursor
// (atau dua jari trackpad) lewat di atas peta sambil pengguna sedang
// men-scroll HALAMAN, scroll itu "ditelan" Leaflet untuk zoom peta alih-
// alih menggulir halaman — halaman terasa macet/tidak bisa discroll,
// apalagi kalau scroll trackpad-nya cepat (momentum) sehingga peta
// zoom in/out berkali-kali dengan sangat cepat.
//
// Perilaku sekarang (pola umum seperti peta Google Maps yang ditanam di
// halaman): zoom via scroll TIDAK aktif secara default. Baru aktif
// setelah peta benar-benar diklik, dan mati lagi begitu kursor
// meninggalkan area peta atau pengguna klik di luar peta — supaya scroll
// halaman di luar & di atas peta tetap selalu berjalan normal. Zoom
// pakai tombol +/- atau pinch dua jari (touchZoom) tetap selalu aktif.
function ScrollZoomGate({ onChange }) {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();
    onChange(false);

    const enable = () => {
      map.scrollWheelZoom.enable();
      onChange(true);
    };
    const disable = () => {
      map.scrollWheelZoom.disable();
      onChange(false);
    };

    map.on("click", enable);
    map.getContainer().addEventListener("mouseleave", disable);

    return () => {
      map.off("click", enable);
      map.getContainer().removeEventListener("mouseleave", disable);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function FlyToOrigin({ origin }) {
  const map = useMap();
  useEffect(() => {
    if (origin) map.flyTo([origin.lat, origin.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [origin, map]);
  return null;
}

// Terbang ke lokasi terpilih DAN buka popup-nya — dipakai supaya klik nama
// lokasi di daftar sisi kiri (ListSidebar) langsung menampilkan popup
// deskripsi marker itu di peta, bukan cuma menggeser peta ke sana saja.
// Klik marker-nya langsung di peta sudah otomatis membuka popup (perilaku
// bawaan react-leaflet), efek ini menambahkan perilaku yang sama untuk
// jalur "pilih dari daftar". `markerRefs` berisi instance Leaflet Marker
// per id lokasi (lihat pengisian ref di render Marker di bawah).
function FlyToSelected({ selectedId, listFocusToken, locations, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo([loc.lat, loc.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    markerRefs.current[selectedId]?.openPopup();
    // `listFocusToken` sengaja ikut jadi dependency (meski tidak dipakai
    // nilainya di dalam effect) — supaya effect ini tetap jalan ulang
    // setiap kali lokasi yang SAMA diklik lagi dari daftar sisi kiri
    // (mis. setelah popup-nya sempat ditutup manual), bukan hanya saat
    // `selectedId` benar-benar berubah ke lokasi lain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, listFocusToken]);
  return null;
}

export default function MapView({
  locations,
  origin,
  pickingOrigin,
  onPickOrigin,
  selectedId,
  listFocusToken,
  onSelectLocation,
  onOpenDetail,
  isochroneGeoJSON,
  routeLayers,
  distances
}) {
  const [scrollZoomHint, setScrollZoomHint] = useState(false);
  const markerRefs = useRef({});

  return (
    <div className="relative h-full w-full">
      <MapContainer
        bounds={VILLAGE_BOUNDS}
        boundsOptions={{ padding: [24, 24] }}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ cursor: pickingOrigin ? "crosshair" : undefined }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ScrollZoomGate onChange={(active) => setScrollZoomHint(!active)} />

      <ClickHandler active={pickingOrigin} onPick={onPickOrigin} />
      <FlyToOrigin origin={origin} />
      <FlyToSelected
        selectedId={selectedId}
        listFocusToken={listFocusToken}
        locations={locations}
        markerRefs={markerRefs}
      />

      {/* Batas administrasi Desa Sukorejo (sumber: BIG, lihat
          data/villageBoundary.js) — digambar paling bawah (sebelum layer
          isokron/rute/marker) supaya tidak menutupi elemen analisis.
          Bug fix: karena poligon ini menutupi hampir seluruh area peta,
          waktu dia "interactive" (untuk popup info saat diklik) klik
          untuk memilih titik asal (Analisis Isokron) ikut tertangkap
          olehnya duluan dan tidak pernah sampai ke handler map — titik
          asal jadi tidak bisa diletakkan di wilayah manapun yang berada
          di dalam batas desa. Makanya interactive dimatikan sementara
          selama mode "pilih titik di peta" aktif, supaya klik tembus ke
          peta. `key` disertakan supaya react-leaflet me-remount layer
          ini setiap kali pickingOrigin berubah (opsi `interactive` pada
          Leaflet hanya berlaku saat layer dibuat, tidak bisa diubah
          langsung di layer yang sudah ada). */}
      <GeoJSON
        key={`boundary-${pickingOrigin ? "picking" : "idle"}`}
        data={villageBoundary}
        interactive={!pickingOrigin}
        style={{
          color: "#2f4a3c",
          weight: 2,
          dashArray: "6 4",
          fillColor: "#2f4a3c",
          fillOpacity: 0.03
        }}
        onEachFeature={(feature, layer) => {
          const p = feature.properties;
          layer.bindPopup(
            `<div style="font-size:12px;line-height:1.5">
              <strong>${p.nama}</strong><br/>
              Kec. ${p.kecamatan}, Kab. ${p.kabupaten}<br/>
              ${p.provinsi}${p.luas_km2 ? `<br/>Luas: ${p.luas_km2} km²` : ""}
            </div>`
          );
        }}
      />

      {isochroneGeoJSON && (
        // key = renderKey unik per hasil isokron. react-leaflet TIDAK
        // otomatis mendeteksi perubahan prop `data` pada <GeoJSON>, jadi
        // key harus berubah setiap ada hasil baru supaya layer di-remount
        // dan peta benar-benar memperbarui tampilannya.
        <GeoJSON
          key={`iso-${isochroneGeoJSON.renderKey ?? "0"}`}
          data={isochroneGeoJSON}
          style={(feature) => {
            const idx = feature?.properties?.group ?? 0;
            const opacities = [0.55, 0.3, 0.12];
            return {
              color: "#8B4A2B",
              weight: 1,
              fillColor: "#8B4A2B",
              fillOpacity: opacities[idx] ?? 0.15
            };
          }}
        />
      )}

      {routeLayers?.map((layer) =>
        layer.geometry ? (
          // Bug fix: sebelumnya key hanya berupa `layer.mode` (mis. "walking"),
          // sehingga saat titik tujuan diganti dan rute dihitung ulang untuk
          // moda yang sama, React menganggap ini komponen <GeoJSON> yang SAMA
          // dan tidak me-remount-nya — akibatnya react-leaflet tidak menggambar
          // ulang rute meski data geometrinya sudah berubah (rute lama tetap
          // tampil / peta terasa "tidak responsif"). key sekarang menyertakan
          // renderKey unik per permintaan supaya layer selalu di-remount.
          <GeoJSON
            key={layer.renderKey || layer.mode}
            data={layer.geometry}
            style={{ color: layer.color, weight: 4, opacity: 0.85 }}
          />
        ) : null
      )}

      {origin && (
        <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
          <Popup>Titik asal analisis</Popup>
        </Marker>
      )}

      {locations.map((loc) => {
        const eta = distances?.[loc.id];
        return (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={loc.jenis === "wisata" ? wisataIcon : umkmIcon}
            eventHandlers={{ click: () => onSelectLocation(loc) }}
            opacity={selectedId && selectedId !== loc.id ? 0.55 : 1}
            ref={(el) => {
              if (el) markerRefs.current[loc.id] = el;
            }}
          >
            {/* Badge permanen di atas marker (dulu menampilkan waktu, lalu
                jarak) sudah dihapus atas permintaan — info jarak tetap
                tersedia di dalam Popup saat marker diklik. */}
            <Popup>
              <div className="min-w-[180px] max-w-[220px] font-body">
                {loc.foto_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loc.foto_url}
                    alt={loc.nama}
                    className="mb-2 h-28 w-full rounded-md object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                )}
                <p className="font-display text-sm font-semibold text-forest">
                  {loc.nama}
                </p>
                <p className="mt-0.5 text-xs text-ink/60">{loc.kategori}</p>
                {loc.deskripsi && (
                  <>
                    {/* Deskripsi dipotong maks. 3 baris (line-clamp) supaya
                        popup tidak memanjang mengikuti panjang deskripsi.
                        Deskripsi lengkap dibuka lewat modal yang sama
                        dengan halaman katalog (CatalogFocusModal), biar
                        tampilannya konsisten di seluruh situs. */}
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink/75">
                      {loc.deskripsi}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(loc)}
                      className="mt-0.5 text-[11px] font-semibold text-river underline-offset-2 hover:underline"
                    >
                      Baca selengkapnya
                    </button>
                  </>
                )}
                {eta && (
                  <p className="mt-1.5 text-xs font-semibold text-river">
                    📍 {formatDistance(eta.distance)} dari titik asal
                  </p>
                )}
                <button
                  onClick={() => onSelectLocation(loc)}
                  className="mt-2 rounded-full bg-forest px-3 py-1 text-[11px] font-semibold text-paper"
                >
                  Jadikan tujuan multimoda
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
      </MapContainer>

      {/* Hint kecil agar pengguna tahu perlu klik peta dulu untuk
          mengaktifkan zoom via scroll (lihat ScrollZoomGate di atas). */}
      {scrollZoomHint && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-ink/75 px-3 py-1.5 text-[11px] font-medium text-paper shadow-lg">
          Klik peta untuk mengaktifkan zoom dengan scroll
        </div>
      )}
    </div>
  );
}
