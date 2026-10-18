"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, StatusRail, Ledger, FooterNote, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * CheckoutFlowDiagram — the money path, verified against the source:
 * payments.createCustomerPayment (FOR UPDATE row lock, payment-type
 * locking, ROUNDING_TOLERANCE = 0.05, idempotencyKey, reward write,
 * guest claim token), calculateAppliedRedemption (min-to-redeem,
 * redeemOncePerOrder, first-payer-only on split), afs.service
 * (isPaymentSuccessful /^000\.(000|100\.1)/) and the cut-off guard
 * (800.800.800 + ISO-8583 AcquirerResponse 90 = actually authorised),
 * receipt-pdf.builder, and feedback.submit (rating >= 4 + googlePlaceId
 * → Google review URL).
 * ------------------------------------------------------------------ */

const TOP = 96;
const BOT = 256;

const N: Record<string, SPNodeDef> = {
  customer: { x: 74, y: TOP, w: 104, h: 54, title: "CUSTOMER", sub: "scans the bill", kind: "actor" },
  bill: { x: 244, y: TOP, w: 126, h: 56, title: "BILL", sub: "tip · split", kind: "system" },
  rewards: { x: 438, y: TOP, w: 130, h: 56, title: "REWARDS", sub: "redeem cashback", kind: "system" },
  gateway: { x: 648, y: TOP, w: 138, h: 58, title: "GATEWAY", sub: "Stripe · AFS · Telr", kind: "gateway" },
  settle: { x: 876, y: TOP, w: 130, h: 56, title: "SETTLE", sub: "lock · idempotent", kind: "system" },
  earn: { x: 700, y: BOT, w: 142, h: 56, title: "CASHBACK", sub: "earn · claim", kind: "system" },
  receipt: { x: 462, y: BOT, w: 130, h: 54, title: "RECEIPT", sub: "email · PDF", kind: "system" },
  review: { x: 232, y: BOT, w: 136, h: 54, title: "REVIEW", sub: "rating ≥ 4 → Google", kind: "state" },
};

type NodeId = keyof typeof N;

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "down" | "back" };
  at?: NodeId;
  log: string;
  tone: Tone;
  /** bill ledger rows visible at this step */
  ledger?: { k: string; v: string; tone?: Tone }[];
  type?: string;
  wallet?: "card" | "apple" | "google";
  danger?: boolean;
  dur: number;
};

/* The worked example the whole animation follows: a 252.50 bill,
 * split 4 ways, one payer redeeming cashback and leaving a tip. */
const BASE = [
  { k: "merchandise", v: "AED 220.00" },
  { k: "tax + service", v: "AED 32.50" },
  { k: "total", v: "AED 252.50" },
];

const SCRIPT: Step[] = [
  {
    at: "customer",
    log: "the meal is served. The customer scans the table QR again — this time the QR resolves to the bill, not the menu.",
    tone: "info",
    ledger: BASE,
    type: "unlocked",
    dur: 2200,
  },
  {
    at: "bill",
    log: "tip first: a percentage or a custom amount. The tip rides on top of the bill — it is never taxed, and it never earns cashback.",
    tone: "accent",
    ledger: [...BASE, { k: "tip", v: "+ AED 20.00", tone: "accent" }],
    type: "unlocked",
    dur: 2400,
  },
  {
    at: "bill",
    log: "then how to pay: FULL, SPLIT across N people, or CUSTOM (pay any partial amount). The FIRST payment locks the bill into that type — nobody can switch mid-bill and desync the maths.",
    tone: "accent",
    ledger: [...BASE, { k: "tip", v: "+ AED 20.00", tone: "accent" }],
    type: "SPLIT",
    dur: 2900,
  },
  {
    at: "bill",
    log: "SPLIT by 4: this payer covers 1 of 4 seats. 252.50 / 4 = 63.13 (rounded up). paidCount goes 0 → 1, and userPayFor can never exceed the seats still unpaid.",
    tone: "accent",
    ledger: [
      { k: "total", v: "AED 252.50" },
      { k: "split 1 of 4", v: "AED 63.13" },
      { k: "tip", v: "+ AED 20.00", tone: "accent" },
    ],
    type: "SPLIT",
    dur: 2900,
  },
  {
    move: { from: "bill", to: "rewards" },
    log: "this customer is logged in, so their cashback balance appears. A guest sees nothing here — logging in is optional, and that choice is exactly what earning cashback costs.",
    tone: "info",
    ledger: [
      { k: "split 1 of 4", v: "AED 63.13" },
      { k: "tip", v: "+ AED 20.00", tone: "accent" },
      { k: "cashback balance", v: "AED 18.40", tone: "ok" },
    ],
    type: "SPLIT",
    dur: 2800,
  },
  {
    at: "rewards",
    log: "redeem 10.00 — bounded by min-to-redeem, a max-discount cap, redeem-once-per-order, and on a split bill only the FIRST payer may redeem, so a discount can't be claimed four times.",
    tone: "accent",
    ledger: [
      { k: "split 1 of 4", v: "AED 63.13" },
      { k: "redeem", v: "− AED 10.00", tone: "ok" },
      { k: "tip", v: "+ AED 20.00", tone: "accent" },
      { k: "to charge", v: "AED 73.13", tone: "accent" },
    ],
    type: "SPLIT",
    dur: 3000,
  },
  {
    move: { from: "rewards", to: "gateway" },
    wallet: "apple",
    log: "grandTotal = amount − redemption + tip → 73.13. Off to the branch's rail: Stripe, AFS or Telr — with Apple Pay, Google Pay, Samsung Pay and plain cards on top of them.",
    tone: "info",
    ledger: [
      { k: "to charge", v: "AED 73.13", tone: "accent" },
    ],
    type: "SPLIT",
    dur: 2700,
  },
  {
    at: "gateway",
    wallet: "card",
    log: "AFS answers 800.800.800 — “temporarily unavailable”. Naïvely that reads as a failure, and a retry would charge this card twice.",
    tone: "err",
    danger: true,
    ledger: [{ k: "to charge", v: "AED 73.13", tone: "accent" }],
    type: "SPLIT",
    dur: 2800,
  },
  {
    at: "gateway",
    wallet: "card",
    log: "but the ISO-8583 AcquirerResponse is 90 — “cut-off in process”. The acquirer DID authorise the card. SmoothPay treats that as success and never re-charges it.",
    tone: "ok",
    ledger: [{ k: "charged", v: "AED 73.13", tone: "ok" }],
    type: "SPLIT",
    dur: 3000,
  },
  {
    move: { from: "gateway", to: "settle" },
    log: "settlement opens by locking the order row — SELECT … FOR UPDATE. Four people splitting one bill on four phones cannot read the same balance and overpay.",
    tone: "accent",
    ledger: [{ k: "charged", v: "AED 73.13", tone: "ok" }],
    type: "SPLIT",
    dur: 2800,
  },
  {
    at: "settle",
    log: "an idempotency key per gateway reference (stripe:pi_… / afs:id) means the webhook and the browser's confirm call — which both fire for the same charge — collapse into one transaction.",
    tone: "accent",
    ledger: [{ k: "paid so far", v: "AED 63.13 / 252.50" }],
    type: "SPLIT",
    dur: 2900,
  },
  {
    at: "settle",
    log: "…the other three pay. 63.13 × 4 = 252.52 — two cents over. A 5-cent tolerance clamps the last payer to exactly the balance left, so rounding never strands a bill as “not quite paid”.",
    tone: "ok",
    ledger: [{ k: "paid", v: "AED 252.50 / 252.50", tone: "ok" }],
    type: "SPLIT",
    dur: 3100,
  },
  {
    move: { from: "settle", to: "earn", lane: "down" },
    log: "cashback is earned on merchandise only — never on tax, service charge or tip — with per-product boosts on top. Order → COMPLETED, and the table finally releases to AVAILABLE.",
    tone: "ok",
    ledger: [{ k: "cashback earned", v: "+ AED 4.40", tone: "ok" }],
    type: "SPLIT",
    dur: 2900,
  },
  {
    at: "earn",
    log: "a GUEST who paid without an account still earns: a hashed, short-lived claim token is minted so they can attach the cashback to an account within the claim window. Nothing is silently lost.",
    tone: "accent",
    ledger: [{ k: "guest claim token", v: "10-min window", tone: "accent" }],
    type: "SPLIT",
    dur: 3000,
  },
  {
    move: { from: "earn", to: "receipt", lane: "back" },
    log: "receipt: emailed, or downloaded as a generated PDF.",
    tone: "info",
    ledger: [{ k: "receipt", v: "email · PDF" }],
    type: "SPLIT",
    dur: 2200,
  },
  {
    move: { from: "receipt", to: "review" },
    log: "finally, feedback. Rate 4★ or 5★ and the branch has a googlePlaceId → straight to its Google review page. Rate lower and the complaint stays in-app, where the merchant can actually act on it.",
    tone: "ok",
    ledger: [{ k: "rating", v: "★★★★★", tone: "ok" }],
    type: "SPLIT",
    dur: 3200,
  },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const TYPES = ["FULL", "SPLIT", "CUSTOM"];

function pick<K extends keyof Step>(i: number, key: K): Step[K] | null {
  for (let k = i; k >= 0; k--) {
    const v = SCRIPT[k][key];
    if (v) return v;
  }
  return null;
}

export default function CheckoutFlowDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const ledger = (reduced ? SCRIPT[SCRIPT.length - 1].ledger : (pick(i, "ledger") as Step["ledger"])) ?? BASE;
  const type = reduced ? "SPLIT" : ((pick(i, "type") as string) ?? "unlocked");
  const locked = type !== "unlocked";

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Checkout · tip → split → settle → cashback → review"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        badge={locked ? { text: `bill locked · ${type}`, bad: false } : { text: "bill type: unlocked", bad: false }}
        legend="◈ actor · ▧ SmoothPay service · ▤ payment rail · ● terminal state · a worked AED 252.50 bill, split 4 ways"
        log={step.log}
        logPrefix="pay"
        logTone={step.tone}
        footer={
          <>
            <Ledger rows={ledger} />
            <div className="space-y-3">
              <StatusRail label="payment type — locked by the first payment (PaymentType)" statuses={TYPES} current={locked ? type : null} />
              <FooterNote label="the invariant">
                every charge is <span className="text-good">idempotent</span> and every read is{" "}
                <span className="text-accent">row-locked</span> — a bill can be paid by four phones at once and still land
                on exactly the right number.
              </FooterNote>
            </div>
          </>
        }
      >
        <DiagramScroll>
        <svg
          viewBox="0 0 1000 326"
          className="block w-full"
          role="img"
          aria-label="Checkout flow: a customer scans the bill, adds a tip, and picks full, split or custom payment — the first payment locks the type. A logged-in customer redeems cashback, bounded by min-to-redeem and first-payer-only rules on split bills. The charge goes to Stripe, AFS or Telr; an AFS cut-off response that actually authorised the card is treated as success rather than re-charged. Settlement locks the order row and uses an idempotency key, with a five-cent tolerance so the last split payer clears the balance. Cashback is earned on merchandise only, guests get a claim token, a receipt is emailed or downloaded, and a four-or-five star rating routes to Google reviews."
        >
          {/* top rail */}
          <line x1={N.customer.x} y1={TOP} x2={N.settle.x} y2={TOP} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* settle → earn (down) */}
          <path
            d={`M ${N.settle.x} ${TOP + 28} C ${N.settle.x} 190, ${N.earn.x + 130} 190, ${N.earn.x} ${BOT - 28}`}
            fill="none"
            stroke={step.move?.lane === "down" && !reduced ? "var(--t-good)" : "var(--t-line)"}
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />
          <text
            x={880}
            y={186}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={step.move?.lane === "down" && !reduced ? "var(--t-good)" : "var(--t-muted)"}
          >
            settled ↓
          </text>

          {/* earn → receipt → review (right to left along the bottom) */}
          <line x1={N.earn.x - N.earn.w / 2} y1={BOT} x2={N.receipt.x + N.receipt.w / 2} y2={BOT} stroke="var(--t-line)" strokeWidth={1.4} strokeDasharray="5 4" />
          <line x1={N.receipt.x - N.receipt.w / 2} y1={BOT} x2={N.review.x + N.review.w / 2} y2={BOT} stroke="var(--t-line)" strokeWidth={1.4} strokeDasharray="5 4" />

          {/* wallet chips above the gateway */}
          {(["card", "apple", "google"] as const).map((wl, idx) => {
            const on = !reduced && step.wallet === wl;
            const gx = N.gateway.x - 42 + idx * 42;
            return (
              <g key={wl}>
                <rect
                  x={gx - 18}
                  y={TOP - 54}
                  width={36}
                  height={18}
                  rx={9}
                  fill={on ? "var(--t-accent)" : "var(--t-surface)"}
                  stroke={on ? "var(--t-accent)" : "var(--t-line-2)"}
                />
                <text
                  x={gx}
                  y={TOP - 41}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight={700}
                  fontFamily="var(--font-mono)"
                  fill={on ? "var(--t-accent-contrast)" : "var(--t-muted)"}
                >
                  {wl === "card" ? "CARD" : wl === "apple" ? "" : "GPay"}
                </text>
              </g>
            );
          })}

          {/* the cut-off callout — the subtlest bug in the whole system */}
          {!reduced && step.danger && (
            <g>
              <rect x={N.gateway.x - 96} y={TOP + 40} width={192} height={22} rx={11} fill="var(--t-surface)" stroke="var(--t-bad)" />
              <text x={N.gateway.x} y={TOP + 55} textAnchor="middle" fontSize={8.5} fontFamily="var(--font-mono)" fill="var(--t-bad)">
                800.800.800 — looks like a failure
              </text>
            </g>
          )}

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode
              key={id}
              node={N[id]}
              active={activeNode === id && !reduced}
              good={id === "review" && i === SCRIPT.length - 1 && !reduced}
              danger={id === "gateway" && !reduced && !!step.danger}
            />
          ))}

          {!reduced && target && (
            <MoneyPacket
              target={target}
              dur={step.dur}
              tone={step.tone === "ok" ? "ok" : step.tone === "err" ? "err" : "accent"}
              scaleAt={!!step.at}
            />
          )}
        </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
