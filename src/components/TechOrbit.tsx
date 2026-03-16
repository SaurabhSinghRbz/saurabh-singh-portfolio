"use client";

import TechIcon from "@/components/icons/TechIcon";

/**
 * Tech stack as an orbital system: three rings of brand icons circling
 * the "S." core at different speeds — systems in motion, not a logo wall.
 * Hovering a ring pauses it; icons counter-rotate to stay upright.
 * Reduced motion (via CSS) freezes the orbits into a static radial map.
 */
const RINGS: { radius: number; duration: number; reverse?: boolean; items: string[] }[] = [
  { radius: 17, duration: 26, items: ["TypeScript", "JavaScript", "Go"] },
  {
    radius: 31,
    duration: 44,
    reverse: true,
    items: ["Node.js", "NestJS", "PostgreSQL", "MySQL", "MongoDB", "Redis"],
  },
  {
    radius: 45,
    duration: 66,
    items: ["React", "Vue", "Next.js", "Tailwind", "Docker", "Stripe", "Socket.IO", "GCP"],
  },
];

export default function TechOrbit() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[430px] select-none"
      role="img"
      aria-label="Technology stack orbiting: TypeScript, JavaScript and Go at the core; Node.js, NestJS, PostgreSQL, MySQL, MongoDB and Redis in the middle ring; React, Vue, Next.js, Tailwind, Docker, Stripe, Socket.IO and GCP in the outer ring."
    >
      {/* Core */}
      <div className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line-2 bg-surface shadow-[0_0_50px_-8px_var(--t-accent)]">
        <span className="font-display text-2xl text-accent">S.</span>
      </div>

      {RINGS.map((ring) => (
        <div key={ring.radius} className="orbit-ring group absolute inset-0">
          {/* Ring track */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line transition-colors duration-200 group-hover:border-line-2"
            style={{ width: `${ring.radius * 2}%`, height: `${ring.radius * 2}%` }}
            aria-hidden
          />
          {/* Rotating layer */}
          <div
            className={`orbit-spin absolute inset-0 ${ring.reverse ? "orbit-reverse" : ""}`}
            style={{ animationDuration: `${ring.duration}s` }}
          >
            {ring.items.map((name, i) => {
              const theta = ((360 / ring.items.length) * i * Math.PI) / 180;
              const x = 50 + ring.radius * Math.cos(theta);
              const y = 50 + ring.radius * Math.sin(theta);
              return (
                <div
                  key={name}
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  {/* Counter-rotation keeps icons upright */}
                  <div
                    className={`orbit-spin ${ring.reverse ? "" : "orbit-reverse"} -ml-5 -mt-5`}
                    style={{ animationDuration: `${ring.duration}s` }}
                  >
                    <div
                      className="tech-node flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted"
                      title={name}
                    >
                      <TechIcon name={name} className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
