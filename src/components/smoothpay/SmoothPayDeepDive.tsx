import { SmoothPayArchitectureDiagram, MerchantOrderFlowDiagram, OrderFlowDiagram, CheckoutFlowDiagram, PaymentLinkDiagram, RbacDiagram, MembershipLifecycleDiagram } from "@/components/smoothpay/lazy";
import Reveal from "@/components/motion/Reveal";

/* ------------------------------------------------------------------ *
 * SmoothPayDeepDive — SmoothPay only. Owned end to end across four
 * repos (NestJS + Prisma API, merchant/admin web portal, customer PWA,
 * marketing site). Every claim is read from the source: orders.service
 * (createDirect, updateStatus, hasBlockingOrdersForTable),
 * customer-ordering.service (placeOrder, updateCustomerOrderStatus,
 * confirmOrderAfterPayment), payments.service (createCustomerPayment,
 * calculateAppliedRedemption, the AFS cut-off guard), afs.service,
 * payment-links.service, currency-rates.buildSnapshot, feedback.service,
 * rbac.service, seed-permissions and the five global guards in
 * app.module.
 * ------------------------------------------------------------------ */

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Two ways to order, one order model",
    body: "A waiter places an order from the POS floor view; a customer places one by scanning the table QR. Both land in the same Order row with a source flag — so the kitchen, the bill and the table state never care which door the order came through.",
  },
  {
    title: "Two status enums, kept in lockstep",
    body: "OrderStatus tracks the money (PENDING → CONFIRMED → … → COMPLETED). CustomerOrderStatus tracks the food (PLACED → ACCEPTED → PREPARING → READY → SERVED). One merchant tap writes the customer status and projects the kitchen status from it — a forward-only transition map means a status can be skipped ahead but never walked back.",
  },
  {
    title: "Order & Pay vs Pay-Later",
    body: "Order & Pay holds the order at PAYMENT_PENDING until money lands — the kitchen is never told about an order nobody paid for. Pay-Later places it straight to the kitchen and settles the bill at the end.",
  },
  {
    title: "Three payment rails, one flow",
    body: "Stripe, Telr and AFS (Arab Financial Services) sit behind a single settlement path. The merchant picks a gateway; the order code doesn't change. Apple Pay, Google Pay and Samsung Pay ride on top of them.",
  },
  {
    title: "Settlement that can't double-charge",
    body: "Every payment locks the order row with SELECT … FOR UPDATE and carries a per-gateway idempotency key (stripe:pi, afs:id). The gateway webhook and the browser's confirm call can both fire safely — the second one no-ops.",
  },
  {
    title: "The AFS cut-off trap",
    body: "AFS can answer 800.800.800 — 'temporarily unavailable' — on a card it actually authorised. The ISO-8583 AcquirerResponse 90 ('cut-off in process') is the tell. SmoothPay reads it and treats the payment as successful, because the naïve reading would charge the customer twice.",
  },
  {
    title: "Split, partial & full bills",
    body: "The first payment locks the bill into FULL, SPLIT or CUSTOM. Split tracks a people-paid counter; a 5-cent rounding tolerance means the last payer always clears the balance, so a bill is never stranded a fraction short of paid.",
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
    title: "Rewards: earn, redeem, and pay with",
    body: "Logged-in customers earn cashback on the merchandise subtotal only — never on tax, service charge or tip — governed by percentage, min-spend, per-transaction cap and product-level boosts. They can redeem it as a discount, or pay an entire bill with it (paymentMethod = CASHBACK).",
  },
  {
    title: "Memberships on the restaurant's own rail",
    body: "Merchants sell monthly or annual plans with a standing discount, free trials and fixed terms. The restaurant is merchant of record — money moves on its own AFS credentials, in a domain kept separate from SmoothPay's own SaaS billing.",
  },
  {
    title: "A renewal engine that can't double-charge",
    body: "Once a day, four passes in a fixed order: resume → expire → apply plan change → collect. A partial unique index allows one open charge per invoice, and one invoice per period — a second runner loses on the database.",
  },
  {
    title: "Guest reward claim tokens",
    body: "A guest who pays without an account still earns cashback: a hashed, short-lived claim token is issued so they can attach the reward to an account within the claim window. Logging in is optional — but it's the thing that decides whether the cashback is yours.",
  },
  {
    title: "Feedback that routes itself",
    body: "After paying, the customer rates the meal. 4★ or 5★ and the branch has a googlePlaceId → they're handed straight to its Google review page. Rate lower and the complaint stays in-app, where the merchant can actually do something about it.",
  },
  {
    title: "Real-time everywhere",
    body: "A socket.io gateway with per-merchant and per-order rooms, plus FCM push. A waiter's tap and the customer's tracking screen are the same event — the merchant portal and the customer app never talk to each other, they just listen to the same room.",
  },
  {
    title: "Tables that release themselves",
    body: "A table frees only on reject/cancel, or when an order is both served and fully paid — and only if no other unpaid order is still open on it. Served is not paid, and the floor view knows the difference.",
  },
  {
    title: "RBAC, enforced by default",
    body: "Five guards run globally on every request: JwtAuth → Roles → Permission → BranchAccess → Throttler. 101 seeded permissions across ADMIN and MERCHANT scopes, Owner/Manager/Staff roles per merchant, plus custom roles. A new endpoint is protected because it exists, not because someone remembered.",
  },
  {
    title: "Multi-tenant by construction",
    body: "Merchants, branches, tables, menus, members and roles are isolated end to end. PermissionGuard answers 'can this role do X?'; BranchAccessGuard answers '…to THIS branch?' — the second question is the one that keeps tenants from reading each other.",
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
function Section({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</h2>
  );
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

      {/* ---------- architecture ---------- */}
      <Section>Four repos, one domain — live</Section>
      <P>
        SmoothPay is four codebases: a marketing site, a React app that is <em>both</em> the merchant portal and the
        platform-admin console, a customer PWA that opens from a QR code, and a NestJS API that owns the entire domain.
        The thing worth understanding first is how little glue there is between them — one Prisma schema, one guard chain,
        one settlement path, and a real-time layer that makes the two front ends feel like one product.
      </P>
      <Reveal>
        <SmoothPayArchitectureDiagram />
      </Reveal>

      {/* ---------- merchant POS ---------- */}
      <Section>The merchant floor — a waiter takes an order, live</Section>
      <P>
        Most of the day, orders don&apos;t start with the customer. A waiter opens the floor view, taps a table, builds an
        order from the live menu, and fires it at the kitchen. Below is that journey — including the reject branch, and the
        rule that decides when a table is actually free again.
      </P>
      <Reveal>
        <MerchantOrderFlowDiagram />
      </Reveal>

      <H3>One tap, two audiences</H3>
      <P>
        The design decision I like most in SmoothPay is that an order carries{" "}
        <strong className="text-ink">two status enums</strong>, not one. <Code>OrderStatus</Code> is the merchant&apos;s
        view and it really tracks <em>the money</em>: <Code>PENDING → CONFIRMED → PREPARING → READY → COMPLETED</Code>.{" "}
        <Code>CustomerOrderStatus</Code> is the diner&apos;s view and it tracks <em>the food</em>:{" "}
        <Code>PLACED → ACCEPTED → PREPARING → READY → SERVED</Code>. When a merchant accepts an order, one write moves the
        customer-facing status and <em>projects</em> the kitchen status from it. A single transition map governs what&apos;s
        legal — it&apos;s forward-only, so a merchant can skip ahead (straight from placed to served on a quick coffee) but
        can never walk a status backwards, and a fully-paid order can never be rejected or cancelled.
      </P>
      <P>
        The payoff shows up in the prepaid case. If a customer pays up front, the bill clears immediately — so{" "}
        <Code>OrderStatus</Code> is <Code>COMPLETED</Code> before the chef has touched the ticket, and the entire kitchen
        progression rides on <Code>CustomerOrderStatus</Code>. Two enums sound like duplication until you notice that
        &ldquo;is the money done&rdquo; and &ldquo;is the food done&rdquo; are genuinely different questions with genuinely
        different answers.
      </P>

      <H3>When is a table actually free?</H3>
      <P>
        A served order is not a paid order. A table releases to <Code>AVAILABLE</Code> only when the order is rejected or
        cancelled, or when it is <strong className="text-ink">both served and fully paid</strong> — and even then, only if{" "}
        <Code>hasBlockingOrdersForTable</Code> confirms no other unpaid order is still open on it. That check is what makes
        it safe for a table of six to keep ordering rounds all evening and settle once at the end.
      </P>

      {/* ---------- customer scan-to-order ---------- */}
      <Section>The other door — scan, order, pay, live</Section>
      <P>
        The same order can start from the customer&apos;s phone instead. They scan the table QR, browse the branch menu, and
        either <em>Order &amp; Pay</em> — held at <Code>PAYMENT_PENDING</Code> so the kitchen never sees an unpaid order — or{" "}
        <em>Pay-Later</em>, which goes straight to the kitchen and settles at the end.
      </P>
      <Reveal>
        <OrderFlowDiagram />
      </Reveal>

      {/* ---------- checkout ---------- */}
      <Section>Checkout — the part that has to be perfect</Section>
      <P>
        Everything above is a preamble to one method. Whichever rail the customer uses — Stripe, Telr or AFS — and whichever
        door the order came through, every payment funnels through <Code>createCustomerPayment</Code> inside a single database
        transaction. Below is a worked bill: <strong className="text-ink">AED 252.50, split four ways</strong>, with a tip,
        a cashback redemption, and a gateway that lies about failing.
      </P>
      <Reveal>
        <CheckoutFlowDiagram />
      </Reveal>

      <H3>Locking, idempotency, and the last five cents</H3>
      <P>
        Settlement opens by locking the order row with <Code>SELECT … FOR UPDATE</Code>, so four people splitting a bill on
        four phones can&apos;t all read the same balance and overpay. Each payment carries a per-gateway{" "}
        <strong className="text-ink">idempotency key</strong>, so the gateway webhook and the browser&apos;s confirm call —
        which routinely both arrive for the same charge — collapse into one transaction. The first payment{" "}
        <strong className="text-ink">locks the bill</strong> into <Code>FULL</Code>, <Code>SPLIT</Code> or <Code>CUSTOM</Code>;
        after that nobody can switch type mid-bill and desync the maths.
      </P>
      <P>
        Then there&apos;s the arithmetic nobody thinks about until it bites. Split AED 252.50 four ways and each share rounds
        to 63.13 — but four of those is 252.52, two cents more than the bill. A{" "}
        <Code>ROUNDING_TOLERANCE</Code> of five cents clamps the final payer to exactly the balance remaining, and settles the
        order as fully paid within that same tolerance. Without it, a rounding artefact of two cents leaves a paid table stuck
        forever as &ldquo;not quite paid&rdquo; — and an occupied table nobody can seat.
      </P>

      <H3>The gateway that lies about failing</H3>
      <P>
        My favourite bug in this system is one that never happened. AFS can return <Code>800.800.800</Code> — temporary
        unavailability — for a card it has <em>already authorised</em>. Read that response literally and you either tell the
        customer their payment failed, or you retry and charge them twice. The tell is the ISO-8583{" "}
        <Code>AcquirerResponse: 90</Code>, &ldquo;cut-off in process&rdquo;: the acquirer took the money and is mid-batch.
        SmoothPay checks for exactly that, treats the payment as successful, and preserves the result across a session retry
        rather than re-charging. Payment code earns its keep in the responses that aren&apos;t in the happy-path docs.
      </P>

      <H3>Rewards, and what logging in actually buys you</H3>
      <P>
        Loyalty is woven into the same settlement transaction, not bolted on after it. Cashback is earned on the{" "}
        <strong className="text-ink">merchandise subtotal only</strong> — never on tax, service charge or tip — with
        product-level boosts on top. Redemption is fenced in by min-to-redeem, a max-discount cap, redeem-once-per-order, and
        a rule I&apos;m fond of: on a split bill <strong className="text-ink">only the first payer may redeem</strong>, so one
        discount can&apos;t be claimed four times. Earned rewards are positive ledger entries with an expiry; redemptions are
        negative ones — a balance is just a sum. And a guest who pays with no account still earns: a hashed, short-lived{" "}
        <Code>claim token</Code> lets them attach the cashback to an account before it expires, so the reward isn&apos;t
        quietly lost in the gap between paying and signing up.
      </P>

      <H3>Receipt, rating, and the review gate</H3>
      <P>
        Once the bill clears, the customer emails themselves a receipt or downloads a generated PDF, and rates the meal. If
        they give 4★ or 5★ <em>and</em> the branch has a <Code>googlePlaceId</Code>, they&apos;re handed straight to that
        branch&apos;s Google review page — the merchant&apos;s public rating gets the customers who actually enjoyed
        themselves. Anything lower stays in-app and lands in the merchant&apos;s feedback dashboard instead, tagged and
        searchable. It&apos;s a small piece of routing logic that quietly does a lot of commercial work.
      </P>

      {/* ---------- payment link ---------- */}
      <Section>Payment links — collect from any country, live</Section>
      <P>
        Not every payment happens at a table. A merchant can mint a link, send it to a customer anywhere in the world, let
        them pay in a currency they recognise — and still settle cleanly in AED. This is the feature that turned SmoothPay
        from a dine-in tool into a general payments product.
      </P>
      <Reveal>
        <PaymentLinkDiagram />
      </Reveal>

      <H3>Minting and resolving a link</H3>
      <P>
        Creating a link generates a <strong className="text-ink">256-bit token</strong> and a human-readable sequential
        invoice ref (<Code>SLUG-0000007</Code>), with an amount in AED, an expiry, and optional tips/loyalty toggles. When the
        customer opens the URL, <Code>resolvePublic</Code> checks expiry against a 5-minute buffer and{" "}
        <strong className="text-ink">lazily creates the order</strong> on first visit — a unique constraint on the link&apos;s
        order id means two people opening the same link at once can never create two orders. Because a link is a bill and not
        a meal, settling it auto-completes the order to <Code>SERVED</Code> with no kitchen step at all.
      </P>

      <H3>Multi-currency without breaking the books</H3>
      <P>
        Here&apos;s the invariant I care about most:{" "}
        <strong className="text-ink">the display currency is cosmetic; the settlement currency is always AED.</strong>{" "}
        <Code>buildSnapshot</Code> resolves what the customer sees from a cascade — an explicit link override, else the branch
        currency, else the customer&apos;s own country, else AED — and freezes that exchange rate onto the record. A customer
        in London sees £; the gateway is still charged in AED; the merchant&apos;s balances, refunds and reports never drift
        with the FX market. Unpaid links expire through both a lazy check-on-visit and a 10-minute safety-net cron, and a
        merchant can cancel an active one.
      </P>

      {/* ---------- RBAC ---------- */}
      {/* ---------- memberships ---------- */}
      <Section>Memberships — a subscription engine on the restaurant&apos;s card rail, live</Section>
      <P>
        The newest piece of SmoothPay turns a one-off diner into a member. A restaurant designs plans in its portal —
        monthly or annual, a standing discount, an optional free trial or fixed term, a sell window — prints a QR, and
        diners join from their phone. The restaurant is the merchant of record: the money moves on its own AFS credentials,
        in a domain kept deliberately separate from the SaaS billing SmoothPay runs for its merchants.
      </P>
      <Reveal>
        <MembershipLifecycleDiagram />
      </Reveal>

      <H3>Three ways in, one card on file</H3>
      <P>
        A <strong className="text-ink">paid join</strong> charges the first period plus the plan&apos;s own VAT — and if the
        diner buys it alongside a dine-in bill, it settles inside that same payment rather than as a second charge. A{" "}
        <strong className="text-ink">free trial</strong> has nothing due, but the card still has to be saved for the first
        charge when the trial ends: the join is an <Code>AED 1</Code> hold with <Code>createRegistration</Code>, reversed the
        same day, with a 20-minute sweep that releases any hold an inline reversal or an abandoned 3DS left behind. An{" "}
        <strong className="text-ink">AED 0 plan</strong> joins card-free. In every case the consent wording is frozen on the
        attempt row, and the server re-queries AFS on return — the redirect is never trusted.
      </P>

      <H3>Billing on a calendar that doesn&apos;t drift</H3>
      <P>
        Renewal dates are anchored to the day of month on the <strong className="text-ink">Dubai calendar</strong> (UTC+4,
        no daylight saving). A member who joins on the 31st renews on 28 February and 31 March — the anchor picks the day,
        not last month&apos;s date, so a period never quietly shrinks. Upgrades (a higher monthly price) are paid now on the
        saved card and switched today; downgrades are booked as a pending plan and applied at the next renewal, billed at
        the new price from its first cycle. A member can pause for one, two or three months, once a year, and gets every
        unused paid day back on resume.
      </P>

      <H3>The benefit, and what it never touches</H3>
      <P>
        The discount is priced in one pure function with its own worked-example tests. It lands on{" "}
        <strong className="text-ink">items only, and only on the member&apos;s own share</strong> of a split bill — 10% of their
        AED 50, not of the table&apos;s AED 200 — while the three friends who didn&apos;t subscribe are priced exactly as before.
        It never touches the tip, the service charge or the plan fee, and VAT shrinks in proportion to the discounted items.
        What a member gets <em>today</em> is a derived <Code>phase</Code> — trial, active, renewing, ending, payment due,
        paused — computed from the row and the clock and never stored, so it can&apos;t drift from the dates the engine works
        from. A cancel mid-period keeps the benefit to the last paid day; a due renewal keeps it through a 24-hour grace
        window while the daily engine charges.
      </P>

      <H3>A daily engine that nobody watches</H3>
      <P>
        Renewals are unattended charges, so the guards are the ones that work when nobody is looking. One runner across every
        API instance (a Redis <Code>SET NX</Code> lock). Four passes in an order that makes each next query correct:{" "}
        <Code>resume → expire → plan change → collect</Code> — expire runs before collect, which is what makes
        &ldquo;cancelled and not charged&rdquo; true rather than intended. A partial unique index permits one open charge per
        invoice, and invoices are unique per period, so a second run loses on the database instead of in application code.
        An undecided gateway answer stays pending and blocks retries, because a stuck invoice is recoverable and a double
        charge is not. Declines walk a ladder of retries after 1, 3, 7, 7 and 7 days; a card the scheme calls unusable skips
        straight to &ldquo;update your card&rdquo; email and SMS.
      </P>

      <Section>RBAC — five guards, every request, live</Section>
      <P>
        SmoothPay is multi-tenant: many merchants, each with many branches, each with staff who should see some of them and
        not others. That&apos;s enforced by five guards registered globally in <Code>app.module</Code>, which means a new
        endpoint is protected because it exists — not because someone remembered to protect it. Below, the same request is run
        twice: once by a Staff user reaching for a branch that isn&apos;t hers, once by her Manager.
      </P>
      <Reveal>
        <RbacDiagram />
      </Reveal>

      <H3>&ldquo;Can do&rdquo; and &ldquo;can do here&rdquo; are different questions</H3>
      <P>
        The permission model is 101 seeded permissions across <Code>ADMIN</Code> and <Code>MERCHANT</Code> scopes, grouped by
        resource — branches, orders, qr_codes, payment_links, menus, loyalty, rbac. Every merchant is seeded with{" "}
        <Code>Owner</Code>, <Code>Manager</Code> and <Code>Staff</Code> roles, and can mint custom roles from the same
        permission set. <Code>PermissionGuard</Code> checks the codes a route declares via <Code>@RequirePermission</Code>{" "}
        against the caller&apos;s role, with a super-admin short-circuit.
      </P>
      <P>
        But holding <Code>orders.view</Code> doesn&apos;t tell you <em>whose</em> orders. That&apos;s the job of{" "}
        <Code>BranchAccessGuard</Code>, which pulls a <Code>branchId</Code> out of the route params, body or query and checks
        it against the caller&apos;s <Code>allowedBranchIds</Code> — unless their role carries{" "}
        <Code>allBranchAccess</Code>, which waves an owner or manager through. Collapsing those two checks into one is exactly
        how multi-tenant systems end up serving one tenant&apos;s data to another, and keeping them separate is the least
        glamorous, most important thing in the codebase.
      </P>

      {/* ---------- closing ---------- */}
      <Section>Owned end to end</Section>
      <P>
        Everything above — the NestJS + Prisma + PostgreSQL API, the dual-status order machine, three payment integrations,
        the multi-currency engine, the loyalty ledger, the membership renewal engine, the guard chain, the real-time layer, the merchant portal, the admin
        console and the customer PWA — I own from data modeling to the CSS. It&apos;s the clearest proof I have that I can
        take a product from an empty schema to a restaurant floor, and that I hold payment code to the standard it demands:
        locked, idempotent, and honest about the five cents.
      </P>
    </section>
  );
}
