// Utilitas geospasial ringan: jarak lurus (haversine), format jarak & durasi.

const EARTH_RADIUS_M = 6371000;

export function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/** Jarak garis lurus antara dua titik lat/lng, dalam meter. */
export function haversineDistance([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return "-";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return "-";
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} menit`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} jam ${m > 0 ? `${m} menit` : ""}`.trim();
}

// Estimasi kasar durasi tempuh berdasarkan jarak lurus, dipakai sebagai
// fallback ketika API routing (ORS) belum dikonfigurasi.
const SPEED_MPS = {
  walking: 1.3, // ~4.7 km/jam
  cycling: 4.2, // ~15 km/jam
  motorcycle: 8.3, // ~30 km/jam
  car: 11.1 // ~40 km/jam
};

export function estimateDuration(meters, mode = "walking") {
  const speed = SPEED_MPS[mode] || SPEED_MPS.walking;
  return meters / speed;
}

/**
 * Uji titik-di-dalam-poligon dengan algoritma ray casting standar.
 * `point` = [lng, lat] (urutan GeoJSON), `polygon` = array ring [[lng,lat], ...]
 * (ring pertama saja / exterior ring — cukup untuk kasus poligon tanpa lubang
 * seperti batas desa di sini).
 */
function pointInRing([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Cek apakah titik {lat, lng} berada di dalam GeoJSON Feature bertipe
 * Polygon (ring pertama = exterior). Dipakai untuk membatasi titik asal
 * analisis isokron/multimoda agar hanya boleh diletakkan di dalam batas
 * administrasi desa (lihat data/villageBoundary.js).
 */
export function isPointInBoundary({ lat, lng }, boundaryFeature) {
  if (!boundaryFeature?.geometry) return true; // tanpa data batas, jangan blokir apa pun
  const { type, coordinates } = boundaryFeature.geometry;
  const point = [lng, lat];

  if (type === "Polygon") {
    return pointInRing(point, coordinates[0]);
  }
  if (type === "MultiPolygon") {
    return coordinates.some((poly) => pointInRing(point, poly[0]));
  }
  return true;
}
