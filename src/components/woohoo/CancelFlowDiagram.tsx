"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { DiagramShell, StageNode, QueueGlyph, RetryLoop, StatusChip, StatusFlow, useFlowStepper, type FlowNode, type Tone } from "./flowKit";

/* ------------------------------------------------------------------ *
 * CancelFlowDiagram — cancelling an order, three monitor queues.
 *
 * Backbone: cancel-validation-monitor → cancel-monitor → cancel-
 * wallet-card-monitor → CLOSED. Verified: orders.go:2345 CANCEL_
 * VALIDATION_INITIATED; cancelValidations.go:306 INPROGRESS, :560
 * CANCEL_INITIATED, :594 pushes cancel-monitor; cancellations.go:213
 * CANCEL_INPROGRESS, :477 pushes cancel-wallet-card-monitor / :538
 * CLOSED; cancelWalletCards.go:361 CLOSED.
 * ------------------------------------------------------------------ */

const C1 = 300, C2 = 600, C3 = 886;
const MY = 110, WY = 254, TY = 346;

const N: Record<string, FlowNode> = {
  cancel: { x: 82, y: MY, w: 104, h: 46, title: "CANCEL", sub: "API request", kind: "plain" },
  m1: { x: C1, y: MY, w: 162, h: 52, title: "cancel-validation", sub: "-monitor", kind: "monitor" },
  m2: { x: C2, y: MY, w: 140, h: 52, title: "cancel", sub: "-monitor", kind: "monitor" },
  m3: { x: C3, y: MY, w: 168, h: 52, title: "cancel-wallet-card", sub: "-monitor", kind: "monitor" },
  w1: { x: C1, y: WY, w: 158, h: 46, title: "cancel-validation", sub: "check 1-by-1", kind: "worker" },
  w2: { x: C2, y: WY, w: 150, h: 46, title: "activation-cancel", sub: "void 1-by-1", kind: "worker" },
  w3: { x: C3, y: WY, w: 166, h: 46, title: "cancel-wallet-card", sub: "pull 1-by-1", kind: "worker" },
  t1: { x: C1, y: TY, w: 138, h: 32, title: "card balance", sub: "untouched?", kind: "target" },
  t2: { x: C2, y: TY, w: 140, h: 32, title: "router → provider", sub: "void card", kind: "target" },
  t3: { x: C3, y: TY, w: 140, h: 32, title: "Woohoo Wallet", sub: "remove card", kind: "target" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone: Tone;
  status?: string;
  statusMon?: "m1" | "m2" | "m3";
  statusTone?: Tone;
  retryMon?: "m1" | "m2" | "m3";
  worker?: "w1" | "w2" | "w3";
  hop?: "cancel-m1" | "m1-m2" | "m2-m3";
  fail?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { at: "cancel", log: "cancel requested — allowed from ACTIVATED, SHIPPED, DELIVERED, RETURNED or VALIDATION_FAILED. (low-count orders cancel sync → CLOSED 201.)", tone: "info", dur: 2200 },
  { at: "cancel", log: "digital & physical activation orders never cancel blind → push activation-cancel-validation-monitor → CANCEL_VALIDATION_INITIATED", tone: "accent", status: "CANCEL_VALIDATION_INITIATED", statusMon: "m1", statusTone: "accent", hop: "cancel-m1", dur: 2000 },
  { move: { from: "cancel", to: "m1" }, log: "webhook → cancel-validation-monitor locks its row", tone: "info", status: "CANCEL_VALIDATION_INITIATED", statusMon: "m1", statusTone: "accent", dur: 1500 },
  { move: { from: "m1", to: "w1" }, log: "monitor pushes cards to the activation-cancel-validation WORKER queue → order CANCEL_VALIDATION_INPROGRESS", tone: "accent", status: "CANCEL_VALIDATION_INPROGRESS", statusMon: "m1", statusTone: "accent", worker: "w1", dur: 1900 },
  { move: { from: "w1", to: "t1" }, log: "per card: balance untouched? not redeemed? provider supports cancel-reverse?", tone: "info", worker: "w1", dur: 1800 },
  { at: "m1", retryMon: "m1", log: "monitor redelivered until every card is validated → 500", tone: "err", status: "CANCEL_VALIDATION_INPROGRESS", statusMon: "m1", statusTone: "accent", dur: 1600 },
  { at: "m1", fail: true, log: "a spent card fails validation → the cancel is refused. Money stays where it already went.", tone: "err", status: "CANCEL_VALIDATION_INPROGRESS", statusMon: "m1", statusTone: "err", dur: 1900 },
  { move: { from: "m1", to: "m2" }, log: "all cards validated → cancel-validation-monitor pushes to the cancel-monitor → order CANCEL_INITIATED", tone: "accent", status: "CANCEL_INITIATED", statusMon: "m2", statusTone: "accent", hop: "m1-m2", dur: 1900 },
  { move: { from: "m2", to: "w2" }, log: "cancel-monitor pushes cards to the activation-cancel WORKER queue → order CANCEL_INPROGRESS", tone: "accent", status: "CANCEL_INPROGRESS", statusMon: "m2", statusTone: "accent", worker: "w2", dur: 1900 },
  { move: { from: "w2", to: "t2" }, log: "per card: woohoo-router → provider void — every reversal recorded in card_transactions", tone: "info", worker: "w2", dur: 1800 },
  { at: "m2", retryMon: "m2", log: "monitor redelivered until every card is voided → 500", tone: "err", status: "CANCEL_INPROGRESS", statusMon: "m2", statusTone: "accent", dur: 1600 },
  { move: { from: "m2", to: "m3" }, log: "cards that were added to wallets → cancel-monitor pushes the cancel-wallet-card-monitor → CANCEL_WALLET_INITIATED", tone: "accent", status: "CANCEL_WALLET_INITIATED", statusMon: "m3", statusTone: "accent", hop: "m2-m3", dur: 2000 },
  { move: { from: "m3", to: "w3" }, log: "monitor pushes cards to the activation-cancel-wallet-card WORKER queue → order CANCEL_WALLET_INPROGRESS", tone: "accent", status: "CANCEL_WALLET_INPROGRESS", statusMon: "m3", statusTone: "accent", worker: "w3", dur: 1800 },
  { move: { from: "w3", to: "t3" }, log: "worker pulls each card back out of the customer's Woohoo Wallet", tone: "info", worker: "w3", dur: 1700 },
  { at: "m3", retryMon: "m3", log: "monitor redelivered until every card is pulled → 500", tone: "err", status: "CANCEL_WALLET_INPROGRESS", statusMon: "m3", statusTone: "accent", dur: 1600 },
  { at: "m3", log: "every card void, every wallet clean → order CLOSED + S2S notification. (No-wallet orders reach CLOSED straight from the cancel-monitor.)", tone: "ok", status: "CLOSED", statusMon: "m3", statusTone: "ok", dur: 2500 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const STATUSES = ["CANCEL_VALIDATION_INITIATED", "CANCEL_VALIDATION_INPROGRESS", "CANCEL_INITIATED", "CANCEL_INPROGRESS", "CANCEL_WALLET_INPROGRESS", "CLOSED"];
const MON_X: Record<string, number> = { m1: C1, m2: C2, m3: C3 };
const COLS: { worker: string; x: number }[] = [{ worker: "w1", x: C1 }, { worker: "w2", x: C2 }, { worker: "w3", x: C3 }];

function currentStatus(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status!;
  return null;
}

export default function CancelFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useFlowStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "CLOSED" : currentStatus(i);

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <DiagramShell
        title="Cancelling an order — validate, void, close"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        log={step.log}
        logPrefix="cancel"
        logTone={step.tone}
        footer={<StatusFlow statuses={STATUSES} current={status} />}
      >
        <svg viewBox="0 0 1000 400" className="block w-full" role="img" aria-label="Two-tier cancel flow: the cancel-validation-monitor validates every card via its worker queue, then the cancel-monitor voids each card at the provider through its worker queue, then the cancel-wallet-card-monitor pulls cards out of wallets, each monitor retrying via 500 until done, reaching the terminal CLOSED state.">
          {/* backbone */}
          <line x1={N.cancel.x} y1={MY} x2={N.m3.x} y2={MY} stroke="var(--t-line)" strokeWidth={1.5} />
          <QueueGlyph x={(N.cancel.x + N.m1.x) / 2} y={MY} active={!reduced && step.hop === "cancel-m1"} />
          <QueueGlyph x={(N.m1.x + N.m2.x) / 2} y={MY} active={!reduced && step.hop === "m1-m2"} />
          <text x={(N.m1.x + N.m2.x) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop === "m1-m2" ? "var(--t-accent)" : "var(--t-muted)"}>all valid →</text>
          <QueueGlyph x={(N.m2.x + N.m3.x) / 2} y={MY} active={!reduced && step.hop === "m2-m3"} />
          <text x={(N.m2.x + N.m3.x) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop === "m2-m3" ? "var(--t-accent)" : "var(--t-muted)"}>all void →</text>

          {/* monitor → worker → target */}
          {COLS.map((c) => {
            const on = !reduced && step.worker === c.worker;
            return (
              <g key={c.worker}>
                <line x1={c.x} y1={MY + 26} x2={c.x} y2={WY - 23} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                <line x1={c.x} y1={WY + 23} x2={c.x} y2={TY - 16} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                {on && <text x={c.x + 8} y={(MY + WY) / 2} fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-accent)">push cards ↓</text>}
              </g>
            );
          })}

          {(["m1", "m2", "m3"] as const).map((m) => (
            <RetryLoop key={m} x={MON_X[m]} yNodeTop={MY - 26} active={!reduced && step.retryMon === m} label="⟳ 500 retry" />
          ))}

          {(Object.keys(N) as NodeId[]).map((id) => (
            <StageNode
              key={id}
              node={N[id]}
              active={activeNode === id && !reduced && !step.retryMon && !step.fail}
              danger={id === "m1" && !!step.fail && !reduced}
              good={id === "m3" && status === "CLOSED" && !reduced}
            />
          ))}

          {!reduced && step.statusMon && step.status && (
            <StatusChip x={MON_X[step.statusMon]} yNodeBottom={MY + 26} text={step.status} tone={step.statusTone ?? "accent"} show />
          )}

          {!reduced && target && (
            <motion.g animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill={step.retryMon || step.fail ? "var(--t-bad)" : "var(--t-accent)"} />
              <circle r={11} fill="var(--t-accent)" opacity={0.22} />
            </motion.g>
          )}
        </svg>
      </DiagramShell>
    </div>
  );
}
