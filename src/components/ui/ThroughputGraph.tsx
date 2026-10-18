"use client";

import { useEffect, useRef, useState } from "react";
import { useInViewRef } from "@/lib/perf";

/* ------------------------------------------------------------------ *
 * ThroughputGraph — a live-updating area chart of request throughput,
 * the kind you'd see on a real ops dashboard. Pure SVG + a random
 * walk on an interval — no WebGL, no fonts, nothing to fail to load.
 * Theme-aware via CSS vars; frozen under prefers-reduced-motion.
 * ------------------------------------------------------------------ */

const POINTS = 30;
const W = 200;
const H = 84;

/** map a 0–100 sample to a req/s figure for the readout */
const toReqs = (v: number) => Math.round(320 + (v / 100) * 380);

/** Deterministic baseline so server and client render the same markup on first paint. */
function seed(): number[] {
  const out: number[] = [];
  for (let i = 0; i < POINTS; i++) {
    out.push(60 + Math.sin(i / 2.4) * 18);
  }
  return out;
}

function toPath(data: number[]) {
  const pts = data.map((v, i) => {
    const x = (i / (POINTS - 1)) * W;
    const y = H - (v / 100) * (H - 6) - 3;
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  return { line, area, last: pts[pts.length - 1] };
}

export default function ThroughputGraph() {
  const [data, setData] = useState<number[]>(seed);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInViewRef(rootRef);

  // Ticks only while on screen; frozen under reduced motion.
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setData((prev) => {
        const next = prev.slice(1);
        const v = Math.max(24, Math.min(96, prev[prev.length - 1] + (Math.random() - 0.5) * 26));
        next.push(v);
        return next;
      });
    }, 780);
    return () => clearInterval(id);
  }, [inView]);

  const { line, area, last } = toPath(data);
  const current = toReqs(data[data.length - 1]);
  const peak = toReqs(Math.max(...data));
  const avg = toReqs(data.reduce((a, b) => a + b, 0) / data.length);

  return (
    <div ref={rootRef} className="glass-panel rounded-xl p-4" style={{ maxWidth: 240 }}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-50 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          Throughput · illustrative
        </span>
      </div>

      {/* Current req/s */}
      <div className="mb-2 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold tabular-nums text-ink transition-all duration-300">
          {current}
        </span>
        <span className="font-mono text-[11px] text-muted">req/s</span>
      </div>

      {/* Area chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="tp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--t-accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--t-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* subtle baseline grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" y1={H * f} x2={W} y2={H * f} stroke="var(--t-line)" strokeWidth="0.5" />
        ))}

        <path d={area} fill="url(#tp-fill)" style={{ transition: "d 0.6s linear" }} />
        <path d={line} fill="none" stroke="var(--t-accent)" strokeWidth="1.5" strokeLinejoin="round" style={{ transition: "d 0.6s linear" }} />

        {/* leading dot */}
        <circle cx={last[0]} cy={last[1]} r="2.5" fill="var(--t-accent)">
          <animate attributeName="r" values="2.5;4;2.5" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Stats */}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-[10px]">
        <div className="flex flex-col">
          <span className="text-muted">avg</span>
          <span className="tabular-nums text-ink/80">{avg}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-muted">peak</span>
          <span className="tabular-nums text-accent">{peak}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted">p99</span>
          <span className="tabular-nums text-good">21ms</span>
        </div>
      </div>
    </div>
  );
}
