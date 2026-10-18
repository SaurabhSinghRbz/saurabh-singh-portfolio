import Link from "next/link";
import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import Counter from "@/components/motion/Counter";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Impact() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Engineering impact"
        title="Numbers first, adjectives never"
        lede="Production figures from systems I built and run. Every card links to the case study behind it."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.impact.map((m, i) => (
          <Reveal key={m.label} delay={i * 0.05}>
            <TiltCard className="h-full">
              <Link
                href={m.href}
                className="block h-full rounded-lg border border-line bg-surface p-6 transition-colors duration-150 hover:border-line-2 hover:bg-surface-2"
              >
                <p className="font-mono text-3xl text-accent tabular-nums">
                  <Counter value={m.value} />
                  <span className="text-base text-muted"> {m.unit}</span>
                </p>
                <p className="mt-2 font-semibold text-ink">{m.label}</p>
                <p className="mt-2 text-sm text-muted">{m.detail}</p>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
