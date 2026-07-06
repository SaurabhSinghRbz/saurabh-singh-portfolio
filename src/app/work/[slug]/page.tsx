import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
    description: cs.oneLiner,
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

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
      {children}
    </h2>
  );
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const cs = caseStudies.find((c) => c.slug === slug);
  if (!cs) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <Reveal>
        <Link href="/#work" className="font-mono text-xs text-muted hover:text-accent">
          ← all work
        </Link>
        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-accent">{cs.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl leading-[1.08] text-ink text-balance">
          {cs.title}
        </h1>
        <p className="mt-5 text-lg text-muted">{cs.oneLiner}</p>

        <dl className="mt-8 grid gap-4 rounded-lg border border-line bg-surface p-6 sm:grid-cols-2">
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
              <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">
                In production for
              </dt>
              <dd className="mt-1 text-sm text-ink">{cs.clients}</dd>
            </div>
          )}
          {cs.liveLinks && (
            <div className="sm:col-span-2">
              <dt className="font-mono text-[11px] uppercase tracking-wide text-muted">Live</dt>
              <dd className="mt-1 flex flex-wrap gap-4">
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

        <ul className="mt-5 flex flex-wrap gap-2">
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
        </Reveal>

        <H>Problem</H>
        <p className="text-ink/90 leading-relaxed">{cs.problem}</p>

        <H>Constraints</H>
        <ul className="flex flex-col gap-2">
          {cs.constraints.map((c) => (
            <li key={c} className="flex gap-3 text-ink/90">
              <span className="text-accent shrink-0" aria-hidden>—</span>
              {c}
            </li>
          ))}
        </ul>

        <H>Architecture</H>
        <p className="mb-6 text-ink/90 leading-relaxed">{cs.architecture}</p>
        {cs.hasDiagram && <ArchDiagram />}

        {cs.slug === "b2b-queue-consumer" && <QueueDeepDive />}
        {cs.slug === "delivery" && <DeliveryDeepDive />}
        {cs.slug === "woohoo-card" && <WoohooCardDeepDive />}
        {cs.slug === "smoothpay" && <SmoothPayDeepDive />}

        {cs.decisions.length > 0 && (
          <>
            <H>Decisions & trade-offs</H>
            <div className="flex flex-col gap-4">
              {cs.decisions.map((d) => (
                <div key={d.question} className="rounded-lg border border-line bg-surface p-6">
                  <h3 className="font-display text-lg text-ink">{d.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d.answer}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <H>Outcome</H>
        <ul className="flex flex-col gap-2">
          {cs.outcome.map((o) => (
            <li key={o} className="flex gap-3 text-ink/90">
              <span className="text-good shrink-0" aria-hidden>✓</span>
              {o}
            </li>
          ))}
        </ul>

        {cs.differently && (
          <>
            <H>What I&apos;d do differently</H>
            <p className="text-ink/90 leading-relaxed">{cs.differently}</p>
          </>
        )}

        {cs.footnote && (
          <p className="mt-14 border-l-2 border-accent pl-4 text-sm text-muted">{cs.footnote}</p>
        )}
      </main>
      <Footer />
    </>
  );
}
