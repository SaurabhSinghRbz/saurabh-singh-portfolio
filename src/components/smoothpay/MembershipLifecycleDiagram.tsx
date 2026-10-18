"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, StatusRail, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * MembershipLifecycleDiagram — merchant → customer subscriptions, read
 * from the NestJS memberships module: membership-join (paid / trial /
 * AED 0 joins), membership-trial-hold (AED 1 PA + same-day reversal,
 * 20-min sweep), membership-join.util (Dubai-calendar anchor),
 * subscription-charge.util (items-only, own-share discount),
 * membership-change-plan (upgrade now, downgrade at renewal) and
 * membership-renewal (resume → expire → plan change → collect, Redis
 * lock, retry ladder 1·3·7·7·7, unique invoice per period).
 * ------------------------------------------------------------------ */

const TOP = 92;
const BOT = 252;

const N: Record<string, SPNodeDef> = {
  customer: { x: 74, y: TOP, w: 104, h: 54, title: "CUSTOMER", sub: "scans plan QR", kind: "actor" },
  plan: { x: 262, y: TOP, w: 120, h: 56, title: "PLAN", sub: "monthly · annual", kind: "system" },
  join: { x: 458, y: TOP, w: 124, h: 56, title: "JOIN", sub: "paid · trial · free", kind: "system" },
  afs: { x: 654, y: TOP, w: 124, h: 58, title: "AFS", sub: "card registration", kind: "gateway" },
  member: { x: 866, y: TOP, w: 132, h: 56, title: "MEMBERSHIP", sub: "anchored · Dubai", kind: "state" },
  collect: { x: 120, y: BOT, w: 132, h: 56, title: "4 · COLLECT", sub: "MIT · saved card", kind: "system" },
  change: { x: 310, y: BOT, w: 128, h: 56, title: "3 · PLAN CHANGE", sub: "scheduled swap", kind: "system" },
  expire: { x: 496, y: BOT, w: 122, h: 56, title: "2 · EXPIRE", sub: "before charging", kind: "system" },
  resume: { x: 680, y: BOT, w: 122, h: 56, title: "1 · RESUME", sub: "pauses ended", kind: "system" },
  job: { x: 866, y: BOT, w: 132, h: 56, title: "DAILY ENGINE", sub: "cron · Redis lock", kind: "guard" },
};

type NodeId = keyof typeof N;

type Phase = "TRIAL" | "ACTIVE" | "RENEWING" | "PAYMENT_DUE" | "PAUSED" | "ENDING" | "CANCELLED";

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "due" | "roll" };
  at?: NodeId;
  log: string;
  tone: Tone;
  join?: "paid" | "trial" | "free";
  phase?: Phase;
  ladder?: string;
  coin?: boolean;
  danger?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { move: { from: "customer", to: "plan" }, log: "a diner scans the restaurant's membership QR (or a plan's join link) and sees its live plans — price per month, the standing discount, what each plan gives", tone: "info", dur: 2100 },
  { at: "plan", log: "annual = monthly price × 12 up front · VAT is the plan's own (5% UAE) · optional free trial, fixed term of N paid cycles, and a sell window per plan", tone: "accent", dur: 2300 },
  { move: { from: "plan", to: "join" }, join: "paid", log: "PAID join: first period + VAT, with the service charge priced on the whole collected amount — bought alongside a dine-in bill, it settles in that same payment", tone: "accent", coin: true, dur: 2500 },
  { at: "join", join: "trial", log: "FREE TRIAL: nothing is due, but the card must be saved — an AED 1 hold with createRegistration, reversed the same day. A 20-minute sweep releases any hold a failed reversal or an abandoned 3DS left behind", tone: "accent", dur: 2900 },
  { at: "join", join: "free", log: "AED 0 PLAN: a card-free join — nothing to charge, so nothing is stored", tone: "info", dur: 1800 },
  { move: { from: "join", to: "afs" }, log: "hosted card page + 3DS · the consent wording is frozen on the attempt row · the server re-queries AFS on return — the redirect is never trusted", tone: "info", coin: true, dur: 2500 },
  { move: { from: "afs", to: "member" }, phase: "ACTIVE", log: "membership ACTIVE · the billing anchor is the day of month on the Dubai calendar (UTC+4, no DST): 31 Jan → 28 Feb → 31 Mar — the anchor, not last month's date, picks the day", tone: "ok", dur: 2900 },
  { at: "member", phase: "ACTIVE", log: "member pays a bill: the discount lands on items only, and only on their own share of a split — 10% of 50, not of 200. Never on tip, service charge or the plan fee", tone: "accent", dur: 2800 },
  { at: "member", phase: "ACTIVE", log: "upgrade (higher monthly price) → paid now on the saved card and switched today · downgrade → booked as a pending plan, applied at the next renewal", tone: "info", dur: 2600 },
  { at: "member", phase: "PAUSED", log: "pause for 1, 2 or 3 months, once a year — benefits on hold, the unused paid days kept and handed back in full on resume", tone: "info", dur: 2300 },
  { move: { from: "member", to: "job", lane: "due" }, phase: "RENEWING", log: "the renewal falls due. Benefits stay on through a 24h grace window while the once-a-day engine charges — one runner across every API instance (Redis SET NX)", tone: "accent", dur: 2700 },
  { move: { from: "job", to: "resume" }, phase: "RENEWING", log: "pass 1 · resume — memberships whose pause ended today come back ACTIVE and are judged on their real period dates", tone: "info", dur: 2100 },
  { move: { from: "resume", to: "expire" }, phase: "RENEWING", log: "pass 2 · expire — cancelled, fixed term served, plan past its expiry: all settled BEFORE anything is charged. 'Cancelled and not charged' is true, not merely intended", tone: "accent", dur: 2700 },
  { move: { from: "expire", to: "change" }, phase: "RENEWING", log: "pass 3 · apply the scheduled plan change, so a downgrade bills at the NEW price on its very first cycle", tone: "info", dur: 2200 },
  { move: { from: "change", to: "collect" }, phase: "RENEWING", log: "pass 4 · collect — an unattended charge on the stored registration, replayed against the exact AFS entity it was created under", tone: "accent", coin: true, ladder: "day 0", dur: 2400 },
  { at: "collect", phase: "PAYMENT_DUE", danger: true, ladder: "day 4", log: "declined → PAST_DUE, benefit off at once. Retry ladder +1, +3, +7, +7, +7 days; an unusable card skips straight to 'update your card' email + SMS", tone: "err", dur: 2900 },
  { at: "collect", phase: "PAYMENT_DUE", ladder: "day 4", log: "one open charge per invoice (partial unique index) · one invoice per period (unique on membership + period start) — a second runner loses on the database, not in a race", tone: "accent", dur: 2900 },
  { move: { from: "collect", to: "member", lane: "roll" }, phase: "ACTIVE", log: "paid → invoice PAID, the period rolls forward on its anchor, and the benefit is back", tone: "ok", coin: true, dur: 2500 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const PHASES: Phase[] = ["TRIAL", "ACTIVE", "RENEWING", "PAYMENT_DUE", "PAUSED", "ENDING", "CANCELLED"];
const LADDER = ["day 0", "day 1", "day 4", "day 11", "day 18", "day 25"];

function latest<K extends "phase" | "ladder">(i: number, key: K): Step[K] | null {
  for (let k = i; k >= 0; k--) {
    const v = SCRIPT[k][key];
    if (v) return v;
  }
  return null;
}

/** Only the current phase lights up — phases are states, not a progression. */
function PhaseRail({ current }: { current: Phase | null }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
        membership phase — derived from the row and the clock, never stored
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {PHASES.map((p) => {
          const on = p === current;
          const bad = on && p === "PAYMENT_DUE";
          return (
            <span
              key={p}
              className={`rounded px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                bad ? "bg-bad/15 text-bad" : on ? "bg-good/15 text-good" : "bg-surface-2 text-muted"
              }`}
            >
              {p}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function MembershipLifecycleDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const phase = reduced ? "ACTIVE" : (latest(i, "phase") as Phase | null);
  const ladder = reduced ? null : (latest(i, "ladder") as string | null);
  const lane = reduced ? null : step.move?.lane;

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Memberships · join → benefit → renew"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        badge={step.join && !reduced ? { text: `${step.join} join` } : null}
        legend="◈ actor · ▧ SmoothPay service · ▤ payment rail · ⛨ scheduled engine · passes run 1 → 4"
        log={step.log}
        logPrefix="membership"
        logTone={step.tone}
        footer={
          <>
            <PhaseRail current={phase} />
            <StatusRail label="renewal retry ladder — first charge + 5 retries over ~25 days" statuses={LADDER} current={ladder} badStatuses={LADDER.slice(1)} />
          </>
        }
      >
        <DiagramScroll>
          <svg
            viewBox="0 0 1000 330"
            className="block w-full"
            role="img"
            aria-label="Membership lifecycle: a customer scans a plan QR, picks a monthly or annual plan, and joins paid, on a free trial with an AED 1 hold reversed the same day, or card-free on an AED 0 plan. The card is registered at AFS behind 3DS and the membership becomes active on a Dubai-calendar billing anchor. Members get an items-only discount on their own share of a bill, can upgrade now or downgrade at renewal, and can pause. When a renewal falls due a daily engine runs four passes in order — resume, expire, apply plan change, collect — and a failed charge moves the membership to past due with retries after 1, 3, 7, 7 and 7 days; a paid renewal rolls the period forward."
          >
            {/* join rail */}
            <line x1={N.customer.x} y1={TOP} x2={N.member.x} y2={TOP} stroke="var(--t-line)" strokeWidth={1.5} />
            {/* renewal rail */}
            <line x1={N.collect.x} y1={BOT} x2={N.job.x} y2={BOT} stroke="var(--t-line)" strokeWidth={1.5} />

            {/* member → engine: renewal due */}
            <line
              x1={N.member.x}
              y1={TOP + 28}
              x2={N.job.x}
              y2={BOT - 28}
              stroke={lane === "due" ? "var(--t-accent)" : "var(--t-line)"}
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <text x={N.member.x + 10} y={176} fontSize={8.5} fontFamily="var(--font-mono)" fill={lane === "due" ? "var(--t-accent)" : "var(--t-muted)"}>
              renewal due ↓
            </text>

            {/* collect → member: period rolls forward */}
            <path
              d={`M ${N.collect.x} ${BOT - 28} C ${N.collect.x} 178, ${N.member.x - 150} 172, ${N.member.x - 40} ${TOP + 28}`}
              fill="none"
              stroke={lane === "roll" ? "var(--t-good)" : "var(--t-line)"}
              strokeWidth={1.4}
              strokeDasharray="5 4"
            />
            <text x={470} y={170} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill={lane === "roll" ? "var(--t-good)" : "var(--t-muted)"}>
              paid → period rolls forward on its anchor ↑
            </text>

            {/* join variant chips */}
            {(["paid", "trial", "free"] as const).map((v, idx) => {
              const on = !reduced && step.join === v;
              const cx = N.join.x - 42 + idx * 42;
              return (
                <g key={v}>
                  <rect x={cx - 19} y={TOP - 80} width={38} height={18} rx={9} fill={on ? "var(--t-accent)" : "var(--t-surface)"} stroke={on ? "var(--t-accent)" : "var(--t-line-2)"} />
                  <text x={cx} y={TOP - 67} textAnchor="middle" fontSize={7.5} fontWeight={700} fontFamily="var(--font-mono)" fill={on ? "var(--t-accent-contrast)" : "var(--t-muted)"}>
                    {v === "paid" ? "PAID" : v === "trial" ? "AED 1" : "AED 0"}
                  </text>
                </g>
              );
            })}

            {/* engine label */}
            <text x={N.job.x} y={BOT + 46} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill="var(--t-muted)">
              Asia/Dubai · once a day
            </text>

            {(Object.keys(N) as NodeId[]).map((id) => (
              <SPNode
                key={id}
                node={N[id]}
                active={activeNode === id && !reduced}
                danger={id === "collect" && !!step.danger && !reduced}
                good={id === "member" && step.tone === "ok" && !reduced}
              />
            ))}

            {!reduced && target && (
              <MoneyPacket
                target={target}
                dur={step.dur}
                tone={step.tone === "ok" ? "ok" : step.tone === "err" ? "err" : "accent"}
                scaleAt={!!step.at}
              />
            )}
          </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
