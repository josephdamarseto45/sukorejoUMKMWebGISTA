"use client";

import { useCallback, useEffect, useState } from "react";
import LocationForm from "@/components/admin/LocationForm";
import {
  getWisata,
  getUmkm,
  createLocation,
  updateLocation,
  deleteLocation
} from "@/lib/data";

const TABS = [
  { id: "wisata", label: "Wisata" },
  { id: "umkm", label: "UMKM" }
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("wisata");
  const [items, setItems] = useState({ wisata: [], umkm: [] });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // list | create | edit
  const [activeItem, setActiveItem] = useState(null);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [wisata, umkm] = await Promise.all([getWisata(), getUmkm()]);
    setItems({ wisata, umkm });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function startCreate() {
    setActiveItem(null);
    setMode("create");
    setNotice("");
  }

  function startEdit(item) {
    setActiveItem(item);
    setMode("edit");
    setNotice("");
  }

  function cancelForm() {
    setMode("list");
    setActiveItem(null);
  }

  async function handleSubmit(payload) {
    if (mode === "edit" && activeItem) {
      const updated = await updateLocation(tab, activeItem.id, payload);
      setItems((prev) => ({
        ...prev,
        [tab]: prev[tab].map((it) => (it.id === updated.id ? updated : it))
      }));
      setNotice(`"${updated.nama}" berhasil diperbarui.`);
    } else {
      const created = await createLocation(tab, payload);
      setItems((prev) => ({
        ...prev,
        [tab]: [...prev[tab], created].sort((a, b) => a.nama.localeCompare(b.nama))
      }));
      setNotice(`"${created.nama}" berhasil ditambahkan.`);
    }
    setMode("list");
    setActiveItem(null);
  }

  async function handleDelete(item) {
    const ok = window.confirm(`Hapus "${item.nama}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!ok) return;
    setDeletingId(item.id);
    try {
      await deleteLocation(tab, item.id);
      setItems((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((it) => it.id !== item.id)
      }));
      setNotice(`"${item.nama}" berhasil dihapus.`);
    } catch (err) {
      setNotice(`Gagal menghapus: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  const list = items[tab];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-full bg-forest/10 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setMode("list");
                setActiveItem(null);
                setNotice("");
              }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-forest text-paper" : "text-forest hover:bg-forest/10"
              }`}
            >
              {t.label} <span className="ml-1 text-xs opacity-70">({items[t.id].length})</span>
            </button>
          ))}
        </div>

        {mode === "list" && (
          <button
            onClick={startCreate}
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-light"
          >
            + Tambah {tab === "wisata" ? "Wisata" : "UMKM"}
          </button>
        )}
      </div>

      {notice && (
        <p className="rounded-lg bg-forest/10 px-3.5 py-2.5 text-sm font-medium text-forest">
          {notice}
        </p>
      )}

      {mode !== "list" ? (
        <LocationForm
          jenis={tab}
          initialItem={activeItem}
          onCancel={cancelForm}
          onSubmit={handleSubmit}
        />
      ) : loading ? (
        <div className="flex h-40 items-center justify-center text-sm text-ink/50">
          Memuat data...
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-10 text-center text-sm text-ink/50">
          Belum ada data {tab === "wisata" ? "wisata" : "UMKM"}. Klik &ldquo;Tambah&rdquo;
          untuk menambahkan data pertama.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full text-left text-sm">
            <thead className="bg-forest/5 text-xs font-semibold uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 hidden md:table-cell">Lokasi</th>
                <th className="px-4 py-3 hidden lg:table-cell">Koordinat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {list.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-3 font-medium text-ink">{item.nama}</td>
                  <td className="px-4 py-3 text-ink/70">{item.kategori}</td>
                  <td className="px-4 py-3 hidden text-ink/60 md:table-cell">
                    {item.lokasi || "-"}
                  </td>
                  <td className="px-4 py-3 hidden font-mono text-xs text-ink/50 lg:table-cell">
                    {item.lat?.toFixed?.(5)}, {item.lng?.toFixed?.(5)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-forest hover:bg-forest/10"
                      >
                        Ubah
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="rounded-full border border-clay/30 px-3 py-1.5 text-xs font-semibold text-clay hover:bg-clay/10 disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
