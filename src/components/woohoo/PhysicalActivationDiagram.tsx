"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { DiagramShell, StageNode, QueueGlyph, RetryLoop, StatusChip, StatusFlow, useFlowStepper, type FlowNode, type Tone } from "./flowKit";

/* ------------------------------------------------------------------ *
 * PhysicalActivationDiagram — PHYSICAL_ACTIVATION, both fulfilment
 * types. The async part is the validation-monitor (→ validation
 * worker). Then the deferred/immediate split reorders ship + activate.
 * Verified: upload.go:494 VALIDATION_INITIATED; validations.go:315
 * VALIDATION_INPROGRESS, :432 VALIDATION_FAILED, :479 CREATED, :490
 * deferred-stop else push activation-monitor; ship.go:219-234 gates.
 * ------------------------------------------------------------------ */

const MY = 100, WY = 236, TY = 328;
const VALX = 378;
const SX1 = 560, SX2 = 708, SX3 = 862;

// tail node x depends on fulfilment phase
function tailX(id: "ship" | "delivered" | "activate", phase: "DEFERRED" | "IMMEDIATE") {
  if (phase === "DEFERRED") return { ship: SX1, delivered: SX2, activate: SX3 }[id];
  return { activate: SX1, ship: SX2, delivered: SX3 }[id];
}

const BASE: Record<string, FlowNode> = {
  create: { x: 74, y: MY, w: 108, h: 46, title: "CREATE", sub: "ACTIVATION_PHYSICAL", kind: "plain" },
  upload: { x: 212, y: MY, w: 122, h: 46, title: "UPLOAD", sub: "printed-card file", kind: "plain" },
  valmon: { x: VALX, y: MY, w: 168, h: 52, title: "activation-validation", sub: "-monitor", kind: "monitor" },
  valw: { x: VALX, y: WY, w: 160, h: 46, title: "activation-validation", sub: "per-card checks", kind: "worker" },
  valt: { x: VALX, y: TY, w: 150, h: 32, title: "uploaded stock", sub: "number/range/dup", kind: "target" },
};

function tailNode(id: "ship" | "delivered" | "activate", phase: "DEFERRED" | "IMMEDIATE"): FlowNode {
  const x = tailX(id, phase);
  if (id === "ship") return { x, y: MY, w: 124, h: 50, title: "SHIP · BlueDart", sub: "courier", kind: "plain" };
  if (id === "delivered") return { x, y: MY, w: 118, h: 50, title: "DELIVERED", sub: "in customer's hand", kind: "plain" };
  return { x, y: MY, w: 130, h: 52, title: "activation-monitor", sub: "full pipeline", kind: "monitor" };
}

type Step = {
  move?: { from: string; to: string };
  at?: string;
  log: string;
  tone: Tone;
  phase: "DEFERRED" | "IMMEDIATE";
  status?: string;
  statusAt?: string;
  statusTone?: Tone;
  retry?: boolean;
  worker?: boolean;
  hop?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  // -------- DEFERRED --------
  { at: "create", log: "physical order: ACTIVATION_PHYSICAL · INPUT_CARD · fulfilment QC. The publish monitor inserts card rows — then deliberately STOPS. No auto-activation for plastic.", tone: "accent", phase: "DEFERRED", dur: 2500 },
  { move: { from: "create", to: "upload" }, log: "operator uploads the printed-card file — card numbers, sequences, wrapper ranges", tone: "info", phase: "DEFERRED", dur: 1600 },
  { at: "upload", log: "upload API → push activation-validation-monitor queue → order VALIDATION_INITIATED", tone: "accent", phase: "DEFERRED", status: "VALIDATION_INITIATED", statusAt: "valmon", statusTone: "accent", hop: true, dur: 1900 },
  { move: { from: "upload", to: "valmon" }, log: "webhook → validation-monitor locks its row", tone: "info", phase: "DEFERRED", status: "VALIDATION_INITIATED", statusAt: "valmon", statusTone: "accent", dur: 1500 },
  { move: { from: "valmon", to: "valw" }, log: "monitor pushes cards to the activation-validation WORKER queue → order VALIDATION_INPROGRESS", tone: "accent", phase: "DEFERRED", status: "VALIDATION_INPROGRESS", statusAt: "valmon", statusTone: "accent", worker: true, dur: 1900 },
  { move: { from: "valw", to: "valt" }, log: "per card: number, range and duplicate checks against the uploaded stock", tone: "info", phase: "DEFERRED", worker: true, dur: 1700 },
  { at: "valmon", retry: true, log: "monitor redelivered until every card is validated → 500", tone: "err", phase: "DEFERRED", status: "VALIDATION_INPROGRESS", statusAt: "valmon", statusTone: "accent", dur: 1600 },
  { at: "valmon", log: "any hard failure → monitor sets VALIDATION_FAILED and the run stops for investigation", tone: "err", phase: "DEFERRED", status: "VALIDATION_FAILED", statusAt: "valmon", statusTone: "err", dur: 1800 },
  { at: "valmon", log: "all cards valid → monitor sets CREATED (‘ready for shipment’). A DEFERRED order stops right here.", tone: "ok", phase: "DEFERRED", status: "CREATED", statusAt: "valmon", statusTone: "accent", dur: 2000 },
  { move: { from: "valmon", to: "ship" }, log: "ship API (allowed only at CREATED) → parcel handed to BlueDart; the delivery service tracks courier events → SHIPPED", tone: "info", phase: "DEFERRED", status: "SHIPPED", statusAt: "ship", statusTone: "accent", dur: 2000 },
  { move: { from: "ship", to: "delivered" }, log: "courier confirms handover → DELIVERED. Cards are in hand — but still inert plastic.", tone: "ok", phase: "DEFERRED", status: "DELIVERED", statusAt: "delivered", statusTone: "accent", dur: 1900 },
  { move: { from: "delivered", to: "activate" }, log: "customer initiates activation → Activate API (accepted only for QC + DEFERRED) → runs the full activation pipeline (the monitors above) → PROCESSING", tone: "accent", phase: "DEFERRED", status: "PROCESSING", statusAt: "activate", statusTone: "accent", dur: 2200 },
  { at: "activate", log: "every card ACTIVATED. The plastic in the customer's hand is now live money.", tone: "ok", phase: "DEFERRED", status: "ACTIVATED", statusAt: "activate", statusTone: "ok", dur: 2300 },
  // -------- IMMEDIATE --------
  { at: "upload", log: "IMMEDIATE flow: same upload, same validation-monitor machinery…", tone: "accent", phase: "IMMEDIATE", status: "VALIDATION_INITIATED", statusAt: "valmon", statusTone: "accent", hop: true, dur: 1800 },
  { at: "valmon", log: "…all cards valid → CREATED. But this time the validation monitor does NOT stop:", tone: "ok", phase: "IMMEDIATE", status: "CREATED", statusAt: "valmon", statusTone: "accent", dur: 1800 },
  { move: { from: "valmon", to: "activate" }, log: "it pushes the activation-monitor itself → the activation pipeline runs before anything ships → PROCESSING", tone: "accent", phase: "IMMEDIATE", status: "PROCESSING", statusAt: "activate", statusTone: "accent", dur: 1900 },
  { at: "activate", log: "cards ACTIVATED while the stock is still in the warehouse", tone: "ok", phase: "IMMEDIATE", status: "ACTIVATED", statusAt: "activate", statusTone: "ok", dur: 1700 },
  { move: { from: "activate", to: "ship" }, log: "ship API for IMMEDIATE requires status ACTIVATED → live cards ship via BlueDart → SHIPPED", tone: "info", phase: "IMMEDIATE", status: "SHIPPED", statusAt: "ship", statusTone: "accent", dur: 1900 },
  { move: { from: "ship", to: "delivered" }, log: "DELIVERED — after a verification step the customer can use the card straight out of the envelope.", tone: "ok", phase: "IMMEDIATE", status: "DELIVERED", statusAt: "delivered", statusTone: "ok", dur: 2300 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const DEFERRED_STATUSES = ["INITIATED", "VALIDATION_INITIATED", "VALIDATION_INPROGRESS", "CREATED", "SHIPPED", "DELIVERED", "PROCESSING", "ACTIVATED"];
const IMMEDIATE_STATUSES = ["VALIDATION_INITIATED", "VALIDATION_INPROGRESS", "CREATED", "PROCESSING", "ACTIVATED", "SHIPPED", "DELIVERED"];

function nodeFor(id: string, phase: "DEFERRED" | "IMMEDIATE"): FlowNode {
  if (id === "ship" || id === "delivered" || id === "activate") return tailNode(id as "ship" | "delivered" | "activate", phase);
  return BASE[id];
}
function currentStatus(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status!;
  return "INITIATED";
}

export default function PhysicalActivationDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useFlowStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];
  const phase = reduced ? "DEFERRED" : step.phase;

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "ACTIVATED" : currentStatus(i);
  const statuses = phase === "IMMEDIATE" && !reduced ? IMMEDIATE_STATUSES : DEFERRED_STATUSES;

  const target = step.move
    ? { x: [nodeFor(step.move.from, phase).x, nodeFor(step.move.to, phase).x], y: [nodeFor(step.move.from, phase).y, nodeFor(step.move.to, phase).y] }
    : step.at
      ? { x: [nodeFor(step.at, phase).x], y: [nodeFor(step.at, phase).y] }
      : null;

  const allIds = ["create", "upload", "valmon", "valw", "valt", "ship", "delivered", "activate"];

  return (
    <div ref={rootRef} className="not-prose">
      <DiagramShell
        title="Physical activation · plastic cards, two fulfilment types"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        badge={reduced ? null : { text: step.phase, bad: false }}
        log={step.log}
        logPrefix="physical"
        logTone={step.tone}
        footer={<StatusFlow statuses={statuses} current={status} badStatuses={["VALIDATION_FAILED"]} />}
      >
        <svg viewBox="0 0 1000 372" className="block w-full" role="img" aria-label="Two-tier physical activation: cards are uploaded and the validation-monitor pushes them to the validation worker queue, checking each against the uploaded stock, setting VALIDATION_INITIATED, VALIDATION_INPROGRESS and CREATED. Deferred orders ship inert plastic via BlueDart, get DELIVERED, and activate only when the customer triggers it; immediate orders activate right after validation and ship already-live cards.">
          {/* backbone */}
          <line x1={BASE.create.x} y1={MY} x2={SX3} y2={MY} stroke="var(--t-line)" strokeWidth={1.5} />
          <QueueGlyph x={(BASE.upload.x + VALX) / 2} y={MY} active={!reduced && !!step.hop} />
          <text x={(BASE.upload.x + VALX) / 2} y={MY - 24} textAnchor="middle" fontSize={8} fontFamily="var(--font-mono)" fill={!reduced && step.hop ? "var(--t-accent)" : "var(--t-muted)"}>validation-monitor</text>

          {/* valmon → worker → target */}
          <line x1={VALX} y1={MY + 26} x2={VALX} y2={WY - 23} stroke={!reduced && step.worker ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={!reduced && step.worker ? 1.8 : 1.2} strokeDasharray="4 4" />
          <line x1={VALX} y1={WY + 23} x2={VALX} y2={TY - 16} stroke={!reduced && step.worker ? "var(--t-accent)" : "var(--t-line)"} strokeWidth={!reduced && step.worker ? 1.8 : 1.2} strokeDasharray="4 4" />
          {!reduced && step.worker && <text x={VALX + 8} y={(MY + WY) / 2} fontSize={8} fontFamily="var(--font-mono)" fill="var(--t-accent)">push cards ↓</text>}

          {/* phase label on the tail */}
          {!reduced && (
            <text x={(SX1 + SX3) / 2} y={MY - 30} textAnchor="middle" fontSize={9} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--t-accent)">
              {phase === "DEFERRED" ? "DEFERRED: ship inert → deliver → activate" : "IMMEDIATE: activate → ship live → deliver"}
            </text>
          )}

          <RetryLoop x={VALX} yNodeTop={MY - 26} active={!reduced && !!step.retry} label="⟳ 500 retry" />

          {allIds.map((id) => {
            const node = nodeFor(id, phase);
            const isActive = activeNode === id && !reduced && !step.retry;
            const good = (id === "activate" && status === "ACTIVATED" && !reduced) || (id === "delivered" && phase === "IMMEDIATE" && status === "DELIVERED" && !reduced);
            const danger = id === "valmon" && status === "VALIDATION_FAILED" && !reduced;
            return <StageNode key={id} node={node} active={isActive} good={good} danger={danger} />;
          })}

          {!reduced && step.statusAt && step.status && (
            <StatusChip x={nodeFor(step.statusAt, phase).x} yNodeBottom={MY + 26} text={step.status} tone={step.statusTone ?? "accent"} show />
          )}

          {!reduced && target && (
            <motion.g animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill={status === "VALIDATION_FAILED" || step.retry ? "var(--t-bad)" : "var(--t-accent)"} />
              <circle r={11} fill="var(--t-accent)" opacity={0.22} />
            </motion.g>
          )}
        </svg>
      </DiagramShell>
    </div>
  );
}
