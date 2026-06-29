import { site } from "@/content/site";

export default function Footer() {
  return (
    <footer className="relative border-t border-line overflow-hidden">
      {/* Subtle gradient line at the top */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--t-accent), transparent)",
          opacity: 0.4,
        }}
        aria-hidden
      />

      <div
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 pt-8"
        style={{ paddingBottom: "calc(6.5rem + env(safe-area-inset-bottom))" }}
      >
        <p className="font-display text-sm text-muted italic">
          &ldquo;{site.mission}&rdquo;
        </p>
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} {site.name} · built with Next.js, R3F &amp;
          a perf budget
        </p>
      </div>
    </footer>
  );
}
