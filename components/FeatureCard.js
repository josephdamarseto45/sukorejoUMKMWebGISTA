import Link from "next/link";

export default function FeatureCard({ href, eyebrow, title, description, icon }) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/10 bg-white/40 p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-forest/10"
    >
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-gold">
          {icon}
        </div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-clay">
          {eyebrow}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-semibold text-forest">
          {title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-ink/65">
          {description}
        </p>
      </div>
      <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-forest">
        Buka halaman
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 10h12M11 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
