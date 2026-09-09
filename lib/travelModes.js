// Sumber tunggal (single source of truth) untuk daftar moda transportasi
// yang dipakai di seluruh WebGIS: panel Analisis Isokron, panel Analisis
// Multimoda, legenda warna rute, dan pemetaan warna garis rute di peta.
//
// Hanya 3 moda yang ditampilkan ke pengguna: Jalan Kaki, Sepeda, Berkendara.
// "Berkendara" sengaja mewakili kendaraan bermotor secara umum (motor
// maupun mobil digabung jadi satu pilihan) karena provider routing (ORS)
// tidak punya profil khusus sepeda motor — profil "driving-car" dipakai
// sebagai pendekatan terdekat untuk kendaraan bermotor pada umumnya.
export const MODE_OPTIONS = [
  { id: "walking", label: "Jalan Kaki", icon: "🚶", color: "#3E6E64" },
  { id: "cycling", label: "Sepeda", icon: "🚴", color: "#C89B3C" },
  { id: "car", label: "Berkendara", icon: "🚗", color: "#8B4A2B" }
];

// Peta cepat id moda -> warna, dipakai untuk mewarnai garis rute di peta
// (MapView) dan swatch legenda (IsochronePanel) supaya warnanya konsisten
// di kedua tempat.
export const ROUTE_COLORS = MODE_OPTIONS.reduce((acc, m) => {
  acc[m.id] = m.color;
  return acc;
}, {});

export function modeLabel(id) {
  return MODE_OPTIONS.find((m) => m.id === id)?.label || id;
}

export function modeIcon(id) {
  return MODE_OPTIONS.find((m) => m.id === id)?.icon || "";
}

export function modeColor(id) {
  return ROUTE_COLORS[id] || "#2F4A3C";
}
