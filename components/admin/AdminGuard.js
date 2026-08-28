"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminGuard({ children, onSession }) {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | ok | denied

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("denied");
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data?.session) {
        onSession?.(data.session.user);
        setStatus("ok");
      } else {
        setStatus("denied");
        router.replace("/login");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        onSession?.(session.user);
        setStatus("ok");
      } else {
        setStatus("denied");
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">
        Memeriksa sesi login...
      </div>
    );
  }

  if (status === "denied") {
    if (!isSupabaseConfigured) {
      return (
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">
            Supabase belum dikonfigurasi. Lengkapi <code>.env.local</code>{" "}
            agar halaman admin dapat digunakan.
          </p>
        </div>
      );
    }
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink/50">
        Mengalihkan ke halaman login...
      </div>
    );
  }

  return children;
}
