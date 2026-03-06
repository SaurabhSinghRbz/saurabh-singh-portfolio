"use client";

import { useEffect, useRef, useState } from "react";
import type { SkillProficiency } from "@/content/skill-proficiency";
import { categoryColors } from "@/content/skill-proficiency";

/**
 * SkillDetailPanel — slides in when a skill is hovered in the galaxy.
 * Shows proficiency metrics with animated circular arcs (not progress bars).
 */

function AnimatedArc({
  value,
  max,
  color,
  size = 56,
  strokeWidth = 4,
}: {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const target = value / max;
    let current = 0;
    const step = () => {
      current += (target - current) * 0.08;
      if (Math.abs(target - current) < 0.001) {
        setAnimated(target);
        return;
      }
      setAnimated(current);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, max]);

  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - animated);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--t-line)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.3s ease" }}
      />
      {/* Value */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--t-ink)"
        fontSize={size * 0.22}
        fontFamily="var(--font-mono)"
        fontWeight="600"
      >
        {Math.round(value)}
      </text>
    </svg>
  );
}

export default function SkillDetailPanel({
  skill,
}: {
  skill: SkillProficiency | null;
}) {
  const [display, setDisplay] = useState<SkillProficiency | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (skill) {
      setDisplay(skill);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setDisplay(null), 300);
      return () => clearTimeout(t);
    }
  }, [skill]);

  if (!display) return null;

  const color = categoryColors[display.category] || "var(--t-accent)";

  return (
    <div
      className={`glass-panel-strong rounded-xl p-5 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4"
      }`}
      style={{ minWidth: 220 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h4 className="font-mono text-sm font-semibold text-ink">
          {display.name}
        </h4>
      </div>

      {/* Category */}
      <p
        className="font-mono text-[10px] uppercase tracking-[0.18em] mb-4"
        style={{ color }}
      >
        {display.category}
      </p>

      {/* Metrics as arcs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col items-center gap-1">
          <AnimatedArc value={display.yearsExperience} max={5} color={color} />
          <span className="font-mono text-[9px] text-muted uppercase">
            Years
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <AnimatedArc
            value={display.confidenceScore}
            max={100}
            color={color}
          />
          <span className="font-mono text-[9px] text-muted uppercase">
            Confidence
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex justify-between font-mono text-[11px]">
          <span className="text-muted">Projects</span>
          <span className="text-ink tabular-nums">
            {display.projectsDelivered}
          </span>
        </div>
        <div className="flex justify-between font-mono text-[11px]">
          <span className="text-muted">Production</span>
          <span className={display.productionUsage ? "text-good" : "text-muted"}>
            {display.productionUsage ? "● Live" : "○ No"}
          </span>
        </div>
      </div>

      {/* Connections */}
      {display.connections.length > 0 && (
        <div className="mt-4 pt-3 border-t border-line">
          <p className="font-mono text-[9px] text-muted uppercase tracking-wide mb-2">
            Connected to
          </p>
          <div className="flex flex-wrap gap-1">
            {display.connections.map((c) => (
              <span
                key={c}
                className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] text-muted"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
