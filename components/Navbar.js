"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/webgis", label: "Peta WebGIS" },
  { href: "/katalog/wisata", label: "Katalog Wisata" },
  { href: "/katalog/umkm", label: "Katalog UMKM" }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef(null);

  // Ukur tinggi Navbar sesungguhnya (termasuk padding/border, dan saat menu
  // mobile terbuka) lalu simpan sebagai CSS var --navbar-h, supaya layout
  // yang memakai `calc(100dvh - var(--navbar-h))` (mis. section peta WebGIS)
  // tidak meleset dan menyebabkan halaman ikut discroll.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const setVar = () =>
      document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
    setVar();
    const observer = new ResizeObserver(setVar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-gold font-display text-sm font-semibold">
            DS
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-forest">
            Desa Wisata Sukorejo
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest text-paper"
                    : "text-ink/70 hover:bg-forest/10 hover:text-forest"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu navigasi"
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
            <span className="block h-0.5 w-5 bg-ink" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink/10 px-5 pb-4 pt-2 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                pathname === link.href
                  ? "bg-forest text-paper"
                  : "text-ink/70 hover:bg-forest/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
