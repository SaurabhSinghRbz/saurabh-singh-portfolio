"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * flowKit — shared primitives for the woohoo-card flow diagrams.
 *
 * The visual grammar mirrors the real architecture:
 *   • MONITOR queues (top tier) are the state machine. They receive a
 *     webhook, push cards DOWN to their worker queue, set the order
 *     status, and return 500 to re-run themselves until every card is
 *     done — then hand off to the NEXT monitor queue.
 *   • WORKER queues (lower tier) do the per-card work against a
 *     TARGET (DB / provider / wallet / delivery). They never change
 *     order status; they only complete card_transactions.
 * ------------------------------------------------------------------ */

export type Tone = "ok" | "err" | "info" | "accent" | "muted";

export const toneText: Record<Tone, string> = {
  ok: "text-good",
  err: "text-bad",
  info: "text-ink/85",
  accent: "text-accent",
  muted: "text-muted",
};

export const toneVar: Record<Tone, string> = {
  ok: "var(--t-good)",
  err: "var(--t-bad)",
  info: "var(--t-ink)",
  accent: "var(--t-accent)",
  muted: "var(--t-muted)",
};

export type NodeKind = "monitor" | "worker" | "target" | "plain";
export type FlowNode = { x: number; y: number; w: number; h: number; title: string; sub: string; kind?: NodeKind };

/** Advances through a script while visible; frozen under reduced motion. */
export function useFlowStepper(durations: number[], rootRef: React.RefObject<HTMLDivElement | null>) {
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.2 });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((p) => (p + 1) % durations.length), durations[i]);
    return () => clearTimeout(t);
  }, [i, inView, reduced, durations]);

  return { i, reduced: !!reduced };
}

/** A node rendered by kind — monitors and workers look different on purpose. */
export function StageNode({ node, active, danger, good }: { node: FlowNode; active: boolean; danger?: boolean; good?: boolean }) {
  const kind = node.kind ?? "plain";
  const { x, y, w, h } = node;

  const stroke = danger ? "var(--t-bad)" : good ? "var(--t-good)" : active ? "var(--t-accent)" : kind === "monitor" ? "var(--t-line-2)" : "var(--t-line-2)";
  const strokeW = active || danger || good ? 2 : kind === "monitor" ? 1.4 : 1;
  const fill = kind === "worker" ? "var(--t-surface-2)" : "var(--t-surface)";

  return (
    <g>
      {/* floating tier tag */}
      {kind === "monitor" && (
        <text x={x} y={y - h / 2 - 7} textAnchor="middle" fontSize={8} fontWeight={700} letterSpacing="0.12em" fontFamily="var(--font-mono)" fill={active ? "var(--t-accent)" : "var(--t-muted)"}>
          ⬧ MONITOR QUEUE
        </text>
      )}
      {kind === "worker" && (
        <text x={x} y={y - h / 2 - 7} textAnchor="middle" fontSize={8} fontWeight={700} letterSpacing="0.12em" fontFamily="var(--font-mono)" fill={active ? "var(--t-accent)" : "var(--t-muted)"}>
          ⚙ WORKER QUEUE
        </text>
      )}

      {/* monitor gets a subtle double-frame to read as the "driver" */}
      {kind === "monitor" && <rect x={x - w / 2 - 3} y={y - h / 2 - 3} width={w + 6} height={h + 6} rx={12} fill="none" stroke={active ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={1} opacity={0.5} />}

      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      <text x={x} y={y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={kind === "target" ? 10.5 : 11.5} fontWeight={600} fontFamily="var(--font-mono)">
        {node.title}
      </text>
      <text x={x} y={y + 13} textAnchor="middle" fill="var(--t-muted)" fontSize={9} fontFamily="var(--font-mono)">
        {node.sub}
      </text>
    </g>
  );
}

/** Small queue cylinder — a hop marker sitting on a connector. */
export function QueueGlyph({ x, y, active }: { x: number; y: number; active: boolean }) {
  const color = active ? "var(--t-accent)" : "var(--t-line-2)";
  return (
    <g>
      <ellipse cx={x} cy={y - 5} rx={7} ry={2.5} fill="none" stroke={color} strokeWidth={1.1} />
      <path d={`M ${x - 7} ${y - 5} L ${x - 7} ${y + 4}`} stroke={color} strokeWidth={1.1} />
      <path d={`M ${x + 7} ${y - 5} L ${x + 7} ${y + 4}`} stroke={color} strokeWidth={1.1} />
      <ellipse cx={x} cy={y + 4} rx={7} ry={2.5} fill={active ? "var(--t-accent)" : "var(--t-surface)"} stroke={color} strokeWidth={1.1} opacity={active ? 0.35 : 1} />
    </g>
  );
}

/** Self-loop above a monitor — the 500-retry contract that re-runs it. */
export function RetryLoop({ x, yNodeTop, active, label }: { x: number; yNodeTop: number; active: boolean; label: string }) {
  const color = active ? "var(--t-bad)" : "var(--t-line)";
  const top = yNodeTop - 26;
  return (
    <g>
      <path d={`M ${x - 26} ${yNodeTop} C ${x - 26} ${top}, ${x + 26} ${top}, ${x + 26} ${yNodeTop}`} fill="none" stroke={color} strokeWidth={1.3} strokeDasharray="4 3" />
      <path d={`M ${x + 26} ${yNodeTop} l -4 -5 m 4 5 l 4 -5`} stroke={color} strokeWidth={1.3} fill="none" />
      <text x={x} y={top - 4} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill={color}>
        {label}
      </text>
    </g>
  );
}

/** The order-status chip, anchored directly beneath the active monitor. */
export function StatusChip({ x, yNodeBottom, text, tone, show }: { x: number; yNodeBottom: number; text: string; tone: Tone; show: boolean }) {
  if (!show) return null;
  const color = toneVar[tone];
  const w = Math.max(96, text.length * 6.6 + 26);
  return (
    <g>
      <line x1={x} y1={yNodeBottom} x2={x} y2={yNodeBottom + 12} stroke={color} strokeWidth={1.2} strokeDasharray="2 2" />
      <rect x={x - w / 2} y={yNodeBottom + 12} width={w} height={22} rx={11} fill="var(--t-surface)" stroke={color} strokeWidth={1.4} />
      <circle cx={x - w / 2 + 13} cy={yNodeBottom + 23} r={3.5} fill={color} />
      <text x={x + 7} y={yNodeBottom + 27} textAnchor="middle" fontSize={9.5} fontWeight={700} fontFamily="var(--font-mono)" fill={color}>
        {text}
      </text>
    </g>
  );
}

/** Ordered rail of real order-status constants; reached ones light up. */
export function StatusFlow({ statuses, current, badStatuses = [] }: { statuses: string[]; current: string | null; badStatuses?: string[] }) {
  const idx = current ? statuses.indexOf(current) : -1;
  const isBad = current !== null && badStatuses.includes(current);
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">order status — set only by monitor queues</p>
      <div className="flex flex-wrap items-center gap-1">
        {statuses.map((s, k) => {
          const reached = idx >= 0 && k <= idx;
          const activeBad = isBad && k === idx;
          return (
            <span key={s} className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${activeBad ? "bg-bad/15 text-bad" : reached ? "bg-good/15 text-good" : "bg-surface-2 text-muted"}`}>
              {s}
            </span>
          );
        })}
        {current && idx === -1 && (
          <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${isBad ? "bg-bad/15 text-bad" : "bg-accent/15 text-accent"}`}>{current}</span>
        )}
      </div>
    </div>
  );
}

export function DiagramShell({
  title,
  step,
  total,
  reduced,
  badge,
  children,
  footer,
  log,
  logPrefix,
  logTone,
}: {
  title: string;
  step: number;
  total: number;
  reduced: boolean;
  badge?: { text: string; bad?: boolean } | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
  log: string;
  logPrefix: string;
  logTone: Tone;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{title}</p>
        <div className="flex items-center gap-3">
          {!reduced && badge && (
            <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${badge.bad ? "bg-bad/15 text-bad" : "bg-accent/15 text-accent"}`}>{badge.text}</span>
          )}
          {!reduced && <p className="font-mono text-[10px] text-muted">step {step + 1}/{total}</p>}
        </div>
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2 font-mono text-[9px] text-muted">
        <span className="flex items-center gap-1"><span className="text-accent">⬧</span> monitor queue — sets status, retries, hands off</span>
        <span className="flex items-center gap-1"><span className="text-accent">⚙</span> worker queue — per-card work</span>
        <span className="flex items-center gap-1"><span className="text-bad">⟳</span> 500 → redelivered until all cards done</span>
      </div>

      {children}

      {footer && <div className="grid gap-3 border-t border-line px-4 py-3 sm:grid-cols-2">{footer}</div>}

      <div className="border-t border-line px-4 py-3">
        {reduced ? (
          <p className="font-mono text-xs text-muted">Animation disabled (reduced motion). The flow is described in the prose around this diagram.</p>
        ) : (
          <p key={step} className={`font-mono text-xs sm:text-[13px] ${toneText[logTone]}`}>
            <span className="text-muted">[{logPrefix}]</span> {log}
          </p>
        )}
      </div>
    </div>
  );
}
