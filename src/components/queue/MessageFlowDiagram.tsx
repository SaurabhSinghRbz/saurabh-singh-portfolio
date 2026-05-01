"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * MessageFlowDiagram — a scripted, looping animation of the real
 * message lifecycle in the b2b-queue-consumer platform:
 *
 *   push → enqueue → reserve → POST webhook → (delete | touch)
 *
 * Every rule shown here is lifted from consumer.js / backoff.js:
 * the status-code switch, the 60 + n⁴s exponential release delay,
 * 511–519 static windows, custom_delay override, and the Slack
 * alert + delete when the retry budget is exhausted.
 * ------------------------------------------------------------------ */

/* ---------- geometry ---------- */

const NODES = {
  producer: { x: 70, y: 195, w: 112, h: 58, title: "PRODUCER", sub: "client service" },
  api: { x: 253, y: 195, w: 152, h: 66, title: "PUSH API", sub: "dedupe · encrypt · track" },
  broker: { x: 462, y: 195, w: 138, h: 66, title: "BROKER", sub: "ActiveMQ / Iron.io" },
  consumer: { x: 668, y: 195, w: 138, h: 66, title: "CONSUMER.JS", sub: "worker · 1 per queue" },
  webhook: { x: 852, y: 195, w: 104, h: 58, title: "WEBHOOK", sub: "downstream API" },
} as const;

type NodeId = keyof typeof NODES;

/* ---------- script ---------- */

type Tone = "ok" | "err" | "info" | "accent" | "muted";

type Step = {
  /** Move the packet. Lanes: main (straight), touch (top arc), ack (bottom arc). */
  move?: { from: NodeId; to: NodeId; lane?: "main" | "touch" | "ack" };
  /** Pulse in place at a node instead of moving. */
  at?: NodeId;
  log: string;
  tone: Tone;
  /** Status chip shown at the webhook. */
  badge?: { text: string; tone: "ok" | "err" };
  /** reserved_count chip at the broker. */
  count?: number;
  /** Decision-table row to highlight. */
  rule?: string;
  /** Flash the Slack alert node. */
  alert?: boolean;
  hidePacket?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  // ---- push path ----
  { move: { from: "producer", to: "api" }, log: "POST /queues/card-activations/messages", tone: "info", dur: 1300 },
  { at: "api", log: "uniqueIdentifier fresh → not a duplicate. Encrypting payload (AES-256 + KMS)…", tone: "accent", dur: 1700 },
  { move: { from: "api", to: "broker" }, log: "publish · persistent · receipt awaited → msg-id returned to producer", tone: "info", count: 0, dur: 1300 },
  // ---- happy consume ----
  { move: { from: "broker", to: "consumer" }, log: "subscribe ack:client · prefetch 1 → message reserved (count = 1)", tone: "info", count: 1, dur: 1300 },
  { at: "consumer", log: "decrypt payload → attach OAuth token from cache → build trace headers", tone: "accent", dur: 1500 },
  { move: { from: "consumer", to: "webhook" }, log: "POST payload → downstream · timeout 60s", tone: "info", dur: 1200 },
  { move: { from: "webhook", to: "consumer" }, log: "response: 200 OK", tone: "ok", badge: { text: "200", tone: "ok" }, rule: "2xx", dur: 1000 },
  { move: { from: "consumer", to: "broker", lane: "ack" }, log: "DELETE — ack to broker. Message leaves the queue forever.", tone: "ok", rule: "2xx", hidePacket: true, dur: 1400 },
  // ---- retry path ----
  { move: { from: "broker", to: "consumer" }, log: "next message reserved (count = 1)", tone: "info", count: 1, dur: 1200 },
  { move: { from: "consumer", to: "webhook" }, log: "POST payload → downstream", tone: "info", dur: 1100 },
  { move: { from: "webhook", to: "consumer" }, log: "response: 503 Service Unavailable — downstream is choking", tone: "err", badge: { text: "503", tone: "err" }, rule: "5xx", dur: 1200 },
  { move: { from: "consumer", to: "broker", lane: "touch" }, log: "TOUCH — release back with delay = 60 + attempts⁴ s (exponential)", tone: "accent", count: 2, rule: "5xx", dur: 1700 },
  { at: "broker", log: "…broker holds it: AMQ_SCHEDULED_DELAY. Redelivery in 76s (attempt 2)", tone: "muted", count: 2, dur: 1500 },
  { move: { from: "broker", to: "consumer" }, log: "redelivered (count = 2) — same correlation-id, full history tracked", tone: "info", count: 2, dur: 1200 },
  { move: { from: "consumer", to: "webhook" }, log: "POST payload → downstream (retry)", tone: "info", dur: 1100 },
  { move: { from: "webhook", to: "consumer" }, log: "response: 200 OK — downstream recovered", tone: "ok", badge: { text: "200", tone: "ok" }, rule: "2xx", dur: 1000 },
  { move: { from: "consumer", to: "broker", lane: "ack" }, log: "DELETE — ack. Exactly-once outcome despite the failure.", tone: "ok", rule: "2xx", hidePacket: true, dur: 1400 },
  // ---- exhaustion path (compressed) ----
  { at: "consumer", log: "another message: 10 retries later, downstream still returns 5xx…", tone: "err", badge: { text: "5xx ×10", tone: "err" }, count: 11, rule: "max", dur: 1800 },
  { at: "consumer", log: "retry budget exhausted → computed delay = 0", tone: "err", rule: "max", dur: 1300 },
  { move: { from: "consumer", to: "broker", lane: "ack" }, log: "DELETE + Slack alert (maxRetryAlert) — a human takes over, queue stays healthy", tone: "err", alert: true, rule: "max", hidePacket: true, dur: 1700 },
];

/* ---------- decision table (from the consumer.js status switch) ---------- */

const RULES = [
  { id: "2xx", code: "200 · 201 · 202", action: "delete — done, ack to broker", tone: "ok" as const },
  { id: "4xx", code: "400 · 403 · 404 · 409", action: "delete — permanent; a retry can't fix a bad request or a duplicate", tone: "ok" as const },
  { id: "401", code: "401", action: "drop cached token → touch — instant retry with fresh auth", tone: "accent" as const },
  { id: "5xx", code: "500 · 503 · timeout", action: "touch — release with exponential delay 60 + n⁴s, capped at 11,000s", tone: "err" as const },
  { id: "51x", code: "511 – 519", action: "touch — static window: (code − 510) × 30min. The webhook chooses its own retry-after", tone: "err" as const },
  { id: "custom", code: "custom_delay in body", action: "overrides the computed delay — callers can schedule their own retry", tone: "accent" as const },
  { id: "max", code: "retries > max (10)", action: "delete + Slack alert — never poison the queue, never lose it silently", tone: "err" as const },
];

/* ---------- helpers ---------- */

const toneText: Record<Tone, string> = {
  ok: "text-good",
  err: "text-bad",
  info: "text-ink/85",
  accent: "text-accent",
  muted: "text-muted",
};

function laneKeyframes(from: NodeId, to: NodeId, lane: "main" | "touch" | "ack") {
  const a = NODES[from];
  const b = NODES[to];
  if (lane === "touch") {
    return { x: [a.x, (a.x + b.x) / 2, b.x], y: [a.y, 88, b.y] };
  }
  if (lane === "ack") {
    return { x: [a.x, (a.x + b.x) / 2, b.x], y: [a.y, 306, b.y] };
  }
  return { x: [a.x, b.x], y: [a.y, b.y] };
}

function NodeBox({ node, active }: { node: (typeof NODES)[NodeId]; active: boolean }) {
  return (
    <g>
      <rect
        x={node.x - node.w / 2}
        y={node.y - node.h / 2}
        width={node.w}
        height={node.h}
        rx={10}
        fill="var(--t-surface)"
        stroke={active ? "var(--t-accent)" : "var(--t-line-2)"}
        strokeWidth={active ? 2 : 1}
      />
      <text
        x={node.x}
        y={node.y - 4}
        textAnchor="middle"
        fill="var(--t-ink)"
        fontSize={13}
        fontWeight={600}
        fontFamily="var(--font-mono)"
      >
        {node.title}
      </text>
      <text
        x={node.x}
        y={node.y + 15}
        textAnchor="middle"
        fill="var(--t-muted)"
        fontSize={10}
        fontFamily="var(--font-mono)"
      >
        {node.sub}
      </text>
    </g>
  );
}

/* ---------- component ---------- */

export default function MessageFlowDiagram() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const [i, setI] = useState(0);

  const step = SCRIPT[i];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((prev) => (prev + 1) % SCRIPT.length), step.dur);
    return () => clearTimeout(t);
  }, [i, inView, reduced, step.dur]);

  const activeNode: NodeId | null = step.at ?? step.move?.to ?? null;
  const packetTarget = step.move
    ? laneKeyframes(step.move.from, step.move.to, step.move.lane ?? "main")
    : step.at
      ? { x: [NODES[step.at].x], y: [NODES[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      {/* Diagram */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Message lifecycle — live replay
          </p>
          {!reduced && (
            <p className="font-mono text-[10px] text-muted">
              step {i + 1}/{SCRIPT.length}
            </p>
          )}
        </div>

        <svg viewBox="0 0 920 360" className="block w-full" role="img" aria-label="Animated diagram: a message travels producer → push API → broker → consumer → webhook; 2xx deletes it, 5xx releases it back to the broker with a delay, exhausted retries delete it and alert Slack.">
          {/* main forward line */}
          <line x1={NODES.producer.x} y1={195} x2={NODES.webhook.x} y2={195} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* touch arc: consumer → broker (top) */}
          <path
            d={`M ${NODES.consumer.x} ${195 - 33} C ${NODES.consumer.x - 40} 88, ${NODES.broker.x + 40} 88, ${NODES.broker.x} ${195 - 33}`}
            fill="none"
            stroke={step.move?.lane === "touch" ? "var(--t-accent)" : "var(--t-line)"}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <text x={(NODES.consumer.x + NODES.broker.x) / 2} y={80} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill={step.move?.lane === "touch" ? "var(--t-accent)" : "var(--t-muted)"}>
            touch · release with delay
          </text>

          {/* ack arc: consumer → broker (bottom) */}
          <path
            d={`M ${NODES.consumer.x} ${195 + 33} C ${NODES.consumer.x - 40} 306, ${NODES.broker.x + 40} 306, ${NODES.broker.x} ${195 + 33}`}
            fill="none"
            stroke={step.move?.lane === "ack" ? "var(--t-good)" : "var(--t-line)"}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <text x={(NODES.consumer.x + NODES.broker.x) / 2} y={322} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill={step.move?.lane === "ack" ? "var(--t-good)" : "var(--t-muted)"}>
            delete · ack
          </text>

          {/* nodes */}
          {(Object.keys(NODES) as NodeId[]).map((id) => (
            <NodeBox key={id} node={NODES[id]} active={activeNode === id && !reduced} />
          ))}

          {/* reserved_count chip at broker */}
          {!reduced && typeof step.count === "number" && step.count > 0 && (
            <g>
              <rect x={NODES.broker.x - 56} y={132} width={112} height={20} rx={10} fill="var(--t-surface)" stroke="var(--t-line-2)" />
              <text x={NODES.broker.x} y={146} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--t-muted)">
                reserved_count: {step.count}
              </text>
            </g>
          )}

          {/* status badge at webhook */}
          {!reduced && step.badge && (
            <g>
              <rect x={NODES.webhook.x - 34} y={128} width={68} height={22} rx={11} fill="var(--t-surface)" stroke={step.badge.tone === "ok" ? "var(--t-good)" : "var(--t-bad)"} />
              <text x={NODES.webhook.x} y={143} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="var(--font-mono)" fill={step.badge.tone === "ok" ? "var(--t-good)" : "var(--t-bad)"}>
                {step.badge.text}
              </text>
            </g>
          )}

          {/* Slack alert node */}
          <g opacity={step.alert ? 1 : 0.4}>
            <rect x={NODES.consumer.x + 44} y={330 - 14} width={120} height={28} rx={8} fill="var(--t-surface)" stroke={step.alert ? "var(--t-bad)" : "var(--t-line)"} strokeWidth={step.alert ? 2 : 1} />
            <text x={NODES.consumer.x + 104} y={334} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill={step.alert ? "var(--t-bad)" : "var(--t-muted)"}>
              ⚠ Slack alert
            </text>
            {step.alert && (
              <line x1={NODES.consumer.x} y1={195 + 33} x2={NODES.consumer.x + 104} y2={316} stroke="var(--t-bad)" strokeWidth={1.5} strokeDasharray="4 4" />
            )}
          </g>

          {/* the packet */}
          {!reduced && packetTarget && (
            <motion.g
              animate={{
                x: packetTarget.x,
                y: packetTarget.y,
                opacity: step.hidePacket ? [1, 1, 0] : 1,
                scale: step.at ? [1, 1.5, 1] : 1,
              }}
              transition={{ duration: step.dur / 1000, ease: "easeInOut" }}
            >
              <circle r={7} fill="var(--t-accent)" />
              <circle r={12} fill="var(--t-accent)" opacity={0.25} />
            </motion.g>
          )}
        </svg>

        {/* live log line */}
        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">
              Animation disabled (reduced motion). The full decision table below tells the same story.
            </p>
          ) : (
            <p key={i} className={`font-mono text-xs sm:text-[13px] ${toneText[step.tone]}`}>
              <span className="text-muted">[worker]</span> {step.log}
            </p>
          )}
        </div>
      </div>

      {/* decision table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <p className="border-b border-line bg-surface-2/40 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          The status-code contract — what the worker does with every response
        </p>
        <ul>
          {RULES.map((r) => {
            const active = !reduced && step.rule === r.id;
            return (
              <li
                key={r.id}
                className={`flex flex-col gap-1 border-b border-line px-4 py-3 transition-colors duration-300 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4 ${
                  active ? "bg-accent/10" : ""
                }`}
              >
                <span
                  className={`shrink-0 font-mono text-xs font-semibold sm:w-44 ${
                    r.tone === "ok" ? "text-good" : r.tone === "err" ? "text-bad" : "text-accent"
                  }`}
                >
                  {r.code}
                </span>
                <span className={`text-sm ${active ? "text-ink" : "text-muted"}`}>{r.action}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
