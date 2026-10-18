"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

/**
 * Experience section — Interactive Engineering Journey Map.
 *
 * Timeline nodes become pulsing orbs with accent glow.
 * Animated "data packets" travel between nodes on the connecting line.
 * Tech stack chips stagger in. The timeline line has an animated gradient.
 */

const ROLE_STACKS: Record<string, string[]> = {
  "Senior Software Engineer": ["Go", "MySQL", "Redis", "OpenTelemetry", "Docker"],
  "Software Engineer": ["Node.js", "MongoDB", "Redis", "ActiveMQ", "Vue", "PostgreSQL"],
  "Full-Stack Engineer — client project": ["NestJS", "React", "Stripe", "Socket.IO", "PostgreSQL"],
  "Full-Stack Developer (Trainee)": ["JavaScript", "React", "Redux", "Node.js", "Express", "MongoDB", "DSA"],
};

function TimelinePackets() {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-px overflow-hidden" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="absolute left-0 h-3 w-px bg-accent rounded-full"
          style={{
            animation: `packetTravelDown ${3 + i * 0.5}s linear infinite`,
            animationDelay: `${i * 1.2}s`,
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="Experience"
        title="Where the systems were built"
      />
      <ol className="relative border-l border-line pl-8">
        {/* Animated packets on the timeline line */}
        <TimelinePackets />

        {site.experience.map((job, i) => (
          <li key={`${job.role}-${job.period}`} className="relative pb-14 last:pb-0 group">
            {/* Pulsing orb node */}
            <span className="absolute -left-[37px] top-1.5 flex items-center justify-center" aria-hidden>
              <span className="absolute h-6 w-6 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300" />
              <span className="absolute h-4 w-4 rounded-full bg-accent/20 signal-pulse" />
              <span className="relative h-3 w-3 rounded-full border-2 border-accent bg-bg shadow-[0_0_12px_-2px_var(--t-accent)]" />
            </span>

            <Reveal delay={i * 0.06}>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                {job.period}
              </p>
              <h3 className="mt-2 font-display text-2xl text-ink group-hover:text-accent transition-colors duration-200">
                {job.role}
              </h3>
              <p className="mt-1 font-mono text-xs text-muted">{job.org}</p>

              {/* Tech stack chips */}
              {ROLE_STACKS[job.role] && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {ROLE_STACKS[job.role].map((tech, j) => (
                    <li
                      key={tech}
                      className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted transition-all duration-200 hover:border-accent hover:text-accent"
                      style={{
                        animationDelay: `${j * 0.05}s`,
                      }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}

              <ul className="mt-4 flex max-w-[70ch] flex-col gap-3">
                {job.points.map((pt) => (
                  <li key={pt.slice(0, 40)} className="flex gap-3 text-ink/90">
                    <span className="text-accent shrink-0" aria-hidden>
                      —
                    </span>
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>

      {/* CSS for timeline packet animation */}
      <style jsx>{`
        @keyframes packetTravelDown {
          0% {
            top: -4%;
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
