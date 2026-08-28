import { getAllLocations } from "@/lib/data";
import WebGISClient from "@/components/WebGISClient";

// Data wisata & UMKM dikelola lewat panel admin dan bisa berubah kapan
// saja, jadi halaman ini dirender ulang di setiap request (tidak
// di-cache statis) supaya penambahan/penghapusan data langsung terlihat.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Peta WebGIS | Desa Wisata Sukorejo"
};

export default async function WebGISPage({ searchParams }) {
  const locations = await getAllLocations();
  const initialSelectedId = searchParams?.id || null;
  return <WebGISClient locations={locations} initialSelectedId={initialSelectedId} />;
}
