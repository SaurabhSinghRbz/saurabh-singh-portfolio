"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { DiagramShell, StageNode, QueueGlyph, RetryLoop, StatusChip, StatusFlow, useFlowStepper, type FlowNode, type Tone } from "./flowKit";

/* ------------------------------------------------------------------ *
 * ReshipmentFlowDiagram — DIGITAL_ACTIVATION, act 3: reshipment.
 *
 * Two monitor queues in the backbone: reset-pin-monitor → notification
 * -monitor. Verified: reship.go:133 RESET_PIN_INITIATED; reset.go:235
 * pushes activation-reset-pin worker queue, :527 pushes notification-
 * monitor, :562 status from message (RESHIP_INITIATED); then the same
 * shipment engine runs to SHIPPED.
 * ------------------------------------------------------------------ */

const C1 = 322, C2 = 652;
const MY = 100, WY = 246, TY = 344;

const N: Record<string, FlowNode> = {
  reship: { x: 86, y: MY, w: 112, h: 46, title: "RESHIP", sub: "API · new recipient", kind: "plain" },
  resetmon: { x: C1, y: MY, w: 168, h: 52, title: "reset-pin", sub: "-monitor", kind: "monitor" },
  notifmon: { x: C2, y: MY, w: 168, h: 52, title: "notification", sub: "-monitor", kind: "monitor" },
  shipped: { x: 902, y: MY, w: 118, h: 48, title: "SHIPPED", sub: "reship done", kind: "plain" },
  resetw: { x: C1, y: WY, w: 158, h: 46, title: "activation-reset-pin", sub: "per-card check", kind: "worker" },
  notifw: { x: C2, y: WY, w: 150, h: 46, title: "notification", sub: "per-card router", kind: "worker" },
  resett: { x: C1, y: TY, w: 150, h: 32, title: "router → provider", sub: "reset PIN", kind: "target" },
  notift: { x: C2, y: TY, w: 156, h: 32, title: "pools → delivery", sub: "resend voucher", kind: "target" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone: Tone;
  status?: string;
  statusMon?: "resetmon" | "notifmon";
  statusTone?: Tone;
  retryMon?: "resetmon" | "notifmon";
  worker?: "resetw" | "notifw";
  hop?: "reship-reset" | "reset-notif" | "notif-shipped";
  dur: number;
};

const SCRIPT: Step[] = [
  { at: "reship", log: "an already-SHIPPED order needs resending — wrong inbox, a changed number, an expired PIN", tone: "info", dur: 1900 },
  { at: "reship", log: "reship API → push activation-reset-pin-monitor queue + monitor row → order RESET_PIN_INITIATED", tone: "accent", status: "RESET_PIN_INITIATED", statusMon: "resetmon", statusTone: "accent", hop: "reship-reset", dur: 1900 },
  { move: { from: "reship", to: "resetmon" }, log: "webhook delivered → reset-pin-monitor locks its row (valid state: RESET_PIN_INITIATED)", tone: "info", status: "RESET_PIN_INITIATED", statusMon: "resetmon", statusTone: "accent", dur: 1600 },
  { move: { from: "resetmon", to: "resetw" }, log: "monitor pushes all cards to the activation-reset-pin WORKER queue in batches", tone: "accent", status: "RESET_PIN_INITIATED", statusMon: "resetmon", statusTone: "accent", worker: "resetw", dur: 1800 },
  { move: { from: "resetw", to: "resett" }, log: "per card: recipient modified OR PIN expired? → reset the PIN via the provider. Otherwise return 200 and touch nothing", tone: "info", worker: "resetw", dur: 2100 },
  { at: "resetmon", retryMon: "resetmon", log: "monitor redelivered until every card is checked — unfinished? return 500", tone: "err", status: "RESET_PIN_INITIATED", statusMon: "resetmon", statusTone: "accent", dur: 1700 },
  { move: { from: "resetmon", to: "notifmon" }, log: "all cards done → reset-pin-monitor pushes to the notification-monitor (wallet orders re-add to wallet first)", tone: "accent", status: "RESHIP_INITIATED", statusMon: "notifmon", statusTone: "accent", hop: "reset-notif", dur: 2000 },
  { move: { from: "notifmon", to: "notifw" }, log: "notification-monitor pushes cards to the notification worker → order SHIPMENT_INPROGRESS", tone: "accent", status: "SHIPMENT_INPROGRESS", statusMon: "notifmon", statusTone: "accent", worker: "notifw", dur: 1800 },
  { move: { from: "notifw", to: "notift" }, log: "each card routed by delivery mode to its pool queue → the delivery service resends with fresh details", tone: "info", worker: "notifw", dur: 1800 },
  { at: "notifmon", retryMon: "notifmon", log: "notification-monitor redelivered until unNotifiedCardsCount == 0 → 500 each time", tone: "err", status: "SHIPMENT_INPROGRESS", statusMon: "notifmon", statusTone: "accent", dur: 1700 },
  { move: { from: "notifmon", to: "shipped" }, log: "every card re-notified → order back to SHIPPED. Reshipment complete.", tone: "ok", status: "SHIPPED", statusMon: "notifmon", statusTone: "ok", hop: "notif-shipped", dur: 2300 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const STATUSES = ["SHIPPED", "RESET_PIN_INITIATED", "RESHIP_INITIATED", "SHIPMENT_INPROGRESS", "SHIPPED ✓"];
const MON_X: Record<string, number> = { resetmon: C1, notifmon: C2 };

function currentStatus(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status === "SHIPPED" && k === SCRIPT.length - 1 ? "SHIPPED ✓" : SCRIPT[k].status!;
  return "SHIPPED";
}

export default function ReshipmentFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useFlowStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "SHIPPED ✓" : currentStatus(i);
  const cols: { worker: string; x: number }[] = [{ worker: "resetw", x: C1 }, { worker: "notifw", x: C2 }];

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <DiagramShell
        title="Digital activation · reshipment (resend safely)"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        log={step.log}
        logPrefix="reship"
        logTone={step.tone}
        footer={<StatusFlow statuses={STATUSES} current={status} />}
      >
        <svg viewBox="0 0 1000 400" className="block w-full" role="img" aria-label="Two-tier reshipment: the reset-pin-monitor pushes every card to the reset-pin worker queue which resets PINs only when the recipient changed or the PIN expired, then hands off to the notification-monitor which reruns the shipment engine as RESHIP_INITIATED and SHIPMENT_INPROGRESS until the order is SHIPPED again.">
          {/* backbone */}
          <line x1={N.reship.x} y1={MY} x2={N.shipped.x} y2={MY} stroke="var(--t-line)" strokeWidth={1.5} />
          <QueueGlyph x={(N.reship.x + N.resetmon.x) / 2} y={MY} active={!reduced && step.hop === "reship-reset"} />
          <QueueGlyph x={(N.resetmon.x + N.notifmon.x) / 2} y={MY} active={!reduced && step.hop === "reset-notif"} />
          <text x={(N.resetmon.x + N.notifmon.x) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop === "reset-notif" ? "var(--t-accent)" : "var(--t-muted)"}>all checked →</text>

          {/* monitor → worker → target */}
          {cols.map((c) => {
            const on = !reduced && step.worker === c.worker;
            return (
              <g key={c.worker}>
                <line x1={c.x} y1={MY + 26} x2={c.x} y2={WY - 23} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                <line x1={c.x} y1={WY + 23} x2={c.x} y2={TY - 16} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                {on && <text x={c.x + 8} y={(MY + WY) / 2} fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-accent)">push cards ↓</text>}
              </g>
            );
          })}

          {(["resetmon", "notifmon"] as const).map((m) => (
            <RetryLoop key={m} x={MON_X[m]} yNodeTop={MY - 26} active={!reduced && step.retryMon === m} label="⟳ 500 retry" />
          ))}

          {(Object.keys(N) as NodeId[]).map((id) => (
            <StageNode key={id} node={N[id]} active={activeNode === id && !reduced && !step.retryMon} good={id === "shipped" && status === "SHIPPED ✓" && !reduced} />
          ))}

          {!reduced && step.statusMon && step.status && (
            <StatusChip x={MON_X[step.statusMon]} yNodeBottom={MY + 26} text={step.status} tone={step.statusTone ?? "accent"} show />
          )}

          {!reduced && target && (
            <motion.g animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill={step.retryMon ? "var(--t-bad)" : "var(--t-accent)"} />
              <circle r={11} fill="var(--t-accent)" opacity={0.22} />
            </motion.g>
          )}
        </svg>
      </DiagramShell>
    </div>
  );
}
