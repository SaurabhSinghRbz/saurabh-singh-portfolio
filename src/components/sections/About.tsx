import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

/* Quick facts for the profile card — kept in sync with site.ts. */
const FACTS: { label: string; value: string }[] = [
  { label: "Based in", value: "Bengaluru, India · IST" },
  { label: "Currently", value: "Gift-card platform (Go) @ Pine Labs" },
  { label: "Focus", value: "Payments · distributed systems · platform" },
  { label: "Open to", value: site.availability },
];

const CARD_STATS: { value: string; label: string }[] = [
  { value: "4 yrs", label: "in production" },
  { value: "4", label: "systems owned" },
  { value: "3", label: "apps solo" },
];

export default function About() {
  return (
    <section id="about" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="About"
          title="Four years inside the machinery of money"
          lede="Senior engineer for payments and distributed systems. I design and operate the infrastructure that moves money — the queues, activations and gift-card platforms that simply cannot fail — and I own it from the design doc to the 3 a.m. page."
        />

        <div className="grid gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12">
          {/* ---------- Narrative ---------- */}
          <div className="flex max-w-[62ch] flex-col gap-5">
            {site.about.map((p, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className={i === 0 ? "text-lg leading-relaxed text-ink" : "leading-relaxed text-ink/85"}>
                  {p}
                </p>
              </Reveal>
            ))}

            {/* Mission pull-quote */}
            <Reveal delay={0.1}>
              <blockquote className="mt-2 border-l-2 border-accent pl-5">
                <p className="font-display text-xl italic leading-snug text-ink">
                  &ldquo;{site.mission}&rdquo;
                </p>
                <footer className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
                  — how I measure my own work
                </footer>
              </blockquote>
            </Reveal>
          </div>

          {/* ---------- Profile card ---------- */}
          <aside>
            <Reveal delay={0.08}>
              <div className="glass-panel-strong rounded-2xl p-6 lg:sticky lg:top-28">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line-2 bg-surface-2 font-display text-2xl text-accent">
                    S.
                  </span>
                  <div>
                    <p className="font-display text-lg text-ink">{site.name}</p>
                    <p className="font-mono text-[11px] text-muted">{site.role} · Pine Labs</p>
                  </div>
                </div>

                {/* Facts */}
                <dl className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
                  {FACTS.map((f) => (
                    <div key={f.label} className="grid grid-cols-[84px_1fr] gap-3">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{f.label}</dt>
                      <dd className="text-[13px] leading-snug text-ink/90">{f.value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Mini stats */}
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-6">
                  {CARD_STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="font-display text-xl text-ink">{s.value}</p>
                      <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Links */}
                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-6">
                  <a
                    href={site.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-md border border-line px-3 py-2 text-center font-mono text-[11px] text-muted transition-colors duration-150 hover:border-accent hover:text-ink"
                  >
                    GitHub ↗
                  </a>
                  <a
                    href={site.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-md border border-line px-3 py-2 text-center font-mono text-[11px] text-muted transition-colors duration-150 hover:border-accent hover:text-ink"
                  >
                    LinkedIn ↗
                  </a>
                  <a
                    href={site.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-md bg-accent px-3 py-2 text-center font-mono text-[11px] font-semibold text-accent-contrast transition-colors duration-150 hover:bg-accent-hi"
                  >
                    Download résumé
                  </a>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* ---------- What I bring ---------- */}
        <div className="mt-20">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                What I bring to a team
              </h3>
              <span className="h-px flex-1 bg-line" />
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {site.principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="glass-panel h-full rounded-xl p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface-2 font-mono text-sm text-accent">
                    {i + 1}
                  </div>
                  <h4 className="font-display text-base leading-snug text-ink">{p.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
