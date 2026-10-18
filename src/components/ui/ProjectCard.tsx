import Link from "next/link";
import { FiArrowUpRight, FiExternalLink } from "react-icons/fi";
import type { CaseStudy } from "@/content/case-studies";
import TechIcon from "@/components/icons/TechIcon";
import FlowStrip from "@/components/ui/FlowStrip";

const STACK_SHOWN = 6;

/**
 * One project on the home page and on /work. The whole card is a link to the
 * case study (stretched link), with an always-visible "Read case study" button
 * so the affordance never depends on hover — touch screens have none. Live
 * links sit above the stretched link and stay independently clickable.
 */
export default function ProjectCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const extra = cs.stack.length - STACK_SHOWN;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-line-2 hover-glow motion-reduce:hover:translate-y-0">
      {/* Accent rule that draws across the top on hover/focus */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent via-accent to-transparent transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100"
      />

      <Link
        href={`/work/${cs.slug}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Read case study: ${cs.title}`}
      />

      <div className="pointer-events-none relative flex-1 p-5 sm:p-7">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-xs text-accent tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-6 bg-line-2" aria-hidden />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{cs.eyebrow}</p>
          <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] text-muted sm:ml-auto">
            {cs.duration}
          </span>
        </div>

        <h3 className="mt-4 font-display text-2xl leading-tight text-ink text-balance transition-colors duration-200 group-hover:text-accent sm:text-[1.75rem]">
          {cs.title}
        </h3>
        <p className="mt-3 max-w-[70ch] text-[15px] leading-relaxed text-muted">{cs.oneLiner}</p>

        {/* Real figures */}
        <dl className="mt-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-bg/40">
          {cs.highlights.map((h) => (
            <div key={h.label} className="px-3 py-3 text-center sm:px-4">
              <dt className="sr-only">{h.label}</dt>
              <dd>
                <span className="block font-display text-xl text-ink sm:text-2xl">{h.value}</span>
                <span className="mt-0.5 block font-mono text-[9.5px] uppercase leading-tight tracking-[0.12em] text-muted sm:text-[10px]">
                  {h.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        {/* System flow */}
        <div className="mt-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">How it flows</p>
          <FlowStrip nodes={cs.flow} />
        </div>

        {/* Stack */}
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {cs.stack.slice(0, STACK_SHOWN).map((s) => (
            <li
              key={s}
              className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              <TechIcon name={s} className="h-3 w-3" />
              {s}
            </li>
          ))}
          {extra > 0 && (
            <li className="rounded-full border border-dashed border-line px-2.5 py-1 font-mono text-[11px] text-muted">
              +{extra} more
            </li>
          )}
        </ul>
      </div>

      {/* Footer: live links (clickable on their own) + the explicit CTA */}
      <div className="pointer-events-none relative flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        {cs.liveLinks ? (
          <div className="pointer-events-auto relative z-10 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted">live</span>
            {cs.liveLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-ink/80 transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                {l.label}
                <FiExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ))}
          </div>
        ) : (
          <span />
        )}

        <span
          aria-hidden
          className="pointer-events-none inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-accent/60 bg-accent/10 px-4 py-2.5 font-mono text-xs font-semibold text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-contrast"
        >
          Read case study
          <FiArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
