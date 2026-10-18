"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, StatusRail, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * OrderFlowDiagram — the "Order & Pay" journey, verified against the
 * NestJS source: customer-ordering.placeOrder (instantPayment →
 * PAYMENT_PENDING), payments.createStripePaymentIntent /
 * afs.createCheckout, payments.createCustomerPayment (FOR UPDATE lock,
 * idempotency key, reward), confirmOrderAfterPayment (PAYMENT_PENDING
 * → PLACED, real-time socket + FCM), then the kitchen status machine.
 * ------------------------------------------------------------------ */

const TOP = 96;
const BOT = 250;

const N: Record<string, SPNodeDef> = {
  customer: { x: 78, y: TOP, w: 108, h: 54, title: "CUSTOMER", sub: "scans table QR", kind: "actor" },
  cart: { x: 258, y: TOP, w: 118, h: 56, title: "CART", sub: "server-side", kind: "system" },
  order: { x: 452, y: TOP, w: 128, h: 56, title: "ORDER", sub: "PAYMENT_PENDING", kind: "system" },
  gateway: { x: 662, y: TOP, w: 132, h: 58, title: "GATEWAY", sub: "Stripe · AFS", kind: "gateway" },
  settle: { x: 872, y: TOP, w: 128, h: 56, title: "SETTLE", sub: "lock · idempotent", kind: "system" },
  merchant: { x: 452, y: BOT, w: 132, h: 56, title: "MERCHANT", sub: "live dashboard", kind: "actor" },
  kitchen: { x: 700, y: BOT, w: 150, h: 56, title: "KITCHEN", sub: "PLACED → SERVED", kind: "system" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "main" | "confirm" | "track" };
  at?: NodeId;
  log: string;
  tone: Tone;
  gateway?: "stripe" | "afs";
  track?: string;
  kitchen?: string;
  note?: string;
  coin?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { move: { from: "customer", to: "cart" }, log: "customer scans the table QR, opens the branch menu, and builds a cart held server-side", tone: "info", track: "PAYMENT_PENDING", dur: 1900 },
  { move: { from: "cart", to: "order" }, log: "placeOrder(instantPayment) → tax + service charge computed from branch config → Order created, held at PAYMENT_PENDING (kitchen not yet notified)", tone: "accent", track: "PAYMENT_PENDING", kitchen: "PENDING", dur: 2200 },
  { move: { from: "order", to: "gateway" }, log: "customer chooses a payment method — the branch's configured rail", tone: "info", track: "PAYMENT_PENDING", dur: 1500 },
  { at: "gateway", gateway: "stripe", log: "STRIPE: createPaymentIntent(amount in AED) → card / Apple Pay / Google Pay → confirm once status = succeeded", tone: "accent", track: "PAYMENT_PENDING", coin: true, dur: 2100 },
  { at: "gateway", gateway: "afs", log: "AFS (Arab Financial Services): createCheckout → COPYandPAY widget with the merchant's AES-256-GCM-encrypted token → verify result code 000.*", tone: "accent", track: "PAYMENT_PENDING", coin: true, dur: 2200 },
  { move: { from: "gateway", to: "settle" }, log: "gateway confirms the charge → hand to createCustomerPayment", tone: "info", track: "PAYMENT_PENDING", coin: true, dur: 1500 },
  { at: "settle", log: "SELECT … FOR UPDATE locks the order row — concurrent split-payers can't race the paid balance", tone: "accent", track: "PAYMENT_PENDING", dur: 2000 },
  { at: "settle", log: "idempotency key (stripe:pi / afs:id) makes the webhook + the confirm call safe to both fire — no double charge", tone: "accent", track: "PAYMENT_PENDING", dur: 2100 },
  { at: "settle", log: "order.paid updated → fully paid → status COMPLETED · reward (cashback) entry written for the payer", tone: "ok", track: "PAYMENT_PENDING", dur: 1900 },
  { move: { from: "settle", to: "merchant", lane: "confirm" }, log: "confirmOrderAfterPayment: PAYMENT_PENDING → PLACED, emit real-time socket event + FCM push to the branch", tone: "ok", track: "PLACED", kitchen: "COMPLETED", dur: 2100 },
  { at: "merchant", log: "the merchant dashboard lights up instantly — the order appears with items, table and total, live over websocket", tone: "info", track: "PLACED", kitchen: "COMPLETED", dur: 1900 },
  { move: { from: "merchant", to: "kitchen", lane: "track" }, log: "note the money rail is already COMPLETED — it went there the moment the bill cleared. Prepaid means the kitchen progression rides entirely on the customer-facing status.", tone: "accent", track: "ACCEPTED", kitchen: "COMPLETED", dur: 2400 },
  { at: "kitchen", log: "kitchen works the order: ACCEPTED → PREPARING → READY, and each transition emits to the customer's tracking screen in real time — they watch it move without refreshing", tone: "info", track: "READY", kitchen: "COMPLETED", dur: 2200 },
  { at: "kitchen", log: "served → SERVED. Table auto-releases to AVAILABLE once no unpaid orders remain on it.", tone: "ok", track: "SERVED", kitchen: "COMPLETED", dur: 2300 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const TRACK = ["PAYMENT_PENDING", "PLACED", "ACCEPTED", "PREPARING", "READY", "SERVED"];
const KITCHEN = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];

function statusAt(i: number, key: "track" | "kitchen") {
  for (let k = i; k >= 0; k--) {
    const v = SCRIPT[k][key];
    if (v) return v;
  }
  return null;
}

export default function OrderFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const track = reduced ? "SERVED" : statusAt(i, "track");
  const kitchen = reduced ? "COMPLETED" : statusAt(i, "kitchen");

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Order & Pay · scan → order → pay → served"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        legend="◈ actor · ▧ SmoothPay service · ▤ payment rail · real-time over websocket"
        log={step.log}
        logPrefix="order"
        logTone={step.tone}
        footer={
          <>
            <StatusRail label="the food — what the customer sees (CustomerOrderStatus)" statuses={TRACK} current={track} />
            <StatusRail label="the money (OrderStatus) — COMPLETED the moment the bill clears" statuses={KITCHEN} current={kitchen} />
          </>
        }
      >
        <DiagramScroll>
        <svg viewBox="0 0 1000 320" className="block w-full" role="img" aria-label="Order-and-pay flow: a customer scans a table QR, builds a cart, places an order held at PAYMENT_PENDING, pays through Stripe or AFS which is settled with a row lock and idempotency key, then the order is confirmed to PLACED with a real-time push to the merchant dashboard and moves through the kitchen to SERVED.">
          {/* top transaction line */}
          <line x1={N.customer.x} y1={TOP} x2={N.settle.x} y2={TOP} stroke="var(--t-line)" strokeWidth={1.5} />
          {/* settle → merchant (confirm) */}
          <path d={`M ${N.settle.x} ${TOP + 28} C ${N.settle.x} 190, ${N.merchant.x + 120} 190, ${N.merchant.x} ${BOT - 28}`} fill="none" stroke={step.move?.lane === "confirm" && !reduced ? "var(--t-good)" : "var(--t-line)"} strokeWidth={1.4} strokeDasharray="5 4" />
          <text x={720} y={182} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill={step.move?.lane === "confirm" && !reduced ? "var(--t-good)" : "var(--t-muted)"}>real-time confirm ↓</text>
          {/* merchant → kitchen */}
          <line x1={N.merchant.x + N.merchant.w / 2} y1={BOT} x2={N.kitchen.x - N.kitchen.w / 2} y2={BOT} stroke="var(--t-line)" strokeWidth={1.4} strokeDasharray="5 4" />

          {/* gateway sub-selector chips */}
          {(["stripe", "afs"] as const).map((g, idx) => {
            const on = !reduced && step.gateway === g;
            const gx = N.gateway.x - 34 + idx * 40;
            return (
              <g key={g}>
                <rect x={gx - 17} y={TOP - 52} width={34} height={18} rx={9} fill={on ? "var(--t-accent)" : "var(--t-surface)"} stroke={on ? "var(--t-accent)" : "var(--t-line-2)"} />
                <text x={gx} y={TOP - 39} textAnchor="middle" fontSize={7.5} fontWeight={700} fontFamily="var(--font-mono)" fill={on ? "var(--t-accent-contrast)" : "var(--t-muted)"}>
                  {g === "stripe" ? "STRP" : "AFS"}
                </text>
              </g>
            );
          })}

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode key={id} node={N[id]} active={activeNode === id && !reduced} good={id === "kitchen" && track === "SERVED" && !reduced} />
          ))}

          {!reduced && target && <MoneyPacket target={target} dur={step.dur} tone={step.tone === "ok" ? "ok" : "accent"} scaleAt={!!step.at} />}
        </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
