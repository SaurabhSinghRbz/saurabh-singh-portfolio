import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { caseStudies } from "@/content/case-studies";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import TechIcon from "@/components/icons/TechIcon";
import MiniArchFlow from "@/components/ui/MiniArchFlow";
import LiveMetrics from "@/components/ui/LiveMetrics";

/** Architecture nodes per case study slug */
const ARCH_NODES: Record<string, { label: string; sub?: string }[]> = {
  "b2b-queue-consumer": [
    { label: "Producers", sub: "client services" },
    { label: "Broker", sub: "ActiveMQ" },
    { label: "Workers", sub: "consumer pool" },
    { label: "Tracking", sub: "MongoDB" },
    { label: "Ops Console", sub: "Vue · RBAC" },
  ],
  delivery: [
    { label: "Send API", sub: "channel-agnostic" },
    { label: "Provider", sub: "email · SMS · WA" },
    { label: "Templates", sub: "Handlebars" },
    { label: "Tracking", sub: "PostgreSQL" },
  ],
  "woohoo-card": [
    { label: "Order API", sub: "Go · chi" },
    { label: "State Machine", sub: "lifecycle" },
    { label: "Provider", sub: "card network" },
    { label: "MySQL", sub: "R/W split" },
    { label: "Redis", sub: "hot cache" },
  ],
  smoothpay: [
    { label: "QR Scan", sub: "customer app" },
    { label: "API", sub: "NestJS" },
    { label: "Payments", sub: "Stripe" },
    { label: "Dashboard", sub: "merchant" },
  ],
};

export default function CaseStudies() {
  return (
    <section id="work" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading
          eyebrow="Case studies · production systems"
          title="Systems, told as decisions"
          lede="Four systems from four years of production work — queue platform, notification backbone, gift-card core, and a payments platform built solo. Problem → constraints → architecture → trade-offs → outcome."
        />
        <div className="flex flex-col gap-6">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.slug} delay={i * 0.05}>
              <TiltCard>
                <div className="group relative rounded-xl border border-line bg-surface p-7 transition-all duration-200 hover:border-line-2 hover:bg-surface-2 hover-glow">
                  {/* Whole card navigates to the case study… */}
                  <Link
                    href={`/work/${cs.slug}`}
                    className="absolute inset-0 z-0 rounded-xl"
                    aria-label={`Read case study: ${cs.title}`}
                  />

                  <div className="pointer-events-none relative">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                        {cs.eyebrow}
                      </p>
                      <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">
                        {cs.duration}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-2xl text-ink transition-colors duration-150 group-hover:text-accent">
                      {cs.title}
                      <span
                        className="ml-2 inline-block transition-transform duration-200 group-hover:translate-x-1.5"
                        aria-hidden
                      >
                        →
                      </span>
                    </h3>
                    <p className="mt-2 max-w-[72ch] text-muted">{cs.oneLiner}</p>
                    {cs.clients && (
                      <p className="mt-3 text-sm text-ink/80">
                        <span className="font-mono text-xs uppercase tracking-wide text-muted">
                          in production for ·{" "}
                        </span>
                        {cs.clients}
                      </p>
                    )}

                    {/* Mini architecture diagram */}
                    {ARCH_NODES[cs.slug] && (
                      <div className="mt-5 rounded-lg border border-line bg-bg/50 p-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted mb-2">
                          Architecture
                        </p>
                        <MiniArchFlow nodes={ARCH_NODES[cs.slug]} />
                      </div>
                    )}

                    {/* Live metrics simulation */}
                    <div className="mt-4">
                      <LiveMetrics />
                    </div>

                    {/* Tech icons */}
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {cs.stack.map((s) => (
                        <li
                          key={s}
                          className="skill-chip flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted"
                          title={s}
                        >
                          <TechIcon name={s} className="h-3 w-3" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* …while live links stay independently clickable. */}
                  {cs.liveLinks && (
                    <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                        live ·
                      </span>
                      {cs.liveLinks.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 font-mono text-xs text-accent transition-colors duration-150 hover:border-accent hover:bg-surface"
                        >
                          {l.label}
                          <FiExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
