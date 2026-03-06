"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  skillProficiency,
  skillTier,
  TIER_LEGEND,
  type SkillProficiency,
} from "@/content/skill-proficiency";
import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";
import SectionHeading from "@/components/ui/SectionHeading";
import SkillRing from "@/components/ui/SkillRing";
import TechIcon from "@/components/icons/TechIcon";

/* Curated core stack — reflects the brand (payments / distributed systems),
 * not just the highest numbers. */
const SIGNATURE = ["Go", "Node.js", "TypeScript", "React", "PostgreSQL", "Redis"];

const CATEGORY_ORDER = ["All", "Backend", "Frontend", "Data", "DevOps", "Cloud", "Payments"] as const;

/* Friendlier labels for the filter pills. */
const CATEGORY_LABEL: Record<string, string> = {
  All: "All",
  Backend: "Backend",
  Frontend: "Frontend",
  Data: "Data & Queues",
  DevOps: "DevOps",
  Cloud: "Cloud",
  Payments: "Payments",
};

/** Three discrete segments; `level` of them are lit. Level is always
 *  paired with the tier label text, so it never rides on colour alone. */
function LevelSegments({ level }: { level: number }) {
  return (
    <div className="flex gap-1" aria-hidden>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="h-1.5 w-6 rounded-full transition-colors"
          style={{ background: n <= level ? "var(--t-accent)" : "var(--t-line-2)" }}
        />
      ))}
    </div>
  );
}

function SkillCard({ skill }: { skill: SkillProficiency }) {
  const tier = skillTier(skill.confidenceScore);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel group flex flex-col gap-3 rounded-xl p-4 transition-colors duration-200 hover:border-accent/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface-2">
            <TechIcon name={skill.name} className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] font-semibold text-ink">{skill.name}</p>
            <p className="font-mono text-[10px] text-muted">{skill.category}</p>
          </div>
        </div>
        {/* honest tier, not a percentage */}
        <span className="shrink-0 font-mono text-[11px] font-medium text-accent">{tier.label}</span>
      </div>

      <LevelSegments level={tier.level} />

      <div className="flex items-center justify-between font-mono text-[10px]">
        <span className="text-muted">
          {skill.yearsExperience}y · {skill.projectsDelivered} live {skill.projectsDelivered === 1 ? "system" : "systems"}
        </span>
        {skill.productionUsage && (
          <span className="flex items-center gap-1 text-good">
            <span className="h-1.5 w-1.5 rounded-full bg-good" /> production
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  const [filter, setFilter] = useState<string>("All");

  const domains = useMemo(() => new Set(skillProficiency.map((s) => s.category)).size, []);
  const coreCount = useMemo(
    () => skillProficiency.filter((s) => skillTier(s.confidenceScore).level === 3).length,
    [],
  );

  const signature = useMemo(
    () =>
      SIGNATURE.map((n) => skillProficiency.find((s) => s.name === n)).filter(
        (s): s is SkillProficiency => Boolean(s),
      ),
    [],
  );

  const filtered = useMemo(() => {
    const list = filter === "All" ? skillProficiency : skillProficiency.filter((s) => s.category === filter);
    return [...list].sort((a, b) => b.confidenceScore - a.confidenceScore);
  }, [filter]);

  const stats = [
    { value: `${skillProficiency.length}`, label: "technologies" },
    { value: "4+", label: "years shipping" },
    { value: `${domains}`, label: "engineering domains" },
    { value: `${coreCount}`, label: "at core level" },
  ];

  return (
    <section id="skills" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading
          eyebrow="Skills"
          title="Earned in production, not listed from a tutorial"
          lede="Every technology below runs in a system that is live today. No self-graded percentages — just an honest level, the years behind it, and the live systems that prove it."
        />

        {/* Stats strip */}
        <div className="mb-16 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="glass-panel rounded-xl px-4 py-5 text-center">
                <Counter value={s.value} className="font-display text-3xl text-accent sm:text-4xl" />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Signature stack */}
        <Reveal>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Signature stack</h3>
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] text-muted">the six I reach for first</span>
          </div>
        </Reveal>
        <div className="mb-20 grid grid-cols-3 gap-6 sm:grid-cols-6">
          {signature.map((s, i) => (
            <SkillRing key={s.name} name={s.name} score={s.confidenceScore} years={s.yearsExperience} delay={i * 0.08} />
          ))}
        </div>

        {/* Filter + full grid */}
        <Reveal>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Full arsenal</h3>
            <span className="h-px flex-1 bg-line" />
          </div>
        </Reveal>

        {/* Tier legend — what the levels actually mean */}
        <Reveal>
          <div className="mb-6 grid gap-2 rounded-xl border border-line bg-surface/50 p-4 sm:grid-cols-3">
            {TIER_LEGEND.map((t) => (
              <div key={t.key} className="flex items-start gap-3">
                <span className="mt-1 flex shrink-0 gap-1" aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className="h-1.5 w-4 rounded-full"
                      style={{ background: n <= t.level ? "var(--t-accent)" : "var(--t-line-2)" }}
                    />
                  ))}
                </span>
                <div>
                  <p className="font-mono text-[12px] font-medium text-ink">{t.label}</p>
                  <p className="font-mono text-[10px] leading-snug text-muted">{t.blurb}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Category filter pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORY_ORDER.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`relative rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors duration-200 ${
                  active
                    ? "border-accent text-accent"
                    : "border-line text-muted hover:border-accent/50 hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="skill-filter-pill"
                    className="absolute inset-0 rounded-full bg-accent/10"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span className="relative">{CATEGORY_LABEL[cat]}</span>
              </button>
            );
          })}
        </div>

        {/* Animated grid */}
        <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((s) => (
              <SkillCard key={s.name} skill={s} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
