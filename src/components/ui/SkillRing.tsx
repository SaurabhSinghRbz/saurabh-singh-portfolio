"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { skillTier } from "@/content/skill-proficiency";
import TechIcon from "@/components/icons/TechIcon";

/* ------------------------------------------------------------------ *
 * SkillRing — a THREE-segment level gauge (not a percentage). The
 * ring is split into three discrete arcs; the number filled equals the
 * proficiency tier (Core = 3, Strong = 2, Proficient = 1), and the
 * tier is always spelled out below so the level never rides on colour
 * or a made-up number alone. Segments draw in on scroll.
 * ------------------------------------------------------------------ */

const CX = 40;
const CY = 40;
const R = 33;
const GAP = 26; // degrees of gap between the three arcs

function polar(deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}
function arcPath(startDeg: number, endDeg: number) {
  const s = polar(startDeg);
  const e = polar(endDeg);
  const large = endDeg - startDeg <= 180 ? 0 : 1;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

/** three arcs, each spanning (120 − GAP) degrees */
const SEGMENTS = [0, 1, 2].map((i) => arcPath(i * 120 + GAP / 2, (i + 1) * 120 - GAP / 2));

export default function SkillRing({
  name,
  score,
  years,
  delay = 0,
}: {
  name: string;
  score: number;
  years: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const tier = skillTier(score);

  return (
    <div ref={ref} className="group flex flex-col items-center gap-2.5">
      <div className="relative h-[92px] w-[92px]">
        <svg viewBox="0 0 80 80" className="h-full w-full">
          {SEGMENTS.map((d, i) => {
            const filled = i < tier.level;
            return (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke={filled ? "var(--t-accent)" : "var(--t-line-2)"}
                strokeWidth={5}
                strokeLinecap="round"
                initial={{ pathLength: filled ? 0 : 1 }}
                animate={inView || reduced ? { pathLength: 1 } : { pathLength: filled ? 0 : 1 }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay + i * 0.12, ease: "easeOut" }}
                style={filled ? { filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--t-accent) 45%, transparent))" } : undefined}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <TechIcon name={name} className="h-7 w-7 transition-transform duration-200 group-hover:scale-110" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-[12px] font-medium text-ink">{name}</p>
        <p className="font-mono text-[10px] text-accent">
          {tier.label} <span className="text-muted">· {years}y</span>
        </p>
      </div>
    </div>
  );
}
