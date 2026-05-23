"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { DiagramShell, StageNode, QueueGlyph, RetryLoop, StatusChip, StatusFlow, useFlowStepper, type FlowNode, type Tone } from "./flowKit";

/* ------------------------------------------------------------------ *
 * ShipmentFlowDiagram — DIGITAL_ACTIVATION, act 2: shipment.
 *
 * The notification-monitor (top) drives status; it pushes cards to
 * the notification WORKER queue (below), which routes each card by
 * delivery mode to a pool queue consumed by the delivery service.
 * Verified: ship.go:320 SHIPMENT_INITIATED, notification.go:351
 * SHIPMENT_INPROGRESS, :592 SHIPPED; helper.go:4176-4255 pool routing.
 * ------------------------------------------------------------------ */

const MY = 104, WY = 250;
const MONX = 336;

const N: Record<string, FlowNode> = {
  ship: { x: 92, y: MY, w: 116, h: 46, title: "SHIP / autoship", sub: "API or on-activate", kind: "plain" },
  notifmon: { x: MONX, y: MY, w: 168, h: 52, title: "notification", sub: "-monitor", kind: "monitor" },
  worker: { x: MONX, y: WY, w: 156, h: 46, title: "notification", sub: "per-card router", kind: "worker" },
  delivery: { x: 892, y: WY, w: 128, h: 50, title: "DELIVERY SVC", sub: "renders + sends", kind: "plain" },
};

const POOLS = [
  { id: "email", y: 172, label: "notification_pool_email" },
  { id: "sms", y: 214, label: "notification_pool_sms" },
  { id: "whatsapp", y: 256, label: "notification_pool_whatsapp" },
  { id: "pool", y: 298, label: "notification_pool  ·  multi-mode → all 3" },
];
const POOLX = 636;

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  pool?: string;
  log: string;
  tone: Tone;
  status?: string;
  statusTone?: Tone;
  retry?: boolean;
  worker?: boolean;
  hop?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { at: "ship", log: "ship API — or autoShipment fires automatically the moment activation completes", tone: "info", dur: 1700 },
  { at: "ship", log: "push to notification-monitor queue + monitor row → order SHIPMENT_INITIATED", tone: "accent", status: "SHIPMENT_INITIATED", statusTone: "accent", hop: true, dur: 1900 },
  { move: { from: "ship", to: "notifmon" }, log: "queue platform delivers the notification-monitor webhook → lock the monitor row", tone: "info", status: "SHIPMENT_INITIATED", statusTone: "accent", dur: 1600 },
  { move: { from: "notifmon", to: "worker" }, log: "monitor pushes all cards to the notification WORKER queue in batches → sets order SHIPMENT_INPROGRESS", tone: "accent", status: "SHIPMENT_INPROGRESS", statusTone: "accent", worker: true, dur: 2000 },
  { at: "worker", log: "the per-card worker inspects each card's delivery modes and picks the pool queue", tone: "info", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1600 },
  { at: "worker", pool: "email", log: "EMAIL only → notification_pool_email", tone: "accent", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1300 },
  { at: "worker", pool: "sms", log: "SMS only → notification_pool_sms", tone: "accent", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1200 },
  { at: "worker", pool: "whatsapp", log: "WHATSAPP only → notification_pool_whatsapp", tone: "accent", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1200 },
  { at: "worker", pool: "pool", log: "more than one mode → notification_pool, which fans the message to all three channels internally", tone: "accent", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1900 },
  { move: { from: "worker", to: "delivery" }, log: "the delivery microservice renders the template and sends the card details to the recipient", tone: "info", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1700 },
  { at: "notifmon", retry: true, log: "notification-monitor redelivered → unNotifiedCardsCount != 0 → return 500, retry until zero", tone: "err", status: "SHIPMENT_INPROGRESS", statusTone: "accent", dur: 1800 },
  { at: "notifmon", log: "every card notified → monitor sets order SHIPPED + S2S notification to the storefront", tone: "ok", status: "SHIPPED", statusTone: "ok", dur: 2300 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const STATUSES = ["ACTIVATED", "SHIPMENT_INITIATED", "SHIPMENT_INPROGRESS", "SHIPPED"];

function currentStatus(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status!;
  return "ACTIVATED";
}

export default function ShipmentFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useFlowStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "SHIPPED" : currentStatus(i);
  const pool = step.pool ? POOLS.find((p) => p.id === step.pool) : null;

  const target = pool
    ? { x: [N.worker.x, POOLX - 96], y: [N.worker.y, pool.y] }
    : step.move
      ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
      : step.at
        ? { x: [N[step.at].x], y: [N[step.at].y] }
        : null;

  return (
    <div ref={rootRef} className="not-prose">
      <DiagramShell
        title="Digital activation · shipment (e-voucher delivery)"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        log={step.log}
        logPrefix="ship"
        logTone={step.tone}
        footer={<StatusFlow statuses={STATUSES} current={status} />}
      >
        <svg viewBox="0 0 1000 350" className="block w-full" role="img" aria-label="Two-tier shipment flow: the notification-monitor sets SHIPMENT_INITIATED and SHIPMENT_INPROGRESS and retries until every card is notified, while the notification worker queue routes each card by delivery mode to the email, SMS or WhatsApp pool queue (or the combined pool for multi-mode) consumed by the delivery service, ending at SHIPPED.">
          {/* backbone */}
          <line x1={N.ship.x} y1={MY} x2={N.notifmon.x} y2={MY} stroke="var(--t-line)" strokeWidth={1.5} />
          <QueueGlyph x={(N.ship.x + N.notifmon.x) / 2} y={MY} active={!reduced && !!step.hop} />

          {/* monitor → worker */}
          <line x1={MONX} y1={MY + 26} x2={MONX} y2={WY - 23} stroke={!reduced && step.worker ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={!reduced && step.worker ? 1.8 : 1.2} strokeDasharray="4 4" />
          {!reduced && step.worker && <text x={MONX + 8} y={(MY + WY) / 2} fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-accent)">push cards ↓</text>}

          {/* worker → pools → delivery */}
          {POOLS.map((p) => {
            const on = !reduced && step.pool === p.id;
            const w = 196;
            return (
              <g key={p.id}>
                <line x1={N.worker.x + 20} y1={WY} x2={POOLX - w / 2} y2={p.y} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={1.2} strokeDasharray="4 4" />
                <line x1={POOLX + w / 2} y1={p.y} x2={N.delivery.x - N.delivery.w / 2} y2={WY} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={1.2} strokeDasharray="4 4" />
                <rect x={POOLX - w / 2} y={p.y - 13} width={w} height={26} rx={13} fill="var(--t-surface)" stroke={on ? "var(--t-accent)" : "var(--t-line-2)"} strokeWidth={on ? 2 : 1} />
                <text x={POOLX} y={p.y + 3.5} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill={on ? "var(--t-accent)" : "var(--t-muted)"}>
                  {p.label}
                </text>
              </g>
            );
          })}

          <RetryLoop x={MONX} yNodeTop={MY - 26} active={!reduced && !!step.retry} label="⟳ un-notified? 500" />

          {(Object.keys(N) as NodeId[]).map((id) => (
            <StageNode key={id} node={N[id]} active={activeNode === id && !reduced && !step.retry} danger={id === "notifmon" && !!step.retry && !reduced} good={id === "notifmon" && status === "SHIPPED" && !reduced} />
          ))}

          {!reduced && step.status && (
            <StatusChip x={MONX} yNodeBottom={MY + 26} text={step.status} tone={step.statusTone ?? "accent"} show />
          )}

          {!reduced && target && (
            <motion.g animate={{ x: target.x, y: target.y, scale: step.at && !pool ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill={step.retry ? "var(--t-bad)" : "var(--t-accent)"} />
              <circle r={11} fill="var(--t-accent)" opacity={0.22} />
            </motion.g>
          )}
        </svg>
      </DiagramShell>
    </div>
  );
}
