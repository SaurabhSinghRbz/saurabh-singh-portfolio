import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { caseStudies } from "@/content/case-studies";
import ArchDiagram from "@/components/ArchDiagram";
import QueueDeepDive from "@/components/queue/QueueDeepDive";
import DeliveryDeepDive from "@/components/delivery/DeliveryDeepDive";
import WoohooCardDeepDive from "@/components/woohoo/WoohooCardDeepDive";
import SmoothPayDeepDive from "@/components/smoothpay/SmoothPayDeepDive";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Reveal from "@/components/motion/Reveal";
import TechIcon from "@/components/icons/TechIcon";
import CaseStudyToc from "@/components/ui/CaseStudyToc";
import FlowStrip from "@/components/ui/FlowStrip";
import { site } from "@/content/site";
import type { CaseStudy } from "@/content/case-studies";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) return {};
  const url = `/work/${cs.slug}`;
  return {
    title: cs.title,
    description: cs.metaDescription,
    keywords: [
      "Saurabh Singh",
      `Saurabh Singh ${cs.title}`,
      "Saurabh Singh case study",
      ...cs.stack,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${cs.title} · ${cs.eyebrow}`,
      description: cs.oneLiner,
      url,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: cs.title, description: cs.oneLiner },
  };
}

/** TechArticle + breadcrumb schema so search engines and LLMs read each case
 *  study as an authored, attributed piece of work in a clear site hierarchy. */
function caseStudyJsonLd(cs: CaseStudy) {
  const url = `${site.domain}/work/${cs.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: cs.title,
        description: cs.oneLiner,
        url,
        image: `${url}/opengraph-image`,
        inLanguage: "en",
        author: { "@id": `${site.domain}/#person` },
        publisher: { "@id": `${site.domain}/#person` },
        about: cs.stack,
        keywords: cs.stack.join(", "),
        isPartOf: { "@id": `${site.domain}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.domain },
          { "@type": "ListItem", position: 2, name: "Work", item: `${site.domain}/work` },
          { "@type": "ListItem", position: 3, name: cs.title, item: url },
        ],
      },
    ],
  };
}

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-14 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent"
    >
      {children}
      <span aria-hidden className="h-px flex-1 bg-line" />
    </h2>
  );
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const index = caseStudies.findIndex((c) => c.slug === slug);
  if (index === -1) notFound();
  const cs = caseStudies[index];
  const prev = caseStudies[(index - 1 + caseStudies.length) % caseStudies.length];
  const next = caseStudies[(index + 1) % caseStudies.length];

  const toc = [
    { id: "problem", label: "Problem" },
    { id: "constraints", label: "Constraints" },
    { id: "architecture", label: "Architecture" },
    { id: "deep-dive", label: "Deep dive" },
    ...(cs.decisions.length > 0 ? [{ id: "decisions", label: "Decisions" }] : []),
    { id: "outcome", label: "Outcome" },
    ...(cs.differently ? [{ id: "differently", label: "In hindsight" }] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd(cs)) }}
      />
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        {/* ---------- Header ---------- */}
        <Reveal>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-xs text-muted">
            <Link href="/" className="hover:text-accent">
              home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/work" className="hover:text-accent">
              work
            </Link>
            <span aria-hidden>/</span>
            <span className="truncate text-ink/80">{cs.shortTitle}</span>
          </nav>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xs text-accent tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(caseStudies.length).padStart(2, "0")}
            </span>
            <span className="h-px w-6 bg-line-2" aria-hidden />
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{cs.eyebrow}</p>
          </div>
          <h1 className="mt-3 max-w-[24ch] font-display text-[2.1rem] leading-[1.08] text-ink text-balance sm:text-4xl md:text-5xl">
            {cs.title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-base text-muted sm:text-lg">{cs.oneLiner}</p>

          {/* Real figures */}
          <dl className="mt-8 grid max-w-3xl grid-cols-3 divide-x divide-line rounded-xl border border-line bg-surface">
            {cs.highlights.map((h) => (
              <div key={h.label} className="px-3 py-4 text-center sm:px-5">
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="block font-display text-2xl text-ink sm:text-3xl">{h.value}</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {h.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-14">
          <div className="min-w-0">
            <Reveal>
              <dl className="grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">Role</dt>
                  <dd className="mt-1 text-sm text-ink">{cs.role}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">Duration</dt>
                  <dd className="mt-1 text-sm text-ink">{cs.duration}</dd>
                </div>
                {cs.clients && (
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">In production for</dt>
                    <dd className="mt-1 text-sm text-ink">{cs.clients}</dd>
                  </div>
                )}
                {cs.liveLinks && (
                  <div className="sm:col-span-2">
                    <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">Live</dt>
                    <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {cs.liveLinks.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm text-accent hover:text-accent-hi"
                        >
                          {l.label} ↗
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                {cs.stack.map((s) => (
                  <li
                    key={s}
                    className="skill-chip flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted"
                  >
                    <TechIcon name={s} className="h-3 w-3" />
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-xl border border-line bg-surface/60 p-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  The system at a glance
                </p>
                <FlowStrip nodes={cs.flow} />
              </div>
            </Reveal>

            {/* Mobile / tablet jump bar */}
            <div className="sticky top-[61px] z-30 -mx-5 mt-8 border-y border-line bg-bg/90 py-2.5 backdrop-blur-xl sm:-mx-6 lg:hidden">
              <div className="px-5 sm:px-6">
                <CaseStudyToc items={toc} variant="chips" />
              </div>
            </div>

            <H id="problem">Problem</H>
            <p className="leading-relaxed text-ink/90">{cs.problem}</p>

            <H id="constraints">Constraints</H>
            <ul className="flex flex-col gap-2">
              {cs.constraints.map((c) => (
                <li key={c} className="flex gap-3 text-ink/90">
                  <span className="shrink-0 text-accent" aria-hidden>
                    —
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <H id="architecture">Architecture</H>
            <p className="mb-6 leading-relaxed text-ink/90">{cs.architecture}</p>
            {cs.hasDiagram && <ArchDiagram />}

            <div id="deep-dive" data-anchor>
              {cs.slug === "b2b-queue-consumer" && <QueueDeepDive />}
              {cs.slug === "delivery" && <DeliveryDeepDive />}
              {cs.slug === "woohoo-card" && <WoohooCardDeepDive />}
              {cs.slug === "smooth" && <SmoothPayDeepDive />}
            </div>

            {cs.decisions.length > 0 && (
              <>
                <H id="decisions">Decisions &amp; trade-offs</H>
                <div className="flex flex-col gap-4">
                  {cs.decisions.map((d, i) => (
                    <Reveal key={d.question}>
                      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
                        <p className="font-mono text-[10px] text-accent">Q{i + 1}</p>
                        <h3 className="mt-1 font-display text-lg text-ink">{d.question}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{d.answer}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </>
            )}

            <H id="outcome">Outcome</H>
            <ul className="flex flex-col gap-2">
              {cs.outcome.map((o) => (
                <li key={o} className="flex gap-3 text-ink/90">
                  <span className="shrink-0 text-good" aria-hidden>
                    ✓
                  </span>
                  {o}
                </li>
              ))}
            </ul>

            {cs.differently && (
              <>
                <H id="differently">What I&apos;d do differently</H>
                <p className="leading-relaxed text-ink/90">{cs.differently}</p>
              </>
            )}

            {cs.footnote && <p className="mt-14 border-l-2 border-accent pl-4 text-sm text-muted">{cs.footnote}</p>}

            {/* ---------- Prev / next ---------- */}
            <nav aria-label="More case studies" className="mt-16 grid gap-3 sm:grid-cols-2">
              <Link
                href={`/work/${prev.slug}`}
                className="group rounded-xl border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent"
              >
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  <FiArrowLeft aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Previous
                </span>
                <span className="mt-2 block font-display text-lg text-ink group-hover:text-accent">
                  {prev.shortTitle}
                </span>
              </Link>
              <Link
                href={`/work/${next.slug}`}
                className="group rounded-xl border border-line bg-surface p-5 text-right transition-colors duration-150 hover:border-accent"
              >
                <span className="flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Next
                  <FiArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-2 block font-display text-lg text-ink group-hover:text-accent">
                  {next.shortTitle}
                </span>
              </Link>
            </nav>
            <p className="mt-6 text-center">
              <Link href="/work" className="font-mono text-xs text-muted hover:text-accent">
                all work →
              </Link>
            </p>
          </div>

          <aside className="hidden lg:block">
            <CaseStudyToc items={toc} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
