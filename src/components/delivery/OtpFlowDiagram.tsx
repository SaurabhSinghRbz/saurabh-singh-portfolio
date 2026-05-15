"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * OtpFlowDiagram — the OTP lifecycle, the hottest user-facing path on
 * the platform. Mirrors lib/otp/default.js exactly:
 *
 *   send:   canSendOtp → generateOtp → saveOtp(Redis+TTL) →
 *           encrypt(woohooKMS) → deliver(email+sms in parallel)
 *   verify: checkKey → increment+check invalid attempts →
 *           compare otp+uuid → removeCache | lockout
 * ------------------------------------------------------------------ */

const NODES = {
  client: { x: 70, y: 150, w: 104, h: 56, title: "CLIENT", sub: "login screen" },
  api: { x: 250, y: 150, w: 132, h: 62, title: "OTP API", sub: "send · verify" },
  redis: { x: 470, y: 150, w: 132, h: 62, title: "REDIS", sub: "otp · TTL · attempts" },
  deliver: { x: 680, y: 150, w: 128, h: 62, title: "DELIVER", sub: "email + SMS" },
  user: { x: 858, y: 150, w: 96, h: 56, title: "USER", sub: "handset" },
} as const;

type NodeId = keyof typeof NODES;
type Tone = "ok" | "err" | "info" | "accent" | "muted";
type Verdict = "PENDING" | "VERIFIED" | "WRONG" | "LOCKED" | null;

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone: Tone;
  phase: "SEND" | "VERIFY";
  attempts?: number; // invalid attempts shown x/5
  verdict?: Verdict;
  ttl?: boolean; // show TTL pill on redis
  dur: number;
};

const MAX = 5;

const SCRIPT: Step[] = [
  // ---- send ----
  { move: { from: "client", to: "api" }, log: "POST /otp/send  refno#LOGIN-91 · channel: email + sms", tone: "info", phase: "SEND", dur: 1300 },
  { at: "api", log: "canSendOtp() → check invalid-attempt ceiling in Redis (clear)", tone: "accent", phase: "SEND", dur: 1500 },
  { at: "api", log: "generateOtp() → 6-digit random, length capped by maxOtpLength config", tone: "info", phase: "SEND", dur: 1400 },
  { move: { from: "api", to: "redis" }, log: "saveOtp() → write to Redis with TTL = validity, attempts = 0", tone: "info", phase: "SEND", ttl: true, dur: 1400 },
  { at: "redis", log: "encrypt OTP (woohooKMS + aes256) into the secure param — plaintext never persisted", tone: "accent", phase: "SEND", ttl: true, dur: 1800 },
  { move: { from: "redis", to: "deliver" }, log: "hand encrypted payload to delivery channels", tone: "info", phase: "SEND", dur: 1100 },
  { move: { from: "deliver", to: "user" }, log: "deliver via email AND sms in parallel (Promise.all) → return uuid to client", tone: "ok", phase: "SEND", dur: 1500 },
  // ---- verify: wrong then right ----
  { move: { from: "user", to: "api" }, log: "POST /otp/verify/:uuid  code: 4•• (wrong)", tone: "info", phase: "VERIFY", verdict: "PENDING", dur: 1300 },
  { move: { from: "api", to: "redis" }, log: "checkKey → increment invalid attempts, compare code + uuid", tone: "info", phase: "VERIFY", verdict: "PENDING", attempts: 1, dur: 1400 },
  { at: "redis", log: "mismatch → invalid attempt recorded. Cache stays, budget shrinks.", tone: "err", phase: "VERIFY", verdict: "WRONG", attempts: 1, dur: 1600 },
  { move: { from: "user", to: "redis" }, log: "retry with correct code: 419… → compare", tone: "info", phase: "VERIFY", verdict: "PENDING", attempts: 1, dur: 1300 },
  { at: "redis", log: "otp + uuid match → removeCache (single-use) → 200 OK", tone: "ok", phase: "VERIFY", verdict: "VERIFIED", attempts: 1, dur: 1700 },
  // ---- lockout ----
  { at: "redis", log: "another session: wrong code repeated until attempts hit the ceiling…", tone: "err", phase: "VERIFY", verdict: "WRONG", attempts: 5, dur: 1700 },
  { at: "api", log: "canSendOtp() now refuses to issue or verify — brute force is capped, not just logged.", tone: "err", phase: "VERIFY", verdict: "LOCKED", attempts: 5, dur: 1900 },
];

const toneText: Record<Tone, string> = {
  ok: "text-good",
  err: "text-bad",
  info: "text-ink/85",
  accent: "text-accent",
  muted: "text-muted",
};

const VERDICT_TONE: Record<NonNullable<Verdict>, string> = {
  PENDING: "var(--t-muted)",
  VERIFIED: "var(--t-good)",
  WRONG: "var(--t-bad)",
  LOCKED: "var(--t-bad)",
};

function NodeBox({ node, active }: { node: (typeof NODES)[NodeId]; active: boolean }) {
  return (
    <g>
      <rect x={node.x - node.w / 2} y={node.y - node.h / 2} width={node.w} height={node.h} rx={10} fill="var(--t-surface)" stroke={active ? "var(--t-accent)" : "var(--t-line-2)"} strokeWidth={active ? 2 : 1} />
      <text x={node.x} y={node.y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={13} fontWeight={600} fontFamily="var(--font-mono)">
        {node.title}
      </text>
      <text x={node.x} y={node.y + 15} textAnchor="middle" fill="var(--t-muted)" fontSize={10} fontFamily="var(--font-mono)">
        {node.sub}
      </text>
    </g>
  );
}

export default function OtpFlowDiagram() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const [i, setI] = useState(0);
  const step = SCRIPT[i];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((p) => (p + 1) % SCRIPT.length), step.dur);
    return () => clearTimeout(t);
  }, [i, inView, reduced, step.dur]);

  const activeNode: NodeId | null = step.at ?? step.move?.to ?? null;
  const target = step.move
    ? { x: [NODES[step.move.from].x, NODES[step.move.to].x], y: [NODES[step.move.from].y, NODES[step.move.to].y] }
    : step.at
      ? { x: [NODES[step.at].x], y: [NODES[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            OTP lifecycle — live replay
          </p>
          <div className="flex items-center gap-3">
            {!reduced && (
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${step.phase === "SEND" ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"}`}>
                {step.phase}
              </span>
            )}
            {!reduced && <p className="font-mono text-[10px] text-muted">step {i + 1}/{SCRIPT.length}</p>}
          </div>
        </div>

        <svg viewBox="0 0 920 250" className="block w-full" role="img" aria-label="Animated OTP diagram: client requests an OTP, the API checks the attempt ceiling, generates and encrypts a code into Redis with a TTL, delivers it over email and SMS in parallel; verification compares the code, records invalid attempts, clears the cache on success, and locks out after too many wrong tries.">
          <line x1={NODES.client.x} y1={150} x2={NODES.user.x} y2={150} stroke="var(--t-line)" strokeWidth={1.5} />

          {(Object.keys(NODES) as NodeId[]).map((id) => (
            <NodeBox key={id} node={NODES[id]} active={activeNode === id && !reduced} />
          ))}

          {/* TTL pill on redis */}
          {!reduced && step.ttl && (
            <g>
              <rect x={NODES.redis.x - 44} y={92} width={88} height={22} rx={11} fill="var(--t-surface)" stroke="var(--t-accent)" />
              <text x={NODES.redis.x} y={107} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--t-accent)">
                TTL 05:00
              </text>
            </g>
          )}

          {/* attempts meter */}
          {!reduced && typeof step.attempts === "number" && (
            <g>
              <text x={NODES.redis.x} y={210} textAnchor="middle" fontSize={10} fontFamily="var(--font-mono)" fill="var(--t-muted)">
                invalid attempts {step.attempts}/{MAX}
              </text>
              {Array.from({ length: MAX }).map((_, k) => (
                <rect
                  key={k}
                  x={NODES.redis.x - 50 + k * 21}
                  y={218}
                  width={15}
                  height={7}
                  rx={2}
                  fill={k < step.attempts! ? "var(--t-bad)" : "var(--t-line-2)"}
                />
              ))}
            </g>
          )}

          {/* verdict pill near user */}
          {!reduced && step.verdict && (
            <g>
              <rect x={NODES.api.x - 52} y={92} width={104} height={24} rx={12} fill="var(--t-surface)" stroke={VERDICT_TONE[step.verdict]} />
              <text x={NODES.api.x} y={108} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="var(--font-mono)" fill={VERDICT_TONE[step.verdict]}>
                {step.verdict}
              </text>
            </g>
          )}

          {!reduced && target && (
            <motion.g
              animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.5, 1] : 1 }}
              transition={{ duration: step.dur / 1000, ease: "easeInOut" }}
            >
              <circle r={7} fill="var(--t-accent)" />
              <circle r={12} fill="var(--t-accent)" opacity={0.25} />
            </motion.g>
          )}
        </svg>

        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">
              Animation disabled (reduced motion). The OTP flow is described in the prose below.
            </p>
          ) : (
            <p key={i} className={`font-mono text-xs sm:text-[13px] ${toneText[step.tone]}`}>
              <span className="text-muted">[otp]</span> {step.log}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
