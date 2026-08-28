import { NextResponse } from "next/server";

// Profil ORS yang dipetakan dari moda transportasi di UI.
const PROFILE_MAP = {
  walking: "foot-walking",
  cycling: "cycling-regular",
  motorcycle: "driving-car", // ORS tidak punya profil motor khusus, dianggap mendekati mobil
  car: "driving-car"
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { lat, lng, mode = "walking", ranges = [300, 600, 900] } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Parameter lat dan lng wajib berupa angka." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ORS_API_KEY belum diatur di environment variables. Tambahkan di Vercel Project Settings atau file .env.local."
        },
        { status: 501 }
      );
    }

    const profile = PROFILE_MAP[mode] || "foot-walking";

    const res = await fetch(
      `https://api.openrouteservice.org/v2/isochrones/${profile}`,
      {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          locations: [[lng, lat]],
          range: ranges,
          range_type: "time"
        })
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `OpenRouteService error: ${text}` },
        { status: res.status }
      );
    }

    const geojson = await res.json();
    return NextResponse.json(geojson);
  } catch (err) {
    return NextResponse.json(
      { error: `Gagal memproses isokron: ${err.message}` },
      { status: 500 }
    );
  }
}
