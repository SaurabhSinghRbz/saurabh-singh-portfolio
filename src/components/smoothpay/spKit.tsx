"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ *
 * spKit — shared primitives for the SmoothPay flow diagrams.
 *
 * Visual grammar:
 *   • ACTOR   — a person / device (customer, merchant)
 *   • SYSTEM  — a SmoothPay service (order, settle, link)
 *   • GATEWAY — an external payment rail (Stripe, AFS) — distinct look
 *   • STATE   — a terminal / status marker
 * Every colour resolves through the theme vars, so both light & dark
 * modes read correctly.
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

export type NodeKind = "actor" | "system" | "gateway" | "state" | "guard" | "app" | "store";
export type SPNodeDef = { x: number; y: number; w: number; h: number; title: string; sub: string; kind?: NodeKind };

const KIND_TAG: Record<NodeKind, string> = {
  actor: "◈ ACTOR",
  system: "▧ SMOOTHPAY",
  gateway: "▤ PAYMENT RAIL",
  state: "● STATE",
  guard: "⛨ GUARD",
  app: "▦ APP",
  store: "▩ DATA",
};

export function useStepper(durations: number[], rootRef: React.RefObject<HTMLDivElement | null>) {
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

export function SPNode({ node, active, good, danger }: { node: SPNodeDef; active: boolean; good?: boolean; danger?: boolean }) {
  const kind = node.kind ?? "system";
  const { x, y, w, h } = node;
  const stroke = danger ? "var(--t-bad)" : good ? "var(--t-good)" : active ? "var(--t-accent)" : "var(--t-line-2)";
  const sw = active || good || danger ? 2 : 1;
  const fill = kind === "gateway" || kind === "store" ? "var(--t-surface-2)" : "var(--t-surface)";
  const dashed = kind === "gateway" || kind === "store";
  const tag = KIND_TAG[kind];
  const rx = kind === "actor" ? h / 2 : kind === "guard" ? 4 : 10;

  return (
    <g>
      <text x={x} y={y - h / 2 - 7} textAnchor="middle" fontSize={8} fontWeight={700} letterSpacing="0.1em" fontFamily="var(--font-mono)" fill={active ? "var(--t-accent)" : "var(--t-muted)"}>
        {tag}
      </text>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeDasharray={dashed ? "5 4" : undefined}
      />
      <text x={x} y={y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={12} fontWeight={600} fontFamily="var(--font-mono)">
        {node.title}
      </text>
      <text x={x} y={y + 13} textAnchor="middle" fill="var(--t-muted)" fontSize={9} fontFamily="var(--font-mono)">
        {node.sub}
      </text>
    </g>
  );
}

/** A money packet: a small coin that travels along the flow. */
export function MoneyPacket({ target, dur, tone = "accent", scaleAt }: { target: { x: number[]; y: number[] }; dur: number; tone?: Tone; scaleAt?: boolean }) {
  return (
    <motion.g animate={{ x: target.x, y: target.y, scale: scaleAt ? [1, 1.4, 1] : 1 }} transition={{ duration: dur / 1000, ease: "easeInOut" }}>
      <circle r={8} fill={toneVar[tone]} opacity={0.22} />
      <circle r={5.5} fill={toneVar[tone]} />
      <text x={0} y={2.6} textAnchor="middle" fontSize={6.5} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--t-accent-contrast)">
        ₳
      </text>
    </motion.g>
  );
}

/** Animated currency badge: shows the display currency the customer sees,
 *  with a subtle flip, while noting the charge stays in AED. */
export function FxBadge({ x, y, display, active }: { x: number; y: number; display: string; active: boolean }) {
  return (
    <g opacity={active ? 1 : 0.4}>
      <rect x={x - 66} y={y - 15} width={132} height={30} rx={8} fill="var(--t-surface)" stroke={active ? "var(--t-accent)" : "var(--t-line-2)"} strokeWidth={active ? 2 : 1} />
      <text x={x} y={y - 2} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="var(--font-mono)" fill={active ? "var(--t-accent)" : "var(--t-muted)"}>
        sees {display}
      </text>
      <text x={x} y={y + 10} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-muted)">
        charged in AED
      </text>
    </g>
  );
}

/** Status rail — the real status-enum progression, lit up to `current`. */
export function StatusRail({ label, statuses, current, badStatuses = [] }: { label: string; statuses: string[]; current: string | null; badStatuses?: string[] }) {
  const idx = current ? statuses.indexOf(current) : -1;
  const isBad = current !== null && badStatuses.includes(current);
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{label}</p>
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
      </div>
    </div>
  );
}

/** A labelled footer cell — pairs with StatusRail inside SPShell's footer grid. */
export function FooterNote({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="font-mono text-[11px] leading-snug text-ink/80">{children}</p>
    </div>
  );
}

/** A running money ledger — bill maths the customer actually sees at checkout. */
export function Ledger({ rows }: { rows: { k: string; v: string; tone?: Tone }[] }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">bill</p>
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.k} className="flex items-baseline justify-between gap-3 font-mono text-[11px]">
            <span className="text-muted">{r.k}</span>
            <span className={r.tone ? toneText[r.tone] : "text-ink/85"}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SPShell({
  title,
  step,
  total,
  reduced,
  badge,
  legend,
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
  legend?: string;
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

      {legend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2 font-mono text-[9px] text-muted">
          {legend.split("·").map((part) => (
            <span key={part}>{part.trim()}</span>
          ))}
        </div>
      )}

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
