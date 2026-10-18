import Link from "next/link";
import { caseStudies } from "@/content/case-studies";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ProjectCard from "@/components/ui/ProjectCard";

export default function CaseStudies() {
  return (
    <section id="work" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Case studies · production systems"
          title="Systems, told as decisions"
          lede="Four systems from four years of production work — queue platform, notification backbone, gift-card core, and a payments platform owned end to end. Open any card for the full story: problem → constraints → architecture → trade-offs → outcome, with animated flow diagrams."
        />

        {/* Quick index — jump straight to a case study */}
        <nav aria-label="Case studies" className="-mt-4 mb-8 flex flex-wrap gap-2">
          {caseStudies.map((cs, i) => (
            <Link
              key={cs.slug}
              href={`/work/${cs.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] text-muted transition-colors duration-150 hover:border-accent hover:text-ink"
            >
              <span className="text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {cs.shortTitle}
              <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.slug} delay={(i % 2) * 0.06} className="h-full [&>article]:h-full">
              <ProjectCard cs={cs} index={i} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 rounded-md border border-line-2 px-5 py-2.5 font-mono text-xs text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            All work, side by side →
          </Link>
        </div>
      </div>
    </section>
  );
}
