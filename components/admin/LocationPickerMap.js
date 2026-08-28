"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, GeoJSON, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { villageBoundary } from "@/data/villageBoundary";
import { isPointInBoundary } from "@/lib/geo";

// Bounds (kotak pembatas) dari poligon batas Desa Sukorejo — dipakai supaya
// tampilan awal peta pemilih titik langsung fokus & pas ke seluruh wilayah
// desa (bukan titik + zoom tetap yang bisa saja meleset dari cakupan desa).
const VILLAGE_BOUNDS = L.geoJSON(villageBoundary).getBounds();

const markerIcon = L.divIcon({
  className: "",
  html: `<div class="marker-pin origin"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28]
});

function ClickToPick({ onPick, onRejected }) {
  useMapEvents({
    click(e) {
      const point = { lat: e.latlng.lat, lng: e.latlng.lng };
      // Titik lokasi wisata/UMKM hanya boleh berada di dalam batas
      // administrasi desa — klik di luar poligon batas ditolak di sini,
      // sebelum sempat mengisi state form sama sekali.
      if (!isPointInBoundary(point, villageBoundary)) {
        onRejected();
        return;
      }
      onPick(point);
    }
  });
  return null;
}

export default function LocationPickerMap({ lat, lng, onPick }) {
  const hasPoint = Number.isFinite(lat) && Number.isFinite(lng);
  const [rejected, setRejected] = useState(false);

  function handleRejected() {
    setRejected(true);
    window.clearTimeout(handleRejected._t);
    handleRejected._t = window.setTimeout(() => setRejected(false), 2200);
  }

  // Kalau lokasi sudah punya titik (mis. sedang mengedit lokasi yang sudah
  // ada), fokuskan ke titik itu. Kalau belum (menambah lokasi baru), fokus
  // ke seluruh cakupan batas desa dulu supaya admin lihat konteks
  // wilayahnya sebelum menentukan titik.
  const mapProps = hasPoint
    ? { center: [lat, lng], zoom: 16 }
    : { bounds: VILLAGE_BOUNDS, boundsOptions: { padding: [24, 24] } };

  return (
    <div className="relative h-full w-full">
      <MapContainer {...mapProps} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Batas desa: panduan visual sekaligus batas area yang boleh
            diklik (lihat ClickToPick) supaya admin tahu persis cakupan
            wilayah yang valid saat menentukan titik lokasi. */}
        <GeoJSON
          data={villageBoundary}
          interactive={false}
          style={{
            color: "#2f4a3c",
            weight: 2,
            dashArray: "6 4",
            fillColor: "#2f4a3c",
            fillOpacity: 0.03
          }}
        />
        <ClickToPick onPick={onPick} onRejected={handleRejected} />
        {hasPoint && <Marker position={[lat, lng]} icon={markerIcon} />}
      </MapContainer>

      {rejected && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] rounded-lg bg-clay px-3 py-2 text-center text-xs font-semibold text-paper shadow-lg animate-[fadeIn_0.15s_ease-out]">
          Titik di luar batas administrasi desa. Pilih titik di dalam garis putus-putus.
        </div>
      )}
    </div>
  );
}
