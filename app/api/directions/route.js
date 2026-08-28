import { NextResponse } from "next/server";

const PROFILE_MAP = {
  walking: "foot-walking",
  cycling: "cycling-regular",
  motorcycle: "driving-car",
  car: "driving-car"
};

// Menghitung rute & durasi untuk satu atau beberapa moda sekaligus,
// dipakai oleh panel "Analisis Multimoda".
export async function POST(request) {
  try {
    const body = await request.json();
    const { origin, destination, modes = ["walking"] } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "origin dan destination wajib diisi ({lat, lng})." },
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

    const results = await Promise.all(
      modes.map(async (mode) => {
        const profile = PROFILE_MAP[mode] || "foot-walking";
        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
          {
            method: "POST",
            headers: {
              Authorization: apiKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              coordinates: [
                [origin.lng, origin.lat],
                [destination.lng, destination.lat]
              ]
            })
          }
        );

        if (!res.ok) {
          const text = await res.text();
          return { mode, error: text };
        }

        const geojson = await res.json();
        const summary = geojson?.features?.[0]?.properties?.summary;
        return {
          mode,
          geometry: geojson?.features?.[0]?.geometry || null,
          distance: summary?.distance ?? null,
          duration: summary?.duration ?? null
        };
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: `Gagal memproses rute: ${err.message}` },
      { status: 500 }
    );
  }
}
