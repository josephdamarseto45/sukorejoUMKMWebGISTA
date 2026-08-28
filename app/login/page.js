import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Login Admin | Desa Wisata Sukorejo"
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--navbar-h,64px))] items-center justify-center bg-contour px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest text-gold font-display text-base font-semibold">
            DS
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-forest">
            Login Perangkat Desa
          </h1>
          <p className="mt-1.5 text-sm text-ink/60">
            Masuk untuk mengelola data UMKM &amp; Wisata pada WebGIS Desa
            Sukorejo.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
