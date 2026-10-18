import { DigitalActivationDiagram, ShipmentFlowDiagram, ReshipmentFlowDiagram, PhysicalActivationDiagram, CancelFlowDiagram, WoohooDeployDiagram } from "@/components/woohoo/lazy";
import Reveal from "@/components/motion/Reveal";

/* ------------------------------------------------------------------ *
 * WoohooCardDeepDive — woohoo-card (Go) only. Every status, queue
 * name and transition below is read from the source: orders.go,
 * monitors/{publish,activations,wallet,notification,reset,
 * cancelValidations,cancellations}.go, ship/{ship,reship}.go,
 * validations/upload.go, the helper constants, messageQueues/wmq,
 * the Dockerfile and the AWS specs. Provider-facing routes are
 * intentionally out of scope.
 * ------------------------------------------------------------------ */

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Sync & async in one API",
    body: "One create endpoint serves both: sync orders activate inline (capped at a few cards) and return card data; async orders return 202 and flow through the monitor pipeline — which is how a single order for a lakh of cards gets processed fast.",
  },
  {
    title: "The monitor ledger",
    body: "Every async stage writes a monitor row transactionally with its queue push — (order, stage, messageId). The next stage locks that row with FetchForUpdate before doing anything, so a redelivered message can never double-process.",
  },
  {
    title: "Delegated transport",
    body: "The service runs no consumers of its own. It pushes to the b2b-queue-consumer platform over REST; that platform delivers each message back as a webhook and owns the retry/backoff. Business logic and transport stay cleanly separated.",
  },
  {
    title: "Concurrent batch fan-out",
    body: "Cards are split into config-sized batches and pushed concurrently with goroutines — a WaitGroup, a mutex over the shared batch list, and a failure channel that rolls the whole push back if any batch fails.",
  },
  {
    title: "Monitors that verify, not assume",
    body: "Each monitor's job is to keep checking its own stage — all cards inserted? activated? notified? — and return 500 until the answer is yes. The queue platform's backoff does the waiting; the monitor just tells the truth.",
  },
  {
    title: "Full card lifecycle",
    body: "Create, validate, activate, add-to-wallet, ship, reship, reset PIN, cancel-validate, cancel, cancel-wallet, reverse — each transition is its own monitor + queue pair, durable and independently retryable.",
  },
  {
    title: "Digital and physical in one engine",
    body: "DIGITAL_ACTIVATION delivers e-vouchers over email/SMS/WhatsApp; ACTIVATION_PHYSICAL ships plastic via BlueDart with DEFERRED (activate on receipt) and IMMEDIATE (activate before shipping) fulfilment — same pipeline, different gates.",
  },
  {
    title: "Reversal safety net",
    body: "If a provider activation fails after money has moved, a reverse monitor undoes the provider transaction. Money is never stranded on a dead card.",
  },
  {
    title: "Provider abstraction via router",
    body: "A dozen distribution providers sit behind a common interface, reached through the woohoo-router: get a transaction id, then activate/void. Adding a provider doesn't touch the order pipeline.",
  },
  {
    title: "MySQL read/write split",
    body: "GORM over a driver that separates reads from writes, with row-level locking on the hot order and monitor rows. Card and transaction tables are the system of record for every gift card ever issued.",
  },
  {
    title: "KMS field encryption",
    body: "Card numbers, PINs and PII are envelope-encrypted with KMS at the field level and masked in logs. Sensitive fields are stripped from responses unless the caller is explicitly authorized.",
  },
  {
    title: "Operational crons",
    body: "Product import, PIN clearing, DB cleanup, status reconciliation, scheduled orders, card upload/retrieval — run from the same image as `main cron <type>` in a dedicated ECS task.",
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

export default function WoohooCardDeepDive() {
  return (
    <section aria-label="Inside the woohoo-card service">
      {/* ---------- features ---------- */}
      <h2 className="mt-14 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Inside the system — major features
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

      {/* ================= DIGITAL_ACTIVATION ================= */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Digital activation — the full journey, live
      </h2>
      <P>
        A <Code>DIGITAL_ACTIVATION</Code> order is an e-voucher: the customer receives card
        details digitally and can spend them immediately. Its life has three acts —
        activation, shipment, and (when something needs resending) reshipment. Each is a
        chain of queue-driven monitors, and each replay below uses the real status
        constants and queue names from the Go source.
      </P>

      <H3>The two-tier rhythm — monitors drive, workers do</H3>
      <P>
        Read every diagram below the same way. The top tier is <strong className="text-ink">monitor
        queues</strong>: these are the state machine. A monitor receives its webhook, pushes
        the order&apos;s cards <em>down</em> to its <strong className="text-ink">worker queue</strong>,
        sets the order status, and then returns <Code>500</Code> so the platform re-delivers
        it — over and over — until every card&apos;s transaction is done. Only then does it
        push to the <em>next</em> monitor queue. The bottom tier is worker queues: they do the
        per-card work (insert, activate, add-to-wallet, notify, void) against MySQL, the
        provider or the wallet, and they never touch the order status. That division is
        enforced in code — the activation worker literally refuses to run unless the monitor
        has already set the order to <Code>PROCESSING</Code>.
      </P>

      <H3>1 · Order activation</H3>
      <P>
        Sync orders activate inline but are capped by config to a handful of cards. The
        async path is where the scale lives — a single order for 1,00,000 cards flows
        through this pipeline, fast, because every stage batches and fans out with
        goroutines instead of looping.
      </P>
      <Reveal>
        <DigitalActivationDiagram />
      </Reveal>
      <P>
        Follow the status changes — they only ever happen at a monitor. The{" "}
        <Code>publish-activation-monitor</Code> holds the order at <Code>PENDING</Code> while
        its worker bulk-inserts card rows. When all rows exist it pushes the{" "}
        <Code>activation-monitor</Code>, which sets <Code>INITIATED</Code>, fans the cards to
        the <Code>activation</Code> worker queue, and flips the order to <Code>PROCESSING</Code>{" "}
        the moment they&apos;re all pushed — then it just keeps getting redelivered, answering
        &ldquo;are all cards active yet?&rdquo; with a 500 until yes. If the store has the
        Woohoo Wallet enabled, it hands off to the <Code>add-card-to-wallet-monitor</Code>,
        which walks <Code>UPDATE_WALLET_INITIATED → UPDATE_WALLET_INPROGRESS</Code> as its
        worker batches every card into the wallet. Only then: <Code>ACTIVATED</Code>. A sync
        order that times out at the provider can even convert to this async flow mid-request
        instead of failing.
      </P>

      <H3>2 · Shipment — delivering the e-voucher</H3>
      <P>
        &ldquo;Shipment&rdquo; for a digital order means notification: getting the card
        details into the customer&apos;s inbox, SMS thread or WhatsApp. It starts either
        from an explicit ship API call or automatically — <Code>autoShipment</Code> rolls
        an activated order straight into <Code>SHIPMENT_INITIATED</Code>.
      </P>
      <Reveal>
        <ShipmentFlowDiagram />
      </Reveal>
      <P>
        The routing detail I like: the per-card handler inspects which delivery modes the
        card carries. One mode → the dedicated pool queue (<Code>notification_pool_email</Code>,{" "}
        <Code>notification_pool_sms</Code> or <Code>notification_pool_whatsapp</Code>).
        More than one → <Code>notification_pool</Code>, which fans the message out to all
        three channels internally. Those queues are consumed by the delivery microservice —{" "}
        the same one covered in its own case study — and the notification monitor keeps
        redelivering until <Code>unNotifiedCardsCount == 0</Code>, at which point the order
        is <Code>SHIPPED</Code>.
      </P>

      <H3>3 · Reshipment — resending without risk</H3>
      <P>
        Wrong email, changed phone number, expired PIN — resending card details is a
        security-sensitive operation, so it always passes through a PIN-reset gate first.
      </P>
      <Reveal>
        <ReshipmentFlowDiagram />
      </Reveal>
      <P>
        The reship API moves the order to <Code>RESET_PIN_INITIATED</Code> and the reset
        monitor pushes every card through the <Code>activation-reset-pin</Code> queue. The
        per-card handler is deliberately conservative: it resets a PIN <em>only</em> if the
        recipient was modified or the PIN has expired — otherwise it returns 200 and touches
        nothing. Once every card is checked, the order becomes <Code>RESHIP_INITIATED</Code>{" "}
        and the exact same notification engine reruns (wallet-enabled orders first detour
        through the wallet monitor again), ending back at <Code>SHIPPED</Code>.
      </P>

      {/* ================= PHYSICAL_ACTIVATION ================= */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Physical activation — plastic in the mail, live
      </h2>
      <P>
        <Code>ACTIVATION_PHYSICAL</Code> orders end as real cards in an envelope. The
        pipeline gains two stages digital never needs — card-stock upload and validation —
        and splits into two fulfilment types that differ in one crucial decision:{" "}
        <em>when does the plastic become money?</em>
      </P>
      <Reveal>
        <PhysicalActivationDiagram />
      </Reveal>
      <P>
        Both types share the front half: the publish monitor inserts card rows and then{" "}
        <em>deliberately stops</em> — no auto-activation for physical stock. An operator
        uploads the printed-card file, and the validation monitor drives{" "}
        <Code>VALIDATION_INITIATED → VALIDATION_INPROGRESS</Code>, checking every number
        against the uploaded stock (a hard failure parks the order at{" "}
        <Code>VALIDATION_FAILED</Code>). All valid → <Code>CREATED</Code>.
      </P>
      <P>
        <strong className="text-ink">DEFERRED</strong> ships inert plastic: the ship API
        (allowed only at <Code>CREATED</Code>) hands the parcel to BlueDart, courier events
        flow through the delivery service to <Code>DELIVERED</Code> — and the cards stay
        worthless until the customer initiates activation, which the Activate API accepts{" "}
        <em>only</em> for QC + DEFERRED orders. A stolen envelope is just plastic.{" "}
        <strong className="text-ink">IMMEDIATE</strong> inverts the gate: the validation
        monitor pushes the activation monitor itself, the cards go live in the warehouse,
        and the ship API then <em>requires</em> <Code>ACTIVATED</Code> before BlueDart takes
        them — the customer can spend straight from the envelope.
      </P>

      {/* ================= CANCEL ================= */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Cancelling an order — the money must come back
      </h2>
      <P>
        Cancellation is the flow where mistakes are expensive in both directions: cancel too
        eagerly and you void a card someone already spent; too timidly and money is stranded
        on unused plastic. So it validates before it voids.
      </P>
      <Reveal>
        <CancelFlowDiagram />
      </Reveal>
      <P>
        For activation orders the request first runs{" "}
        <Code>CANCEL_VALIDATION_INITIATED → CANCEL_VALIDATION_INPROGRESS</Code>: every card
        is checked — balance untouched, provider supports cancel-reversal — and a spent card
        stops the cancel cold. Only a fully-validated order moves to{" "}
        <Code>CANCEL_INITIATED</Code>, where the cancel monitor batches cards through the{" "}
        <Code>activation-cancel</Code> queue (<Code>CANCEL_INPROGRESS</Code>), voiding each
        at the provider with the same 500-retry contract as activation. Cards that live in
        Woohoo Wallets are pulled back out by the cancel-wallet monitor, and the order lands
        in its terminal state: <Code>CLOSED</Code> — with an S2S notification so the
        storefront knows. Small sync-path footnote: low-card-count cancels can run the whole
        thing in-request and return 201 immediately.
      </P>

      {/* ---------- deployment ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        How it ships — deployment, live
      </h2>
      <P>
        The service is a single compiled Go binary, which makes its footprint and its
        deployment refreshingly simple.
      </P>
      <Reveal>
        <WoohooDeployDiagram />
      </Reveal>

      <H3>One binary, three roles</H3>
      <P>
        CodeBuild compiles a Go 1.24 ARM64 binary into an Amazon Linux image — no runtime to
        ship, just the binary, nginx, Telegraf and the built admin UI. It&apos;s pushed to
        ECR versioned and as <Code>latest</Code>, and CodeDeploy runs an ECS blue/green shift.
        The same image runs three roles: the API server, a separate cron task invoked as{" "}
        <Code>main cron &lt;type&gt;</Code>, and the served admin console. Secrets — the MySQL
        read/write URLs, OAuth and KMS keys — are pulled from Secrets Manager at boot, and a
        Redis pub/sub subscriber lets caches reinitialize live without a redeploy.
      </P>

      <H3>Why delegating transport matters</H3>
      <P>
        The most consequential architectural choice is what this service <em>doesn&apos;t</em>{" "}
        do: it doesn&apos;t run queue consumers. By pushing to the shared queue platform and
        exposing monitor webhooks, it keeps the retry engine, backoff and dead-lettering in
        one place it doesn&apos;t have to maintain, and stays a stateless request/response app
        that scales horizontally behind the load balancer. The green-env flag even rides along
        in each queue message, so blue/green cutovers stay coherent end to end across both
        services.
      </P>
    </section>
  );
}
