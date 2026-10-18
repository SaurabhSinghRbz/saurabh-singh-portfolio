import type { Metadata } from "next";
import Link from "next/link";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Reveal from "@/components/motion/Reveal";
import ProjectCard from "@/components/ui/ProjectCard";

export const metadata: Metadata = {
  title: "Work — case studies",
  description:
    "Four production systems by Saurabh Singh: a 500+ TPS queue platform, the Woohoo delivery service, a Go gift-card core and the SmoothPay payments platform.",
  alternates: { canonical: "/work" },
};

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${site.name} — case studies`,
  itemListElement: caseStudies.map((cs, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${site.domain}/work/${cs.slug}`,
    name: cs.title,
  })),
};

export default function WorkIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <Nav />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        <Reveal>
          <Link href="/" className="font-mono text-xs text-muted hover:text-accent">
            ← home
          </Link>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-accent">Work</p>
          <h1 className="mt-3 max-w-[20ch] font-display text-4xl leading-[1.08] text-ink text-balance md:text-5xl">
            Four systems, each told as decisions
          </h1>
          <p className="mt-5 max-w-[62ch] text-lg text-muted">
            Queues, notifications, gift cards and payments — every one in production. Each case study walks the
            problem, the constraints, the architecture and the trade-offs, with animated diagrams of the real flows.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-col gap-6">
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.slug} delay={0.04 * i}>
              <ProjectCard cs={cs} index={i} />
            </Reveal>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted">
          Earlier, smaller builds live under{" "}
          <Link href="/#academic" className="text-accent hover:text-accent-hi">
            academic projects
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
