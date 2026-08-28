"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { uploadFotoLokasi, deleteFotoLokasi } from "@/lib/data";
import { villageBoundary } from "@/data/villageBoundary";
import { isPointInBoundary } from "@/lib/geo";

const MAX_FOTO = 4;

const LocationPickerMap = dynamic(
  () => import("@/components/admin/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-forest/5 text-xs text-ink/40">
        Memuat peta...
      </div>
    )
  }
);

const CATEGORY_SUGGESTIONS = {
  wisata: ["Wisata Alam", "Wisata Air", "Wisata Budaya", "Wisata Buatan"],
  umkm: ["Kuliner", "Kerajinan", "Oleh-oleh", "Jasa & Penginapan"]
};

const EMPTY_FORM = {
  nama: "",
  kategori: "",
  deskripsi: "",
  lat: "",
  lng: "",
  telepon: "",
  lokasi: "",
  harga: "",
  jam_buka: "",
  foto_urls: []
};

function toFormState(item) {
  if (!item) return EMPTY_FORM;
  // Data lama hanya punya `foto_url` (satu foto). Data baru punya
  // `foto_urls` (array, 1-4 foto). Keduanya didukung di sini.
  const fotoUrls = Array.isArray(item.foto_urls) && item.foto_urls.length
    ? item.foto_urls.filter(Boolean).slice(0, MAX_FOTO)
    : item.foto_url
    ? [item.foto_url]
    : [];
  return {
    nama: item.nama ?? "",
    kategori: item.kategori ?? "",
    deskripsi: item.deskripsi ?? "",
    lat: item.lat ?? "",
    lng: item.lng ?? "",
    telepon: item.telepon ?? "",
    lokasi: item.lokasi ?? "",
    harga: item.harga ?? "",
    jam_buka: item.jam_buka ?? "",
    foto_urls: fotoUrls
  };
}

const FIELD_LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60";
const FIELD_INPUT =
  "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none";

export default function LocationForm({ jenis, initialItem, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => toFormState(initialItem));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(toFormState(initialItem));
  }, [initialItem]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePick({ lat, lng }) {
    set("lat", lat.toFixed(6));
    set("lng", lng.toFixed(6));
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    // Reset input supaya memilih file yang sama persis dua kali berturut-turut
    // tetap memicu event `change`.
    e.target.value = "";
    if (!files.length) return;

    setError("");

    const remaining = MAX_FOTO - form.foto_urls.length;
    if (remaining <= 0) {
      setError(`Maksimal ${MAX_FOTO} foto. Hapus salah satu foto dulu untuk menambah yang baru.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    const skipped = files.length - toUpload.length;

    setUploading(true);
    let uploadError = "";
    for (const file of toUpload) {
      try {
        const url = await uploadFotoLokasi(jenis, file);
        setForm((f) => ({ ...f, foto_urls: [...f.foto_urls, url].slice(0, MAX_FOTO) }));
      } catch (err) {
        uploadError = err.message || "Gagal mengunggah foto.";
        break;
      }
    }
    setUploading(false);

    if (uploadError) {
      setError(uploadError);
    } else if (skipped > 0) {
      setError(`Hanya ${toUpload.length} foto yang ditambahkan (maksimal ${MAX_FOTO} foto per lokasi).`);
    }
  }

  function handleRemovePhoto(url) {
    setForm((f) => ({ ...f, foto_urls: f.foto_urls.filter((u) => u !== url) }));
    // Hapus juga file-nya dari Supabase Storage (kalau memang berasal dari
    // bucket foto-lokasi). Dijalankan di latar belakang, tidak memblokir UI.
    deleteFotoLokasi(url).catch(() => {});
  }

  function handleAddManualUrl() {
    const url = manualUrl.trim();
    if (!url) return;
    if (form.foto_urls.length >= MAX_FOTO) {
      setError(`Maksimal ${MAX_FOTO} foto. Hapus salah satu foto dulu untuk menambah yang baru.`);
      return;
    }
    if (form.foto_urls.includes(url)) {
      setManualUrl("");
      return;
    }
    setError("");
    setForm((f) => ({ ...f, foto_urls: [...f.foto_urls, url].slice(0, MAX_FOTO) }));
    setManualUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.nama.trim()) return setError("Nama wajib diisi.");
    if (!form.kategori.trim()) return setError("Kategori wajib diisi.");
    const latNum = parseFloat(form.lat);
    const lngNum = parseFloat(form.lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return setError("Titik lokasi wajib dipilih pada peta atau diisi manual.");
    }
    // Klik di peta sudah dibatasi ke dalam garis batas desa, tapi
    // koordinat yang diketik manual di kolom Latitude/Longitude bisa saja
    // berada di luar itu — cek ulang di sini supaya lokasi yang tersimpan
    // selalu berada di dalam batas administrasi desa.
    if (!isPointInBoundary({ lat: latNum, lng: lngNum }, villageBoundary)) {
      return setError(
        "Titik lokasi berada di luar batas administrasi desa. Pilih titik di dalam garis batas pada peta, atau perbaiki koordinatnya."
      );
    }

    const payload = {
      nama: form.nama.trim(),
      kategori: form.kategori.trim(),
      deskripsi: form.deskripsi.trim() || null,
      lat: latNum,
      lng: lngNum,
      telepon: form.telepon.trim() || null,
      lokasi: form.lokasi.trim() || null,
      harga: form.harga.trim() || null,
      jam_buka: form.jam_buka.trim() || null,
      // `foto_urls`: galeri 1-4 foto. `foto_url` (cover/foto pertama) tetap
      // dikirim juga untuk kompatibilitas dengan bagian aplikasi yang masih
      // menampilkan satu foto saja (kartu katalog, popup peta) dan sebagai
      // jaga-jaga bila trigger sinkronisasi di database belum terpasang.
      foto_urls: form.foto_urls,
      foto_url: form.foto_urls[0] || null
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  }

  const latNum = parseFloat(form.lat);
  const lngNum = parseFloat(form.lng);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-ink/10 bg-white/70 p-5 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={FIELD_LABEL} htmlFor="nama">
            Nama {jenis === "wisata" ? "Wisata" : "UMKM"}
          </label>
          <input
            id="nama"
            className={FIELD_INPUT}
            value={form.nama}
            onChange={(e) => set("nama", e.target.value)}
            placeholder={jenis === "wisata" ? "mis. Puncak Ndeso Kemuning" : "mis. Warung Pecel Mbok Jum"}
          />
        </div>

        <div>
          <label className={FIELD_LABEL} htmlFor="kategori">
            Kategori
          </label>
          <input
            id="kategori"
            list="kategori-suggestions"
            className={FIELD_INPUT}
            value={form.kategori}
            onChange={(e) => set("kategori", e.target.value)}
            placeholder="Pilih atau ketik kategori"
          />
          <datalist id="kategori-suggestions">
            {CATEGORY_SUGGESTIONS[jenis].map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL} htmlFor="deskripsi">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          rows={4}
          className={FIELD_INPUT}
          value={form.deskripsi}
          onChange={(e) => set("deskripsi", e.target.value)}
          placeholder="Ceritakan singkat tentang tempat/usaha ini..."
        />
      </div>

      <div>
        <label className={FIELD_LABEL}>Titik Lokasi</label>
        <p className="mb-2 text-xs text-ink/50">
          Klik pada peta untuk menandai titik, atau isi koordinat secara
          manual di sebelah kanan. Titik hanya boleh berada di dalam batas
          administrasi desa (garis putus-putus di peta).
        </p>
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
          <div className="h-64 overflow-hidden rounded-xl border border-ink/15 md:h-72">
            <LocationPickerMap
              lat={Number.isFinite(latNum) ? latNum : null}
              lng={Number.isFinite(lngNum) ? lngNum : null}
              onPick={handlePick}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className={FIELD_LABEL} htmlFor="lat">
                Latitude
              </label>
              <input
                id="lat"
                type="number"
                step="any"
                className={FIELD_INPUT}
                value={form.lat}
                onChange={(e) => set("lat", e.target.value)}
                placeholder="-7.3521"
              />
            </div>
            <div>
              <label className={FIELD_LABEL} htmlFor="lng">
                Longitude
              </label>
              <input
                id="lng"
                type="number"
                step="any"
                className={FIELD_INPUT}
                value={form.lng}
                onChange={(e) => set("lng", e.target.value)}
                placeholder="111.0512"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={FIELD_LABEL} htmlFor="lokasi">
            Alamat / Dusun
          </label>
          <input
            id="lokasi"
            className={FIELD_INPUT}
            value={form.lokasi}
            onChange={(e) => set("lokasi", e.target.value)}
            placeholder="Dusun Kemuning, Desa Sukorejo, Sambirejo, Sragen"
          />
        </div>
        <div>
          <label className={FIELD_LABEL} htmlFor="telepon">
            Telepon / WhatsApp
          </label>
          <input
            id="telepon"
            className={FIELD_INPUT}
            value={form.telepon}
            onChange={(e) => set("telepon", e.target.value)}
            placeholder="0812-3456-7890"
          />
        </div>
        <div>
          <label className={FIELD_LABEL} htmlFor="harga">
            Harga / Tarif
          </label>
          <input
            id="harga"
            className={FIELD_INPUT}
            value={form.harga}
            onChange={(e) => set("harga", e.target.value)}
            placeholder="Rp 5.000 / orang atau Gratis"
          />
        </div>
        <div>
          <label className={FIELD_LABEL} htmlFor="jam_buka">
            Jam Buka
          </label>
          <input
            id="jam_buka"
            className={FIELD_INPUT}
            value={form.jam_buka}
            onChange={(e) => set("jam_buka", e.target.value)}
            placeholder="06.00 - 18.00 WIB"
          />
        </div>
      </div>

      <div>
        <label className={FIELD_LABEL}>
          Foto <span className="normal-case text-ink/40">({form.foto_urls.length}/{MAX_FOTO})</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || form.foto_urls.length >= MAX_FOTO}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-forest-dark disabled:opacity-60"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
              <path d="M4 7h2.5l1-2h5l1 2H16a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1z" strokeLinejoin="round" />
              <circle cx="10" cy="11.5" r="2.5" />
            </svg>
            {uploading
              ? "Mengunggah..."
              : form.foto_urls.length >= MAX_FOTO
              ? "Batas 4 foto tercapai"
              : "Ambil / Unggah Foto"}
          </button>
          <span className="text-xs text-ink/45">
            Boleh pilih beberapa sekaligus dari galeri, atau ambil satu-satu dari kamera. Maks. 4 foto, @5MB.
          </span>
        </div>

        <details className="mt-2.5">
          <summary className="cursor-pointer text-xs font-medium text-ink/50 hover:text-ink/70">
            Atau tambahkan URL foto secara manual
          </summary>
          <div className="mt-2 flex gap-2">
            <input
              id="foto_url_manual"
              className={FIELD_INPUT}
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddManualUrl();
                }
              }}
              placeholder="https://..."
              disabled={form.foto_urls.length >= MAX_FOTO}
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              disabled={!manualUrl.trim() || form.foto_urls.length >= MAX_FOTO}
              className="shrink-0 rounded-lg border border-ink/15 px-3.5 py-2.5 text-xs font-semibold text-forest hover:bg-forest/10 disabled:opacity-40"
            >
              Tambah
            </button>
          </div>
        </details>

        {form.foto_urls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {form.foto_urls.map((url, idx) => (
              <div key={url + idx} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Pratinjau foto ${idx + 1}`}
                  className="h-24 w-full rounded-lg border border-ink/10 object-cover"
                  onError={(e) => (e.currentTarget.style.opacity = "0.3")}
                />
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-ink/60 px-1.5 py-0.5 text-[10px] font-semibold text-paper">
                    Sampul
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(url)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-clay text-paper shadow hover:bg-clay/85"
                  aria-label={`Hapus foto ${idx + 1}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-ink/10 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-white"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-full bg-forest px-5 py-2 text-sm font-semibold text-paper transition-colors hover:bg-forest-dark disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : uploading ? "Menunggu foto..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
