"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, StatusRail, FooterNote, useStepper, type SPNodeDef, type Tone } from "./spKit";

/* ------------------------------------------------------------------ *
 * MerchantOrderFlowDiagram — the waiter-driven POS journey, verified
 * against the source: orders.createDirect (source = MERCHANT, branch
 * tax/serviceCharge, table → OCCUPIED + emitTableStatusUpdate),
 * customer-ordering.updateCustomerOrderStatus (the validTransitions map
 * and the CustomerOrderStatus → OrderStatus projection), and
 * orders.updateStatus / hasBlockingOrdersForTable (table release).
 *
 * The idea worth showing: SmoothPay keeps TWO status enums in lockstep.
 * The merchant moves the customer-facing status; the kitchen status is
 * derived from it. One move, two audiences.
 * ------------------------------------------------------------------ */

const TOP = 92;
const BOT = 252;

const N: Record<string, SPNodeDef> = {
  waiter: { x: 76, y: TOP, w: 106, h: 54, title: "WAITER", sub: "merchant portal", kind: "actor" },
  tables: { x: 248, y: TOP, w: 124, h: 56, title: "TABLES", sub: "live floor view", kind: "system" },
  menu: { x: 434, y: TOP, w: 122, h: 56, title: "LIVE MENU", sub: "schedule-aware", kind: "system" },
  order: { x: 630, y: TOP, w: 136, h: 56, title: "ORDER", sub: "source=MERCHANT", kind: "system" },
  kitchen: { x: 862, y: TOP, w: 132, h: 56, title: "KITCHEN", sub: "accept → serve", kind: "system" },
  customer: { x: 248, y: BOT, w: 132, h: 56, title: "CUSTOMER", sub: "scans table QR", kind: "actor" },
  track: { x: 520, y: BOT, w: 150, h: 56, title: "TRACKING", sub: "live status", kind: "system" },
  rejected: { x: 862, y: BOT, w: 126, h: 52, title: "REJECTED", sub: "table released", kind: "state" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "qr" | "reject" };
  at?: NodeId;
  log: string;
  tone: Tone;
  cust?: string;
  merch?: string;
  table?: "AVAILABLE" | "OCCUPIED";
  reject?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  {
    at: "tables",
    log: "waiter opens the floor view — every table's status streams in over websocket, so two waiters never grab the same table",
    tone: "info",
    table: "AVAILABLE",
    dur: 2100,
  },
  {
    move: { from: "waiter", to: "tables" },
    log: "waiter picks table 12 → the table flips to OCCUPIED and emitTableStatusUpdate pushes that to every other device on the floor",
    tone: "accent",
    table: "OCCUPIED",
    dur: 2200,
  },
  {
    move: { from: "tables", to: "menu" },
    log: "the live menu opens — only products in a LIVE, in-schedule menu for this branch are sellable right now (meal-type + weekday + date-range aware)",
    tone: "info",
    table: "OCCUPIED",
    dur: 2400,
  },
  {
    move: { from: "menu", to: "order" },
    log: "createDirect(): subtotal from the picked items, then tax + service charge computed from THIS branch's own config → Order(source = MERCHANT)",
    tone: "accent",
    cust: "PLACED",
    merch: "PENDING",
    table: "OCCUPIED",
    dur: 2400,
  },
  {
    move: { from: "order", to: "customer", lane: "qr" },
    log: "the customer scans the QR taped to table 12 — no app install, no account — and sees the order the waiter just placed",
    tone: "info",
    cust: "PLACED",
    merch: "PENDING",
    table: "OCCUPIED",
    dur: 2200,
  },
  {
    at: "track",
    log: "customer's screen reads “waiting for acceptance”. That's customerOrderStatus = PLACED — the order is real, but nobody in the kitchen has owned it yet",
    tone: "info",
    cust: "PLACED",
    merch: "PENDING",
    table: "OCCUPIED",
    dur: 2500,
  },
  {
    at: "kitchen",
    log: "merchant ACCEPTS → the transition map allows PLACED → ACCEPTED, and the same write projects the kitchen status to CONFIRMED. One move, two enums.",
    tone: "accent",
    cust: "ACCEPTED",
    merch: "CONFIRMED",
    table: "OCCUPIED",
    dur: 2600,
  },
  {
    move: { from: "kitchen", to: "rejected", lane: "reject" },
    reject: true,
    log: "the other branch: REJECT → REJECTED / REJECTED and the table is released. Guarded — a fully-paid order can never be rejected or cancelled.",
    tone: "err",
    cust: "REJECTED",
    merch: "REJECTED",
    table: "AVAILABLE",
    dur: 2700,
  },
  {
    at: "kitchen",
    log: "back on the happy path: PREPARING → PREPARING. The merchant may skip steps forward, but never backwards — the transition map only permits forward moves.",
    tone: "accent",
    cust: "PREPARING",
    merch: "PREPARING",
    table: "OCCUPIED",
    dur: 2400,
  },
  {
    move: { from: "kitchen", to: "track", lane: "qr" },
    log: "READY → READY. Every transition streams straight to the customer's tracking screen — they watch the kitchen work without refreshing anything.",
    tone: "info",
    cust: "READY",
    merch: "READY",
    table: "OCCUPIED",
    dur: 2300,
  },
  {
    at: "track",
    log: "waiter serves the food → SERVED, which projects the kitchen status to COMPLETED. The customer's screen now says “served”.",
    tone: "ok",
    cust: "SERVED",
    merch: "COMPLETED",
    table: "OCCUPIED",
    dur: 2400,
  },
  {
    at: "customer",
    log: "the table stays OCCUPIED — served is not paid. It only releases once the bill clears AND no other unpaid order is still open on it (hasBlockingOrdersForTable).",
    tone: "muted",
    cust: "SERVED",
    merch: "COMPLETED",
    table: "OCCUPIED",
    dur: 2700,
  },
  {
    at: "customer",
    log: "so the customer scans the QR one more time and pays — that's the checkout flow below, and it's what finally frees table 12.",
    tone: "accent",
    cust: "SERVED",
    merch: "COMPLETED",
    table: "AVAILABLE",
    dur: 2600,
  },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const CUST = ["PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED"];
const MERCH = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];

function statusAt(i: number, key: "cust" | "merch" | "table") {
  for (let k = i; k >= 0; k--) {
    const v = SCRIPT[k][key];
    if (v) return v as string;
  }
  return null;
}

export default function MerchantOrderFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const cust = reduced ? "SERVED" : statusAt(i, "cust");
  const merch = reduced ? "COMPLETED" : statusAt(i, "merch");
  const table = reduced ? "AVAILABLE" : statusAt(i, "table");
  const rejecting = !reduced && !!step.reject;

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Merchant POS · table → order → kitchen → customer"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        badge={table ? { text: `table 12 · ${table}`, bad: table === "OCCUPIED" } : null}
        legend="◈ actor · ▧ SmoothPay service · ● terminal state · every transition streams over websocket"
        log={step.log}
        logPrefix="pos"
        logTone={step.tone}
        footer={
          <>
            <StatusRail
              label="what the customer sees (CustomerOrderStatus)"
              statuses={CUST}
              current={rejecting ? "PLACED" : cust}
              badStatuses={["REJECTED"]}
            />
            <StatusRail
              label="what the kitchen sees (OrderStatus) — projected"
              statuses={MERCH}
              current={rejecting ? "PENDING" : merch}
              badStatuses={["REJECTED"]}
            />
          </>
        }
      >
        <svg
          viewBox="0 0 1000 320"
          className="block w-full"
          role="img"
          aria-label="Merchant POS flow: a waiter opens the live floor view, picks a table which flips to OCCUPIED, builds an order from the live menu, and createDirect creates a merchant-source order. The customer scans the table QR and watches the status. The merchant accepts, prepares, readies and serves the order — each move updating the customer-facing status and projecting it onto the kitchen status. A reject branch releases the table, and the table only frees for real once the bill is paid."
        >
          {/* top rail: waiter → tables → menu → order → kitchen */}
          <line x1={N.waiter.x} y1={TOP} x2={N.kitchen.x} y2={TOP} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* order → customer (QR scan, down-left) */}
          <path
            d={`M ${N.order.x} ${TOP + 28} C ${N.order.x} 180, ${N.customer.x + 150} 180, ${N.customer.x} ${BOT - 28}`}
            fill="none"
            stroke={step.move?.lane === "qr" && !reduced ? "var(--t-accent)" : "var(--t-line)"}
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />
          <text
            x={455}
            y={176}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={step.move?.lane === "qr" && !reduced ? "var(--t-accent)" : "var(--t-muted)"}
          >
            QR scan · live status ↓
          </text>

          {/* customer → tracking */}
          <line
            x1={N.customer.x + N.customer.w / 2}
            y1={BOT}
            x2={N.track.x - N.track.w / 2}
            y2={BOT}
            stroke="var(--t-line)"
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />

          {/* kitchen → rejected (the unhappy branch) */}
          <line
            x1={N.kitchen.x}
            y1={TOP + 28}
            x2={N.rejected.x}
            y2={BOT - 26}
            stroke={rejecting ? "var(--t-bad)" : "var(--t-line)"}
            strokeWidth={rejecting ? 1.8 : 1.2}
            strokeDasharray="4 5"
          />
          <text
            x={N.kitchen.x + 46}
            y={175}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={rejecting ? "var(--t-bad)" : "var(--t-muted)"}
          >
            reject
          </text>

          {/* the projection callout — the point of the whole diagram */}
          <g opacity={step.merch && !reduced ? 1 : 0.35}>
            <rect x={632} y={BOT - 14} width={150} height={28} rx={8} fill="var(--t-surface)" stroke="var(--t-line-2)" />
            <text x={707} y={BOT + 4} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill="var(--t-muted)">
              customer status → kitchen
            </text>
          </g>

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode
              key={id}
              node={N[id]}
              active={activeNode === id && !reduced}
              good={id === "track" && cust === "SERVED" && !rejecting && !reduced}
              danger={id === "rejected" && rejecting}
            />
          ))}

          {!reduced && target && (
            <MoneyPacket target={target} dur={step.dur} tone={step.tone === "ok" ? "ok" : step.tone === "err" ? "err" : "accent"} scaleAt={!!step.at} />
          )}
        </svg>
      </SPShell>

      {!reduced && (
        <div className="mt-2 grid gap-3 rounded-lg border border-line bg-surface px-4 py-3 sm:grid-cols-2">
          <FooterNote label="the rule that keeps the floor honest">
            a table releases only on <span className="text-bad">reject/cancel</span>, or when the order is{" "}
            <span className="text-good">served AND fully paid</span> — and only if no other unpaid order is still open on it.
          </FooterNote>
          <FooterNote label="the rule that protects the money">
            a <span className="text-good">fully-paid</span> order can never be rejected or cancelled. The transition map is
            forward-only: a merchant may skip ahead, never walk a status back.
          </FooterNote>
        </div>
      )}
    </div>
  );
}
