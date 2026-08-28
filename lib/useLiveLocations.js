"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { getWisata, getUmkm } from "./data";

/**
 * Menjaga data lokasi (wisata & UMKM) selalu sinkron dengan database, tanpa
 * bergantung pada cache halaman/hosting. Dipakai oleh WebGISClient dan
 * CatalogGrid supaya perubahan dari panel admin (tambah/ubah/hapus) selalu
 * langsung terlihat, baik lewat:
 *
 * 1. Refetch otomatis begitu komponen dipasang di client (menimpa data awal
 *    dari server jika ternyata sudah berubah / basi).
 * 2. Realtime subscription ke tabel `wisata` & `umkm` — begitu ada
 *    insert/update/delete di database, daftar diambil ulang otomatis.
 * 3. Refetch saat tab kembali difokuskan (jaga-jaga jika Realtime belum
 *    diaktifkan di project Supabase).
 *
 * `scope` bisa "all" (wisata + umkm digabung, dipakai peta WebGIS) atau
 * "wisata"/"umkm" (dipakai halaman katalog masing-masing).
 */
export function useLiveLocations(initialItems, scope = "all") {
  const [items, setItems] = useState(initialItems);
  const [refreshing, setRefreshing] = useState(false);
  const mountedRef = useRef(true);

  async function fetchFresh() {
    if (!isSupabaseConfigured) return;
    setRefreshing(true);
    try {
      if (scope === "wisata") {
        const wisata = await getWisata();
        if (mountedRef.current) setItems(wisata);
      } else if (scope === "umkm") {
        const umkm = await getUmkm();
        if (mountedRef.current) setItems(umkm);
      } else {
        const [wisata, umkm] = await Promise.all([getWisata(), getUmkm()]);
        if (mountedRef.current) {
          setItems([
            ...wisata.map((w) => ({ ...w, jenis: "wisata" })),
            ...umkm.map((u) => ({ ...u, jenis: "umkm" }))
          ]);
        }
      }
    } finally {
      if (mountedRef.current) setRefreshing(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    // 1. Selalu ambil data terbaru begitu halaman dibuka di browser.
    fetchFresh();

    // 2. Realtime: dengarkan perubahan tabel wisata & umkm langsung dari
    //    Supabase. Jika Realtime belum diaktifkan di project (lihat
    //    supabase/schema.sql), langganan ini tidak akan error — hanya
    //    tidak menerima event apa pun, dan fallback di bawah tetap jalan.
    let channel;
    if (isSupabaseConfigured) {
      channel = supabase
        .channel("public:wisata-umkm")
        .on("postgres_changes", { event: "*", schema: "public", table: "wisata" }, fetchFresh)
        .on("postgres_changes", { event: "*", schema: "public", table: "umkm" }, fetchFresh)
        .subscribe();
    }

    // 3. Jaga-jaga: refetch juga saat tab kembali aktif/difokuskan.
    const onFocus = () => fetchFresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") fetchFresh();
    });

    return () => {
      mountedRef.current = false;
      window.removeEventListener("focus", onFocus);
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  return { items, refreshing, refetch: fetchFresh };
}
