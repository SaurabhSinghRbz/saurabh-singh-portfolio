import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function HowIWork() {
  return (
    <section id="principles" className="mx-auto max-w-5xl px-6 py-24">
      <SectionHeading eyebrow="How I work" title="Three principles, each with receipts" />
      <div className="grid gap-4 md:grid-cols-3">
        {site.principles.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.05}>
            <div className="h-full rounded-lg border border-line bg-surface p-6">
              <h3 className="font-display text-xl text-ink">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
