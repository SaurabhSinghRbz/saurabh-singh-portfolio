import SectionHeading from "@/components/ui/SectionHeading";
import HeroTerminal from "@/components/terminal/HeroTerminal";
import SystemStatus from "@/components/ui/SystemStatus";
import ThroughputGraph from "@/components/ui/ThroughputGraph";
import Reveal from "@/components/motion/Reveal";

/* ------------------------------------------------------------------ *
 * Console — Full-hero immersive terminal experience.
 * Terminal on the left (flex-1), system widgets on the right (desktop).
 * ------------------------------------------------------------------ */

export default function Console() {
  return (
    <section id="console" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Command Center"
          title="Explore the terminal"
          lede="A live session into my engineering world. 50+ commands, 6 themes, my real projects and stack. Type 'help' to begin. The side widgets are illustrative, not live telemetry."
        />

        {/* Terminal + sidebar layout — stacks on mobile, sidebar on desktop */}
        <div className="flex w-full flex-col items-stretch gap-5 xl:flex-row xl:items-stretch">
          {/* Terminal — takes up most space */}
          <div className="min-w-0 flex-1">
            <HeroTerminal />
          </div>

          {/* System widgets — side by side on mobile, stacked sidebar on desktop */}
          <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:flex xl:w-55 xl:flex-col">
            <Reveal delay={0.2} mode="fade-up">
              <SystemStatus />
            </Reveal>
            <Reveal delay={0.4} mode="fade-up">
              <ThroughputGraph />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
