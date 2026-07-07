import Reveal from "@/components/motion/Reveal";
import OrderFlowDiagram from "@/components/smoothpay/OrderFlowDiagram";
import PaymentLinkDiagram from "@/components/smoothpay/PaymentLinkDiagram";

/* ------------------------------------------------------------------ *
 * SmoothPayDeepDive — SmoothPay only. Owned end to end (NestJS +
 * Prisma API, React customer app + merchant dashboard). Every claim is
 * read from the source: payments.service (createCustomerPayment,
 * Stripe/AFS/Telr), afs.service, payment-links.service, currency-rates
 * .buildSnapshot, customer-ordering.service, rewards.service.
 * ------------------------------------------------------------------ */

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Scan-to-order POS",
    body: "A customer scans a table QR, browses the branch menu, and builds a server-side cart. Order & Pay holds the order at PAYMENT_PENDING until money lands; Pay-Later places it straight to the kitchen and settles the bill at the end.",
  },
  {
    title: "Three payment rails, one flow",
    body: "Stripe, Telr and AFS (Arab Financial Services) sit behind a single settlement path. The merchant picks a gateway; the order code doesn't change. Apple Pay, Google Pay and Samsung Pay ride on top of them.",
  },
  {
    title: "Settlement that can't double-charge",
    body: "Every payment locks the order row with SELECT … FOR UPDATE and carries a per-gateway idempotency key (stripe:pi, afs:id). The webhook and the client confirm call can both fire safely — the second one no-ops.",
  },
  {
    title: "Split & custom bills",
    body: "The first payment locks the bill into FULL, SPLIT or CUSTOM. Split tracks people-paid counters; a rounding tolerance means the last payer always clears the balance to the cent, never stranding an order as 'not fully paid'.",
  },
  {
    title: "Multi-currency payment links",
    body: "A merchant mints a shareable link — 256-bit token, sequential invoice ref, expiry — and sends it anywhere. The customer sees their own currency; the charge is always taken in AED, with the exchange rate frozen on the record.",
  },
  {
    title: "Display ≠ settlement currency",
    body: "The currency a customer sees is resolved from a cascade (link override → branch → the customer's country → AED) and is purely cosmetic. Every balance, charge and refund stays in AED, so the merchant's books never drift with FX.",
  },
  {
    title: "Rewards: earn & redeem",
    body: "Logged-in customers earn cashback on the merchandise subtotal (config-driven percentage, min-spend, per-transaction cap, product-level boosts) and redeem it later — with rules for min-to-redeem, max-discount and split-payment fairness.",
  },
  {
    title: "Cashback as a payment method",
    body: "Rewards aren't just a discount — a customer can pay an entire bill with accrued cashback (paymentMethod = CASHBACK), which skips the per-order caps because the cashback IS the money.",
  },
  {
    title: "Guest reward claim tokens",
    body: "A guest who pays without an account still earns cashback: a hashed, short-lived claim token is issued so they can attach the reward to an account within the claim window — no reward is silently lost.",
  },
  {
    title: "Real-time everywhere",
    body: "The moment a payment settles, a websocket event and an FCM push hit the merchant dashboard; every kitchen transition (PLACED → ACCEPTED → PREPARING → READY → SERVED) streams back to the customer's tracking screen live.",
  },
  {
    title: "Encrypted per-merchant credentials",
    body: "Each merchant's AFS access token is stored AES-256-GCM encrypted and decrypted only at charge time. Payment session tokens tie a QR scan to one order, so no one can pay for a bill they shouldn't see.",
  },
  {
    title: "Multi-tenant by construction",
    body: "Merchants, branches, tables, members and roles are isolated end to end — RBAC guards, branch-access guards, and Google OAuth login, all on a NestJS + Prisma + PostgreSQL core I own end to end.",
  },
];

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-10 font-display text-xl text-ink">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-ink/90">{children}</p>;
}
function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-accent">{children}</code>;
}

export default function SmoothPayDeepDive() {
  return (
    <section aria-label="Inside SmoothPay">
      {/* ---------- features ---------- */}
      <h2 className="mt-14 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Inside the platform — major features
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 2) * 0.05}>
            <div className="h-full rounded-lg border border-line bg-surface p-4">
              <h3 className="font-mono text-[13px] font-semibold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ---------- POS / order flow ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Order &amp; pay — the POS journey, live
      </h2>
      <P>
        SmoothPay&apos;s point-of-sale is a QR on the table. Below is the full journey,
        replayed: a customer scans, orders, pays, and then both the customer and the
        merchant watch the same order move in real time. It&apos;s the flow I&apos;m
        proudest of, because the hard parts are invisible when they work.
      </P>
      <Reveal>
        <OrderFlowDiagram />
      </Reveal>

      <H3>Placing the order</H3>
      <P>
        A scan opens the branch menu and a server-side cart. <Code>placeOrder</Code>{" "}
        computes tax and service charge from the branch&apos;s own configuration and
        creates the <Code>Order</Code>. In <em>Order &amp; Pay</em> mode the order is held
        at <Code>PAYMENT_PENDING</Code> and the kitchen isn&apos;t told yet — the merchant
        should only see orders that are actually paid for. In <em>Pay-Later</em> mode the
        order goes straight to <Code>PLACED</Code> and the bill is settled at the end.
      </P>

      <H3>Settling the money — the part that has to be perfect</H3>
      <P>
        Whichever rail the customer uses — <Code>Stripe</Code>, <Code>Telr</Code> or{" "}
        <Code>AFS</Code> — every payment funnels through one method,{" "}
        <Code>createCustomerPayment</Code>, inside a database transaction. It opens by
        locking the order row with <Code>SELECT … FOR UPDATE</Code> so two people splitting
        a bill can&apos;t both read the same balance and overpay. Each payment carries a
        per-gateway <strong className="text-ink">idempotency key</strong>, so the gateway
        webhook and the browser&apos;s confirm call — which can both arrive for the same
        charge — collapse into a single transaction. It locks the bill into FULL / SPLIT /
        CUSTOM on first payment, writes the reward, updates the paid balance, and marks the
        order <Code>COMPLETED</Code> when the bill clears (within a cent of rounding
        tolerance). AFS gets special care: an ISO-8583 &ldquo;cut-off in progress&rdquo;
        response means the card <em>was</em> charged, so the code treats it as success
        rather than prompting a retry that would double-charge.
      </P>

      <H3>Real-time, both ways</H3>
      <P>
        The instant a bill settles, <Code>confirmOrderAfterPayment</Code> flips the order to{" "}
        <Code>PLACED</Code> and fires a websocket event plus an FCM push to the branch — the
        dashboard lights up with the order without a refresh. From there the kitchen moves
        it <Code>ACCEPTED → PREPARING → READY → SERVED</Code>, and every step streams back to
        the customer&apos;s tracking screen. When the bill is fully paid and nothing unpaid
        remains on the table, the table auto-releases to <Code>AVAILABLE</Code>.
      </P>

      {/* ---------- payment link ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Payment links — collect from any country, live
      </h2>
      <P>
        Not every payment happens at a table. A merchant can mint a link, send it to a
        customer anywhere in the world, let them pay in a currency they recognise — and
        still settle cleanly in AED. This is the feature that turned SmoothPay from a
        dine-in tool into a general payments product.
      </P>
      <Reveal>
        <PaymentLinkDiagram />
      </Reveal>

      <H3>Minting and resolving a link</H3>
      <P>
        Creating a link generates a <strong className="text-ink">256-bit token</strong> and
        a human-readable sequential invoice ref (<Code>SLUG-0000007</Code>), with an amount
        in AED, an expiry, and optional tips/loyalty toggles. When the customer opens the
        URL, <Code>resolvePublic</Code> checks expiry against a 5-minute buffer and{" "}
        <strong className="text-ink">lazily creates the order</strong> on first visit — a
        unique constraint on the link&apos;s order id means two people opening the same link
        at once can never create two orders.
      </P>

      <H3>Multi-currency without breaking the books</H3>
      <P>
        Here&apos;s the invariant I care about most:{" "}
        <strong className="text-ink">the display currency is cosmetic; the settlement
        currency is always AED.</strong> <Code>buildSnapshot</Code> resolves what the
        customer sees from a cascade — an explicit link override, else the branch currency,
        else the customer&apos;s own country, else AED — and freezes that exchange rate onto
        the record. A customer in London sees £; the gateway is still charged in AED; the
        merchant&apos;s balances, refunds and reports never drift with the FX market. When
        the charge confirms, the link flips <Code>ACTIVE → PAID</Code> with the frozen
        snapshot, and the order auto-completes to <Code>SERVED</Code> — no kitchen step,
        because a link is a bill, not a meal. Unpaid links expire through both a lazy
        check-on-visit and a 10-minute safety-net cron, and a merchant can cancel an active
        one.
      </P>

      <H3>Rewards — earn, redeem, and pay with</H3>
      <P>
        Loyalty is woven into the same settlement transaction. A logged-in customer earns
        cashback on the merchandise subtotal (never on tax or service charge), governed by a
        branch-or-merchant config — percentage, minimum spend, per-transaction cap, and even
        product-level boosts. Earned rewards are stored as positive ledger entries with an
        expiry; redemptions as negative entries — so a balance is just a sum. A customer can
        redeem rewards as a discount, or pay an entire bill with them (<Code>CASHBACK</Code>{" "}
        as a payment method). And a guest who pays without an account still earns: a hashed,
        short-lived <Code>claim token</Code> lets them attach the reward to an account before
        it expires, so nothing is lost between paying and signing up.
      </P>

      {/* ---------- closing ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Owned end to end
      </h2>
      <P>
        Everything above — the NestJS + Prisma + PostgreSQL API, three payment integrations,
        the multi-currency engine, the loyalty ledger, the real-time layer, the React
        customer app and the merchant dashboard — I own from data modeling to the
        end-to-end flow. It&apos;s the clearest proof I have that I own the full stack from a
        Stripe webhook to the CSS, and that I hold payment code to the standard it demands:
        locked, idempotent, and correct to the cent.
      </P>
    </section>
  );
}
