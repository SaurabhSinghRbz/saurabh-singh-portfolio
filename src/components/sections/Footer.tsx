import Link from "next/link";
import { site } from "@/content/site";

const LINKS = [
  { href: "/work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#academic", label: "Academic" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* Subtle gradient line at the top */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--t-accent), transparent)", opacity: 0.4 }}
        aria-hidden
      />

      <div
        className="mx-auto flex max-w-6xl flex-col gap-6 px-5 pt-10 sm:px-6 md:flex-row md:items-end md:justify-between"
        style={{ paddingBottom: "calc(2.5rem + env(safe-area-inset-bottom))" }}
      >
        <div>
          <p className="font-mono text-sm text-ink">
            saurabh<span className="text-accent">.</span>singh
          </p>
          <p className="mt-2 max-w-[48ch] font-display text-sm italic text-muted">&ldquo;{site.mission}&rdquo;</p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
            <a href={site.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
              GitHub ↗
            </a>
            <a href={site.linkedin} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">
              LinkedIn ↗
            </a>
          </nav>
          <p className="font-mono text-xs text-muted">
            © {new Date().getFullYear()} {site.name} · built with Next.js, R3F &amp; a perf budget
          </p>
        </div>
      </div>
    </footer>
  );
}
