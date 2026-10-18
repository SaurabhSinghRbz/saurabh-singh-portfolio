"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, FxBadge, StatusRail, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * PaymentLinkDiagram — the multi-currency payment-link flow, verified
 * against payment-links.service (create / resolvePublic / lazyCreateOrder
 * / expiry cron), currency-rates.buildSnapshot (display-only currency,
 * charge stays AED) and payments.createCustomerPayment (marks link PAID).
 * ------------------------------------------------------------------ */

const TOP = 92;
const BOT = 250;

const N: Record<string, SPNodeDef> = {
  merchant: { x: 80, y: TOP, w: 116, h: 54, title: "MERCHANT", sub: "creates link", kind: "actor" },
  link: { x: 288, y: TOP, w: 138, h: 58, title: "PAYMENT LINK", sub: "token · ACTIVE", kind: "system" },
  customer: { x: 520, y: TOP, w: 132, h: 56, title: "CUSTOMER", sub: "opens link", kind: "actor" },
  resolve: { x: 520, y: BOT, w: 148, h: 56, title: "RESOLVE", sub: "lazy order + FX", kind: "system" },
  gateway: { x: 752, y: BOT, w: 130, h: 58, title: "GATEWAY", sub: "charge in AED", kind: "gateway" },
  paid: { x: 916, y: BOT, w: 116, h: 52, title: "PAID", sub: "link settled", kind: "state" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone: Tone;
  status?: string;
  fx?: boolean;
  display?: string;
  card?: boolean;
  branch?: "expire" | "cancel";
  coin?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { at: "merchant", log: "merchant creates a link: amount in AED, an optional display currency (validated against active countries), an expiry, and a tips/loyalty toggle", tone: "accent", status: "ACTIVE", dur: 2400 },
  { at: "link", log: "a 256-bit token + sequential invoice ref (SLUG-0000007) are minted → shareable URL /{merchant}/pay/{token}. Status ACTIVE.", tone: "info", status: "ACTIVE", dur: 2200 },
  { move: { from: "link", to: "customer" }, log: "merchant sends the link over WhatsApp / email to a customer in any country", tone: "info", status: "ACTIVE", coin: false, dur: 1800 },
  { move: { from: "customer", to: "resolve" }, log: "customer opens it → resolvePublic: expiry checked with a 5-min buffer, then an Order is lazily created (unique-constraint guards two customers racing the same link)", tone: "accent", status: "ACTIVE", dur: 2300 },
  { at: "resolve", fx: true, display: "£ GBP", log: "currency snapshot: link override → branch → the customer's own country → AED. They SEE £, but the charge is computed and taken in AED. The rate is frozen on the record.", tone: "accent", status: "ACTIVE", dur: 2600 },
  { move: { from: "resolve", to: "gateway" }, log: "customer pays through the branch's rail (Stripe / AFS) — Apple Pay & Google Pay supported inside the widget", tone: "info", status: "ACTIVE", card: true, coin: true, dur: 2000 },
  { at: "gateway", card: true, log: "card charged in AED → gateway confirms success", tone: "accent", status: "ACTIVE", coin: true, dur: 1900 },
  { move: { from: "gateway", to: "paid" }, log: "createCustomerPayment settles the order → link flips ACTIVE → PAID (paidAt, transactionId, frozen FX snapshot). Order auto-completes to SERVED — no kitchen step.", tone: "ok", status: "PAID", coin: true, dur: 2400 },
  { at: "paid", log: "receipt generated. If the link is never paid, a lazy check on visit + a 10-minute cron flip it to EXPIRED; the merchant can also CANCEL an active link.", tone: "muted", status: "PAID", branch: "expire", dur: 2500 },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const STATUSES = ["ACTIVE", "PAID"];

function statusAt(i: number) {
  for (let k = i; k >= 0; k--) if (SCRIPT[k].status) return SCRIPT[k].status!;
  return "ACTIVE";
}

export default function PaymentLinkDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const status = reduced ? "PAID" : statusAt(i);

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  const showCard = !reduced && !!step.card;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Payment link · multi-currency, charged in AED"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        legend="◈ actor · ▧ SmoothPay service · ▤ payment rail · display currency ≠ settlement currency"
        log={step.log}
        logPrefix="link"
        logTone={step.tone}
        footer={
          <>
            <StatusRail label="payment-link status (PaymentLinkStatus)" statuses={STATUSES} current={status} />
            <div>
              <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted">the invariant</p>
              <p className="font-mono text-[11px] leading-snug text-ink/80">
                display currency is <span className="text-accent">cosmetic</span> — every charge, balance and refund is
                settled in <span className="text-good">AED</span>, so books never drift with FX.
              </p>
            </div>
          </>
        }
      >
        <DiagramScroll>
        <svg viewBox="0 0 1000 320" className="block w-full" role="img" aria-label="Payment-link flow: a merchant creates a link with an amount in AED and an optional display currency, sends it to a customer in any country who opens it, an order is lazily created, the customer sees their own currency but is charged in AED, pays via Stripe or AFS, and the link flips to PAID.">
          {/* top line: merchant → link → customer */}
          <line x1={N.merchant.x} y1={TOP} x2={N.customer.x} y2={TOP} stroke="var(--t-line)" strokeWidth={1.5} />
          {/* customer → resolve (down) */}
          <line x1={N.customer.x} y1={TOP + 28} x2={N.resolve.x} y2={BOT - 28} stroke="var(--t-line)" strokeWidth={1.4} strokeDasharray="5 4" />
          {/* resolve → gateway → paid */}
          <line x1={N.resolve.x + N.resolve.w / 2} y1={BOT} x2={N.paid.x - N.paid.w / 2} y2={BOT} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* FX badge above resolve */}
          <FxBadge x={N.resolve.x} y={165} display={step.display ?? "£ GBP"} active={!reduced && !!step.fx} />

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode key={id} node={N[id]} active={activeNode === id && !reduced} good={id === "paid" && status === "PAID" && !reduced} />
          ))}

          {/* branch note (expire/cancel) */}
          {!reduced && step.branch && (
            <g>
              <rect x={N.paid.x - 62} y={BOT + 30} width={124} height={20} rx={10} fill="var(--t-surface)" stroke="var(--t-line-2)" />
              <text x={N.paid.x} y={BOT + 43} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill="var(--t-muted)">
                else: EXPIRED · CANCELLED
              </text>
            </g>
          )}

          {/* animated card swipe into the gateway */}
          {showCard && (
            <motion.g
              initial={{ opacity: 0, x: N.gateway.x - 70, y: BOT - 2 }}
              animate={{ opacity: [0, 1, 1, 0], x: [N.gateway.x - 70, N.gateway.x], y: BOT - 2 }}
              transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
            >
              <rect x={-14} y={-9} width={28} height={18} rx={3} fill="var(--t-accent)" />
              <rect x={-14} y={-4} width={28} height={4} fill="var(--t-accent-contrast)" opacity={0.5} />
            </motion.g>
          )}

          {!reduced && target && <MoneyPacket target={target} dur={step.dur} tone={step.tone === "ok" ? "ok" : "accent"} scaleAt={!!step.at} />}
        </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
