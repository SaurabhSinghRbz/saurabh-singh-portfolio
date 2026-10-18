"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { skillProficiency, type SkillProficiency } from "@/content/skill-proficiency";
import Reveal from "@/components/motion/Reveal";
import Counter from "@/components/motion/Counter";
import SectionHeading from "@/components/ui/SectionHeading";
import TiltCard from "@/components/motion/TiltCard";
import TechIcon from "@/components/icons/TechIcon";

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

/* Brand colours so each logo reads as itself. Sat/lightness nudged where a
 * true brand colour would disappear on the dark medallion. Anything unmapped
 * falls back to the site accent. */
const BRAND: Record<string, string> = {
  "Node.js": "#5FA04E",
  Express: "#A7B2CC",
  NestJS: "#E0234E",
  Go: "#00ADD8",
  TypeScript: "#3B82E0",
  JavaScript: "#F7DF1E",
  React: "#61DAFB",
  "Next.js": "#E5E7EB",
  Vue: "#42B883",
  "Tailwind CSS": "#38BDF8",
  PostgreSQL: "#5B9BE8",
  MySQL: "#5C93C4",
  MongoDB: "#4DB33D",
  Redis: "#FF5C49",
  ActiveMQ: "#E24329",
  Docker: "#2496ED",
  nginx: "#3DAE4B",
  OpenTelemetry: "#F5A800",
  AWS: "#FF9E33",
  GCP: "#5A9BFF",
  Stripe: "#7A73FF",
  Prisma: "#B7C0D8",
  "Socket.IO": "#CBD2E0",
};

const brandColor = (name: string) => BRAND[name] ?? "var(--t-accent)";

function SkillTile({ skill, index }: { skill: SkillProficiency; index: number }) {
  const brand = brandColor(skill.name);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard className="group h-full">
        <div
          style={{ "--b": brand } as CSSProperties}
          className="relative flex h-full flex-col items-center gap-2.5 rounded-xl border border-line bg-surface p-4 text-center transition-colors duration-200 [transform-style:preserve-3d] group-hover:border-[color:color-mix(in_srgb,var(--b)_55%,transparent)]"
        >
          {/* Logo layer — lifts toward the viewer as the card tilts */}
          <div className="[transform:translateZ(24px)] transition-transform duration-300 group-hover:[transform:translateZ(52px)]">
            <div
              className="skill-float flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                color: brand,
                animationDelay: `${(index % 6) * 0.35}s`,
                background:
                  "radial-gradient(circle at 30% 22%, color-mix(in srgb, var(--b) 26%, var(--t-medallion-from)), var(--t-medallion-to))",
                boxShadow:
                  "inset 0 0 0 1px color-mix(in srgb, var(--b) 34%, transparent), 0 8px 20px -10px color-mix(in srgb, var(--b) 70%, transparent)",
              }}
            >
              <TechIcon name={skill.name} className="h-6 w-6" />
            </div>
          </div>

          <p className="font-mono text-[12px] font-medium text-ink transition-colors duration-200 group-hover:text-[color:var(--b)]">
            {skill.name}
          </p>
          <p className="flex items-center gap-1.5 font-mono text-[10px] text-muted">
            <span>{skill.yearsExperience}y</span>
            {skill.productionUsage && (
              <>
                <span className="text-line-2">·</span>
                <span className="inline-flex items-center gap-1 text-good">
                  <span className="h-1 w-1 rounded-full bg-good" />
                  live
                </span>
              </>
            )}
          </p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function Skills() {
  const [filter, setFilter] = useState<string>("All");

  const domains = useMemo(() => new Set(skillProficiency.map((s) => s.category)).size, []);

  const filtered = useMemo(() => {
    const list =
      filter === "All" ? skillProficiency : skillProficiency.filter((s) => s.category === filter);
    return [...list].sort((a, b) => b.confidenceScore - a.confidenceScore);
  }, [filter]);

  const stats = [
    { value: `${skillProficiency.length}`, label: "technologies" },
    { value: "4+", label: "years shipping" },
    { value: `${domains}`, label: "engineering domains" },
    { value: "100%", label: "run in production" },
  ];

  return (
    <section id="skills" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <SectionHeading
          eyebrow="Skills"
          title="Earned in production, not listed from a tutorial"
          lede="Every technology here runs in a system that is live today — grouped by where it sits in the stack. No self-graded bars; just the logo, the years behind it, and proof it ships."
        />

        {/* Stats strip */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="glass-panel rounded-xl px-4 py-4 text-center">
                <Counter value={s.value} className="font-display text-2xl text-accent sm:text-3xl" />
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {s.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

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

        {/* Logo grid */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
          style={{ perspective: 1000 }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((s, i) => (
              <SkillTile key={s.name} skill={s} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
