"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * NotificationFlowDiagram — the real send lifecycle of the delivery
 * microservice, replayed live:
 *
 *   client → validate → render template → resolve provider →
 *   channel send → recipient → (async) delivery-receipt → status
 *
 * Every step maps to the actual code: the express-validator schema,
 * secure-param decryption, Handlebars render with QR/barcode
 * attachments, provider config resolved by uuid/external_id, the
 * mail/sms/whatsapp provider factory, and the /track callback that
 * walks a message QUEUED → SENT → DELIVERED (or FAILED → failover).
 * ------------------------------------------------------------------ */

const NODES = {
  client: { x: 66, y: 176, w: 104, h: 58, title: "CLIENT", sub: "order / auth service" },
  api: { x: 236, y: 176, w: 132, h: 64, title: "DELIVERY API", sub: "validate · decrypt" },
  template: { x: 430, y: 176, w: 140, h: 64, title: "TEMPLATE", sub: "Handlebars · QR" },
  provider: { x: 638, y: 176, w: 140, h: 64, title: "PROVIDER", sub: "SendGrid · Twilio…" },
  recipient: { x: 852, y: 176, w: 108, h: 58, title: "RECIPIENT", sub: "inbox / handset" },
  track: { x: 430, y: 300, w: 132, h: 44, title: "/track", sub: "receipt webhook" },
} as const;

type NodeId = keyof typeof NODES;
type Tone = "ok" | "err" | "info" | "accent" | "muted";
type Channel = "email" | "sms" | "whatsapp" | null;
type Status = "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | null;

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "main" | "receipt" };
  at?: NodeId;
  log: string;
  tone: Tone;
  channel?: Channel;
  status?: Status;
  providerLabel?: string;
  hidePacket?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  // ----- email happy path -----
  { move: { from: "client", to: "api" }, log: "POST /api/email  refno#WH-8842 · to: a•••@gmail.com", tone: "info", channel: "email", dur: 1300 },
  { at: "api", log: "express-validator passes → decrypt secure params (aes256/JWT)", tone: "accent", channel: "email", dur: 1500 },
  { move: { from: "api", to: "template" }, log: "retrieve template #1204 · locale en-IN · store WH", tone: "info", channel: "email", dur: 1200 },
  { at: "template", log: "Handlebars render + compile subject → generate QR + barcode attachments", tone: "accent", channel: "email", dur: 1800 },
  { at: "template", log: "resolve provider config by external_id → decrypt aes256 config", tone: "info", channel: "email", dur: 1500 },
  { move: { from: "template", to: "provider" }, log: "hand off to mail provider factory", tone: "info", channel: "email", providerLabel: "SendGrid", dur: 1200 },
  { move: { from: "provider", to: "recipient" }, log: "SendGrid accepts → 202 · message QUEUED, tracking row written", tone: "ok", channel: "email", status: "QUEUED", providerLabel: "SendGrid", dur: 1300 },
  { at: "recipient", log: "provider reports SENT → tracking delayed-enqueued for reconciliation", tone: "ok", channel: "email", status: "SENT", providerLabel: "SendGrid", dur: 1400 },
  // ----- delivery receipt loop -----
  { move: { from: "provider", to: "track", lane: "receipt" }, log: "…seconds later: SendGrid POSTs a delivery-receipt webhook", tone: "accent", channel: "email", status: "SENT", providerLabel: "SendGrid", dur: 1600 },
  { at: "track", log: "/track/email/sendgrid → map provider status → update message row", tone: "info", channel: "email", status: "SENT", dur: 1500 },
  { at: "track", log: "status advances SENT → DELIVERED. Any message's journey is one lookup.", tone: "ok", channel: "email", status: "DELIVERED", dur: 1700 },
  // ----- SMS on the same rails -----
  { move: { from: "client", to: "api" }, log: "POST /api/sms  refno#WH-8843 · same service, different channel", tone: "info", channel: "sms", dur: 1300 },
  { move: { from: "api", to: "provider" }, log: "channel-agnostic core → SMS provider factory (one of 7 vendors)", tone: "info", channel: "sms", providerLabel: "Gupshup", dur: 1300 },
  { move: { from: "provider", to: "recipient" }, log: "Gupshup accepts → SENT", tone: "ok", channel: "sms", status: "SENT", providerLabel: "Gupshup", dur: 1200 },
  // ----- failover -----
  { move: { from: "client", to: "provider" }, log: "next SMS: primary vendor returns 5xx…", tone: "err", channel: "sms", status: "FAILED", providerLabel: "Vendor A", dur: 1500 },
  { at: "provider", log: "providers are an ordered array — fail over to the next vendor, no request lost", tone: "accent", channel: "sms", providerLabel: "Vendor B", dur: 1700 },
  { move: { from: "provider", to: "recipient" }, log: "Vendor B accepts → SENT. The caller never saw the failure.", tone: "ok", channel: "sms", status: "SENT", providerLabel: "Vendor B", dur: 1500 },
];

const CHANNELS: { id: Exclude<Channel, null>; label: string }[] = [
  { id: "email", label: "EMAIL" },
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WHATSAPP" },
];

const STATUS_TONE: Record<NonNullable<Status>, string> = {
  QUEUED: "var(--t-muted)",
  SENT: "var(--t-accent)",
  DELIVERED: "var(--t-good)",
  FAILED: "var(--t-bad)",
};

const toneText: Record<Tone, string> = {
  ok: "text-good",
  err: "text-bad",
  info: "text-ink/85",
  accent: "text-accent",
  muted: "text-muted",
};

function NodeBox({ node, active, label }: { node: (typeof NODES)[NodeId]; active: boolean; label?: string }) {
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
      <text x={node.x} y={node.y - 4} textAnchor="middle" fill="var(--t-ink)" fontSize={13} fontWeight={600} fontFamily="var(--font-mono)">
        {node.title}
      </text>
      <text x={node.x} y={node.y + 15} textAnchor="middle" fill="var(--t-muted)" fontSize={10} fontFamily="var(--font-mono)">
        {label ?? node.sub}
      </text>
    </g>
  );
}

export default function NotificationFlowDiagram() {
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
    ? step.move.lane === "receipt"
      ? { x: [NODES[step.move.from].x, NODES[step.move.from].x, NODES.track.x], y: [NODES[step.move.from].y, NODES.track.y, NODES.track.y] }
      : { x: [NODES[step.move.from].x, NODES[step.move.to].x], y: [NODES[step.move.from].y, NODES[step.move.to].y] }
    : step.at
      ? { x: [NODES[step.at].x], y: [NODES[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Notification lifecycle — live replay
          </p>
          {!reduced && <p className="font-mono text-[10px] text-muted">step {i + 1}/{SCRIPT.length}</p>}
        </div>

        <DiagramScroll>
        <svg viewBox="0 0 920 360" className="block w-full" role="img" aria-label="Animated diagram: a request flows client → delivery API → template render → provider → recipient across email, SMS and WhatsApp channels; providers post delivery receipts back to /track which walks each message from queued to delivered, and failed sends fail over to the next vendor.">
          {/* channel selector */}
          {CHANNELS.map((c, idx) => {
            const on = !reduced && step.channel === c.id;
            const x = 236 + idx * 150;
            return (
              <g key={c.id}>
                <rect x={x - 62} y={54} width={124} height={26} rx={13} fill={on ? "var(--t-accent)" : "var(--t-surface)"} stroke={on ? "var(--t-accent)" : "var(--t-line-2)"} />
                <text x={x} y={71} textAnchor="middle" fontSize={11} fontWeight={600} fontFamily="var(--font-mono)" fill={on ? "var(--t-accent-contrast)" : "var(--t-muted)"}>
                  {c.label}
                </text>
              </g>
            );
          })}

          {/* forward line */}
          <line x1={NODES.client.x} y1={176} x2={NODES.recipient.x} y2={176} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* receipt arc: provider → track */}
          <path
            d={`M ${NODES.provider.x} ${176 + 32} C ${NODES.provider.x} 300, ${NODES.track.x + 120} 300, ${NODES.track.x + NODES.track.w / 2} 300`}
            fill="none"
            stroke={step.move?.lane === "receipt" ? "var(--t-accent)" : "var(--t-line)"}
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          {/* track → status feedback (short link up to line) */}
          <line x1={NODES.track.x} y1={NODES.track.y - 22} x2={NODES.track.x} y2={NODES.template.y + 32} stroke="var(--t-line)" strokeWidth={1.2} strokeDasharray="4 4" />

          {(Object.keys(NODES) as NodeId[]).map((id) => (
            <NodeBox
              key={id}
              node={NODES[id]}
              active={activeNode === id && !reduced}
              label={id === "provider" && step.providerLabel && !reduced ? step.providerLabel : undefined}
            />
          ))}

          {/* status pill */}
          {!reduced && step.status && (
            <g>
              <rect x={NODES.recipient.x - 54} y={110} width={108} height={24} rx={12} fill="var(--t-surface)" stroke={STATUS_TONE[step.status]} />
              <circle cx={NODES.recipient.x - 34} cy={122} r={4} fill={STATUS_TONE[step.status]} />
              <text x={NODES.recipient.x + 8} y={126} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="var(--font-mono)" fill={STATUS_TONE[step.status]}>
                {step.status}
              </text>
            </g>
          )}

          {/* packet */}
          {!reduced && target && (
            <motion.g
              animate={{ x: target.x, y: target.y, opacity: step.hidePacket ? [1, 1, 0] : 1, scale: step.at ? [1, 1.5, 1] : 1 }}
              transition={{ duration: step.dur / 1000, ease: "easeInOut" }}
            >
              <circle r={7} fill="var(--t-accent)" />
              <circle r={12} fill="var(--t-accent)" opacity={0.25} />
            </motion.g>
          )}
        </svg>
        </DiagramScroll>

        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">
              Animation disabled (reduced motion). The prose and provider matrix below describe the same flow.
            </p>
          ) : (
            <p key={i} className={`font-mono text-xs sm:text-[13px] ${toneText[step.tone]}`}>
              <span className="text-muted">[delivery]</span> {step.log}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
