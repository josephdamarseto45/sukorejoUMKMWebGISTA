"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// Kelas Tailwind harus statis (bukan diinterpolasi) agar tetap ikut di-scan
// oleh compiler, sehingga dipetakan lewat objek berikut — sama seperti pada
// CatalogCard.
const ACCENT = {
  wisata: {
    tile: "bg-river/10",
    text: "text-river",
    badge: "bg-river/10 text-river"
  },
  umkm: {
    tile: "bg-clay/10",
    text: "text-clay",
    badge: "bg-clay/10 text-clay"
  }
};

// Jarak geser minimum (px) sebelum swipe dianggap sebagai ganti slide,
// supaya tap/scroll biasa tidak salah terdeteksi sebagai swipe.
const SWIPE_THRESHOLD = 40;

// Modal "fokus" yang menampilkan detail lengkap satu card katalog (foto
// penuh dalam mode slide, deskripsi tanpa terpotong, dan seluruh info)
// tanpa harus meninggalkan halaman katalog.

export default function CatalogFocusModal({ item, onClose }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  // Galeri foto: pakai `foto_urls` (1-4 foto) kalau ada, kalau tidak jatuh
  // ke `foto_url` lama (satu foto) supaya data lama tetap tampil.
  const photos = useMemo(() => {
    if (!item) return [];
    if (Array.isArray(item.foto_urls) && item.foto_urls.length) {
      return item.foto_urls.filter(Boolean);
    }
    return item.foto_url ? [item.foto_url] : [];
  }, [item]);

  const goToPhoto = (idx) => {
    const total = photos.length;
    if (total === 0) return;
    setActivePhoto(((idx % total) + total) % total);
  };
  const goPrev = () => goToPhoto(activePhoto - 1);
  const goNext = () => goToPhoto(activePhoto + 1);

  // Reset slide aktif & lightbox HANYA saat item (card) yang dibuka
  // berganti — bukan setiap kali lightboxOpen berubah. Sebelumnya
  // `lightboxOpen` ikut jadi dependency, padahal efek ini juga yang
  // men-set `lightboxOpen`, jadi begitu foto diklik untuk diperbesar,
  // efek ini langsung terpicu ulang dan menutupnya lagi + membalikkan
  // activePhoto ke 0 — itu sebabnya foto "tidak membesar" dan slide
  // yang sudah digeser balik ke awal saat diklik.
  useEffect(() => {
    if (!item) return;
    setActivePhoto(0);
    setLightboxOpen(false);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [item]);

  // Listener keyboard terpisah: boleh bergantung ke lightboxOpen tanpa
  // ikut me-reset state apa pun di atas.
  useEffect(() => {
    if (!item) return;
    const handleKey = (e) => {
      // Escape menutup lightbox foto dulu (kalau sedang terbuka), baru
      // menutup modal detailnya di penekanan berikutnya.
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, onClose, lightboxOpen, activePhoto, photos.length]);

  if (!item) return null;

  const accent = ACCENT[item.jenis] || ACCENT.umkm;
  const currentPhoto = photos[activePhoto] || photos[0] || null;
  const hasMultiplePhotos = photos.length > 1;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };
  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > SWIPE_THRESHOLD) {
      if (touchDeltaX.current < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.nama}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-paper shadow-2xl animate-[popIn_0.18s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
          </svg>
        </button>

        <div className="shrink-0 overflow-y-auto">
          <div
            className={`relative h-56 w-full overflow-hidden sm:h-64 ${accent.tile}`}
            onTouchStart={hasMultiplePhotos ? handleTouchStart : undefined}
            onTouchMove={hasMultiplePhotos ? handleTouchMove : undefined}
            onTouchEnd={hasMultiplePhotos ? handleTouchEnd : undefined}
          >
            {/* Latar blur dari foto yang sama supaya area kosong di sisi
                foto yang tidak memenuhi rasio kotak tetap terasa "penuh",
                sementara foto utamanya sendiri tidak pernah terpotong. */}
            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPhoto}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-lg"
              />
            ) : null}

            {currentPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={currentPhoto}
                src={currentPhoto}
                alt={item.nama}
                onClick={() => setLightboxOpen(true)}
                className="absolute inset-0 h-full w-full cursor-zoom-in object-contain animate-[fadeIn_0.15s_ease-out]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling?.classList.remove("hidden");
                }}
              />
            ) : null}

            <div
              className={`flex h-full items-center justify-center ${currentPhoto ? "hidden" : ""}`}
            >
              <span className={`font-display text-5xl font-semibold ${accent.text}`}>
                {item.nama
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
            </div>

            {hasMultiplePhotos && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Foto sebelumnya"
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Foto berikutnya"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {photos.map((url, idx) => (
                    <button
                      key={url + idx}
                      type="button"
                      onClick={() => goToPhoto(idx)}
                      aria-label={`Lihat foto ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === activePhoto ? "w-5 bg-paper" : "w-1.5 bg-paper/50 hover:bg-paper/75"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {hasMultiplePhotos && (
            <div className="flex gap-2 overflow-x-auto bg-ink/5 p-2.5">
              {photos.map((url, idx) => (
                <button
                  key={url + idx}
                  type="button"
                  onClick={() => goToPhoto(idx)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    idx === activePhoto ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Lihat foto ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <span
            className={`w-fit shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${accent.badge}`}
          >
            {item.kategori}
          </span>
          <h2 className="mt-2.5 font-display text-2xl font-semibold text-forest">
            {item.nama}
          </h2>
          {item.deskripsi ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">
              {item.deskripsi}
            </p>
          ) : null}

          <dl className="mt-5 space-y-2.5 border-t border-ink/8 pt-4 text-sm text-ink/70">
            <Row icon={<PinIcon />} label="Lokasi" text={item.lokasi} />
            <Row icon={<PhoneIcon />} label="Telepon" text={item.telepon} />
            <Row icon={<TagIcon />} label="Harga" text={item.harga} />
            <Row icon={<ClockIcon />} label="Jam buka" text={item.jam_buka} />
          </dl>

          <Link
            href={`/webgis?id=${item.id}`}
            className="mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-light"
          >
            Lihat di Peta WebGIS
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Lightbox: foto dalam ukuran penuh, dibuka saat gambar di atas
          diklik (cursor-zoom-in). Sebelumnya state `lightboxOpen` &
          penanganan Escape untuk menutupnya sudah ada, tapi tampilan
          overlay-nya sendiri belum pernah dibuat — jadi klik foto tidak
          terjadi apa-apa. Ini melengkapi bagian yang hilang itu. */}
      {lightboxOpen && currentPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${item.nama}`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(false);
            }}
            aria-label="Tutup foto"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>

          {hasMultiplePhotos && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Foto sebelumnya"
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M12 5l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Foto berikutnya"
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/40 text-paper backdrop-blur-sm transition-colors hover:bg-ink/60"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M8 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
                {photos.map((url, idx) => (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPhoto(idx);
                    }}
                    aria-label={`Lihat foto ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activePhoto ? "w-5 bg-paper" : "w-1.5 bg-paper/50 hover:bg-paper/75"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentPhoto}
            src={currentPhoto}
            alt={item.nama}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full cursor-zoom-out object-contain animate-[fadeIn_0.15s_ease-out]"
          />
        </div>
      )}
    </div>
  );
}

function Row({ icon, label, text }) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-ink/40">{icon}</span>
      <span>
        <span className="mr-1 text-ink/45">{label}:</span>
        <span className="break-words text-ink/75">{text}</span>
      </span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10z" />
      <circle cx="10" cy="8" r="2" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M4 4l3 1 1 3-2 2c1 2.5 2.5 4 5 5l2-2 3 1 1 3c-6 2-13-5-13-13z" strokeLinejoin="round" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <path d="M10 3h5a2 2 0 012 2v5l-8 8-7-7z" strokeLinejoin="round" />
      <circle cx="13.5" cy="6.5" r="1" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" strokeLinecap="round" />
    </svg>
  );
}
