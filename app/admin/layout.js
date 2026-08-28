"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";
import { logout } from "@/lib/auth";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <AdminGuard onSession={setUser}>
      <div className="min-h-[calc(100dvh-var(--navbar-h,64px))] bg-paper">
        <div className="border-b border-ink/10 bg-forest/5">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-forest/70">
                Panel Admin
              </p>
              <h1 className="font-display text-xl font-semibold text-forest">
                Kelola Data UMKM &amp; Wisata
              </h1>
              {user?.email && (
                <p className="mt-0.5 text-xs text-ink/50">
                  Masuk sebagai {user.email}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/webgis"
                className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-white"
              >
                Lihat Peta
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full bg-clay px-4 py-2 text-xs font-semibold text-paper transition-colors hover:bg-clay-light disabled:opacity-60"
              >
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">{children}</div>
      </div>
    </AdminGuard>
  );
}
