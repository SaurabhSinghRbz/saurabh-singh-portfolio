import { FiAward, FiGithub, FiExternalLink } from "react-icons/fi";
import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Academic() {
  return (
    <section id="academic" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading
        eyebrow="Academic projects"
        title="Where it started"
        lede={site.academics.note}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {site.academics.projects.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.03}>
            <div className="flex h-full flex-col rounded-lg border border-line bg-surface p-5">
              <h3 className="font-semibold text-ink">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{p.desc}</p>
              <div className="mt-4 flex gap-2 font-mono text-xs">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  <FiGithub className="h-3.5 w-3.5" aria-hidden />
                  code
                </a>
                <a
                  href={p.demo}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  <FiExternalLink className="h-3.5 w-3.5" aria-hidden />
                  live
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <h3 className="mt-14 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Certifications
      </h3>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {site.academics.certifications.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.03}>
            <a
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-start gap-3 rounded-lg border border-line bg-surface p-4 transition-colors duration-150 hover:border-accent"
            >
              <FiAward className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{c.issuer}</p>
                <p className="mt-1.5 font-mono text-[11px] text-muted/80">Issued {c.issued}</p>
                <p className="font-mono text-[11px] text-muted/80">ID {c.credentialId}</p>
              </div>
              <FiExternalLink
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted transition-colors duration-150 group-hover:text-accent"
                aria-hidden
              />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
