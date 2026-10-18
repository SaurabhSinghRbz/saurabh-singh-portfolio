"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { DiagramShell, StageNode, QueueGlyph, RetryLoop, StatusChip, StatusFlow, useFlowStepper, type FlowNode, type Tone } from "./flowKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * DigitalActivationDiagram — DIGITAL_ACTIVATION, act 1.
 *
 * Monitor backbone (top): publish-activation-monitor → activation-
 * monitor → add-card-to-wallet-monitor. Each monitor pushes cards
 * DOWN to its worker queue, sets the order status, retries via 500
 * until every card_transaction is done, then hands off to the next
 * monitor. Status-set lines verified: publish.go:816/INITIATED,
 * activations.go:1492/PROCESSING & :1817/UPDATE_WALLET_INITIATED,
 * wallet.go:279/UPDATE_WALLET_INPROGRESS & :358/ACTIVATED.
 * ------------------------------------------------------------------ */

const C1 = 300, C2 = 600, C3 = 886;
const MY = 110, WY = 254, TY = 346;

const N: Record<string, FlowNode> = {
  create: { x: 84, y: MY, w: 108, h: 46, title: "CREATE", sub: "POST /v1/orders", kind: "plain" },
  m1: { x: C1, y: MY, w: 158, h: 52, title: "publish-activation", sub: "-monitor", kind: "monitor" },
  m2: { x: C2, y: MY, w: 150, h: 52, title: "activation", sub: "-monitor", kind: "monitor" },
  m3: { x: C3, y: MY, w: 160, h: 52, title: "add-to-wallet", sub: "-monitor", kind: "monitor" },
  w1: { x: C1, y: WY, w: 150, h: 46, title: "publish-activation", sub: "insert card rows", kind: "worker" },
  w2: { x: C2, y: WY, w: 150, h: 46, title: "activation", sub: "activate 1-by-1", kind: "worker" },
  w3: { x: C3, y: WY, w: 158, h: 46, title: "add-to-wallet", sub: "add 1-by-1", kind: "worker" },
  t1: { x: C1, y: TY, w: 128, h: 32, title: "MySQL", sub: "card rows + txns", kind: "target" },
  t2: { x: C2, y: TY, w: 138, h: 32, title: "router → provider", sub: "activate card", kind: "target" },
  t3: { x: C3, y: TY, w: 140, h: 32, title: "Woohoo Wallet", sub: "customer wallet", kind: "target" },
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
  batch?: number;
  hop?: "create-m1" | "m1-m2" | "m2-m3";
  dur: number;
};

const SCRIPT: Step[] = [
  { at: "create", log: "POST /v1/orders (sync:false) → order + items + publishActivation monitor row → push to publish-activation-monitor queue → 202", tone: "accent", status: "PENDING", statusMon: "m1", statusTone: "muted", hop: "create-m1", dur: 2200 },
  { move: { from: "create", to: "m1" }, log: "queue platform delivers the publish-activation-monitor message back as a webhook", tone: "info", status: "PENDING", statusMon: "m1", statusTone: "muted", dur: 1500 },
  { at: "m1", log: "monitor locks its row (FetchForUpdate) — a redelivered message can never double-process", tone: "accent", status: "PENDING", statusMon: "m1", statusTone: "muted", dur: 1700 },
  { move: { from: "m1", to: "w1" }, log: "monitor splits 1,00,000 cards into batches → fans them to the publish-activation WORKER queue (goroutines)", tone: "accent", status: "PENDING", statusMon: "m1", statusTone: "muted", worker: "w1", batch: 0.5, dur: 2000 },
  { move: { from: "w1", to: "t1" }, log: "worker bulk-inserts card rows into MySQL — one card_transaction per card", tone: "info", worker: "w1", batch: 1, dur: 1600 },
  { at: "m1", retryMon: "m1", log: "monitor redelivered → all cards inserted yet? cardsCount != required → return 500 (retry me)", tone: "err", status: "PENDING", statusMon: "m1", statusTone: "muted", dur: 1800 },
  { move: { from: "m1", to: "m2" }, log: "all cards inserted → publish-activation-monitor pushes to the activation-monitor queue", tone: "accent", status: "INITIATED", statusMon: "m2", statusTone: "accent", hop: "m1-m2", dur: 1800 },
  { at: "m2", log: "activation-monitor locks its row — order is now INITIATED", tone: "info", status: "INITIATED", statusMon: "m2", statusTone: "accent", dur: 1500 },
  { move: { from: "m2", to: "w2" }, log: "monitor pushes unpushed cards to the activation WORKER queue in batches", tone: "accent", status: "INITIATED", statusMon: "m2", statusTone: "accent", worker: "w2", batch: 0.5, dur: 1800 },
  { at: "m2", log: "all cards pushed to activation → monitor sets order status PROCESSING", tone: "ok", status: "PROCESSING", statusMon: "m2", statusTone: "accent", dur: 1700 },
  { move: { from: "w2", to: "t2" }, log: "worker activates each card 1-by-1: woohoo-router → transaction id → provider activate API (worker requires status PROCESSING first)", tone: "info", status: "PROCESSING", statusMon: "m2", statusTone: "accent", worker: "w2", batch: 1, dur: 2100 },
  { at: "m2", retryMon: "m2", log: "monitor redelivered → all cards active yet? FetchCardsCountWithPendingTxns != 0 → 500 until zero", tone: "err", status: "PROCESSING", statusMon: "m2", statusTone: "accent", dur: 1800 },
  { move: { from: "m2", to: "m3" }, log: "every card activated → activation-monitor pushes to the add-card-to-wallet-monitor queue (store wallet enabled)", tone: "accent", status: "UPDATE_WALLET_INITIATED", statusMon: "m3", statusTone: "accent", hop: "m2-m3", dur: 2000 },
  { at: "m3", log: "wallet monitor locks its row — order UPDATE_WALLET_INITIATED", tone: "info", status: "UPDATE_WALLET_INITIATED", statusMon: "m3", statusTone: "accent", dur: 1600 },
  { move: { from: "m3", to: "w3" }, log: "monitor pushes cards to the add-card-to-wallet WORKER queue → sets order UPDATE_WALLET_INPROGRESS", tone: "accent", status: "UPDATE_WALLET_INPROGRESS", statusMon: "m3", statusTone: "accent", worker: "w3", batch: 0.6, dur: 1900 },
  { move: { from: "w3", to: "t3" }, log: "worker adds each card to the customer's Woohoo Wallet", tone: "info", worker: "w3", batch: 1, dur: 1600 },
  { at: "m3", retryMon: "m3", log: "monitor redelivered until cardsNotAddedToWalletCount == 0 → 500 each time", tone: "err", status: "UPDATE_WALLET_INPROGRESS", statusMon: "m3", statusTone: "accent", dur: 1700 },
  { at: "m3", log: "all cards in wallet → wallet-monitor sets order ACTIVATED. autoShipment on? → straight into SHIPMENT_INITIATED ↓", tone: "ok", status: "ACTIVATED", statusMon: "m3", statusTone: "ok", dur: 2400 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const STATUSES = ["PENDING", "INITIATED", "PROCESSING", "UPDATE_WALLET_INITIATED", "UPDATE_WALLET_INPROGRESS", "ACTIVATED"];
const MON_X: Record<string, number> = { m1: C1, m2: C2, m3: C3 };
const COLS: { worker: string; x: number }[] = [{ worker: "w1", x: C1 }, { worker: "w2", x: C2 }, { worker: "w3", x: C3 }];

function currentStatus(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status!;
  return null;
}

export default function DigitalActivationDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useFlowStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "ACTIVATED" : currentStatus(i);
  const batchPct = reduced ? 1 : (step.batch ?? 0);

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <DiagramShell
        title="Digital activation · order → activated cards"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        log={step.log}
        logPrefix="monitor"
        logTone={step.tone}
        footer={
          <>
            <StatusFlow statuses={STATUSES} current={status} />
            <div>
              <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">worker fan-out (goroutines)</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 12 }).map((_, k) => (
                  <span key={k} className="h-3 w-3 rounded-[2px] transition-colors duration-300" style={{ background: k < Math.round(batchPct * 12) ? "var(--t-accent)" : "var(--t-line-2)" }} />
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-muted">{Math.round(batchPct * 100)}k / 100k cards processed by worker queue</p>
            </div>
          </>
        }
      >
        <DiagramScroll>
        <svg viewBox="0 0 1000 400" className="block w-full" role="img" aria-label="Two-tier animated pipeline. Top tier: monitor queues publish-activation-monitor, activation-monitor and add-card-to-wallet-monitor drive the order status PENDING, INITIATED, PROCESSING, UPDATE_WALLET_INITIATED, UPDATE_WALLET_INPROGRESS, ACTIVATED and hand off to each other. Bottom tier: each monitor pushes cards to a worker queue that does the per-card work against MySQL, the provider, and the wallet, retrying via 500 until every card is done.">
          {/* backbone (top) */}
          <line x1={N.create.x} y1={MY} x2={N.m3.x} y2={MY} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* hop labels + glyphs on backbone */}
          <g>
            <QueueGlyph x={(N.create.x + N.m1.x) / 2} y={MY} active={!reduced && step.hop === "create-m1"} />
            <QueueGlyph x={(N.m1.x + N.m2.x) / 2} y={MY} active={!reduced && step.hop === "m1-m2"} />
            <text x={(N.m1.x + N.m2.x) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop === "m1-m2" ? "var(--t-accent)" : "var(--t-muted)"}>all inserted →</text>
            <QueueGlyph x={(N.m2.x + N.m3.x) / 2} y={MY} active={!reduced && step.hop === "m2-m3"} />
            <text x={(N.m2.x + N.m3.x) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop === "m2-m3" ? "var(--t-accent)" : "var(--t-muted)"}>all active →</text>
          </g>

          {/* vertical monitor→worker→target connectors */}
          {COLS.map((c) => {
            const on = !reduced && step.worker === c.worker;
            return (
              <g key={c.worker}>
                <line x1={c.x} y1={MY + 26} x2={c.x} y2={WY - 23} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                <line x1={c.x} y1={WY + 23} x2={c.x} y2={TY - 16} stroke={on ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={on ? 1.8 : 1.2} strokeDasharray="4 4" />
                {on && <text x={c.x + 8} y={(MY + WY) / 2} textAnchor="start" fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-accent)">push cards ↓</text>}
              </g>
            );
          })}

          {/* retry loops */}
          {(["m1", "m2", "m3"] as const).map((m) => (
            <RetryLoop key={m} x={MON_X[m]} yNodeTop={MY - 26} active={!reduced && step.retryMon === m} label="⟳ 500 retry" />
          ))}

          {/* nodes */}
          {(Object.keys(N) as NodeId[]).map((id) => (
            <StageNode key={id} node={N[id]} active={activeNode === id && !reduced} good={id === "m3" && status === "ACTIVATED" && !reduced} />
          ))}

          {/* status chip anchored under the active monitor */}
          {!reduced && step.statusMon && step.status && (
            <StatusChip x={MON_X[step.statusMon]} yNodeBottom={MY + 26} text={step.status} tone={step.statusTone ?? "accent"} show />
          )}

          {/* packet */}
          {!reduced && target && (
            <motion.g animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill={step.retryMon ? "var(--t-bad)" : "var(--t-accent)"} />
              <circle r={11} fill="var(--t-accent)" opacity={0.22} />
            </motion.g>
          )}
        </svg>
        </DiagramScroll>
      </DiagramShell>
    </div>
  );
}
