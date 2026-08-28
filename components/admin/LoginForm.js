"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithUsername } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    const { error: loginError } = await loginWithUsername(username, password);
    setLoading(false);

    if (loginError) {
      setError(loginError);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-ink/10 bg-white/70 p-6 shadow-sm"
    >
      {!isSupabaseConfigured && (
        <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs text-clay">
          Supabase belum dikonfigurasi. Lengkapi <code>.env.local</code>{" "}
          terlebih dahulu agar login berfungsi.
        </p>
      )}

      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="mis. admin"
          className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/60"
        >
          Kata Sandi
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 pr-16 text-sm text-ink placeholder:text-ink/35 focus:border-forest focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-forest hover:underline"
          >
            {showPassword ? "Sembunyikan" : "Lihat"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-medium text-clay">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-forest px-4 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-xs text-ink/45">
        Khusus perangkat Desa Sukorejo. Hubungi admin sistem jika belum
        memiliki akun.
      </p>
    </form>
  );
}
