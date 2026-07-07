import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Journey() {
  return (
    <section id="education" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <SectionHeading
          eyebrow="Education"
          title="Slope beats intercept"
          lede="Where I started matters less than the rate I've compounded since. The credentials are here — the slope is the rest of this site."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {site.education.map((e, i) => (
            <Reveal key={e.title} delay={i * 0.04}>
              <div className="h-full rounded-lg border border-line bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{e.year}</p>
                <h3 className="mt-2 font-display text-lg text-ink">{e.title}</h3>
                <p className="mt-1 font-mono text-xs text-muted">{e.org}</p>
                <p className="mt-3 text-sm text-muted">{e.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
