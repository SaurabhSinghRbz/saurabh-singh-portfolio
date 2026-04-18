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
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Command Center"
          title="Explore the terminal"
          lede="A live session into my engineering world. 50+ commands, 6 themes, real system data. Type 'help' to begin."
        />

        {/* Terminal + sidebar layout */}
        <div className="flex w-full items-start gap-5">
          {/* Terminal — takes up most space */}
          <div className="min-w-0 flex-1">
            <HeroTerminal />
          </div>

          {/* Sidebar widgets — desktop only */}
          <div className="hidden shrink-0 flex-col gap-4 xl:flex" style={{ width: 220 }}>
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
