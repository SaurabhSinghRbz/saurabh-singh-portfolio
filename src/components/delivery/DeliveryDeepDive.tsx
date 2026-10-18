import { NotificationFlowDiagram, OtpFlowDiagram, EncryptionProxyDiagram, DeliveryDeployDiagram } from "@/components/delivery/lazy";
import Reveal from "@/components/motion/Reveal";

/* ------------------------------------------------------------------ *
 * DeliveryDeepDive — delivery microservice only. Every claim comes
 * from the real source: the email/sms/whatsapp routes, lib/otp,
 * lib/track providers, lib/hasura + helper/hasura/parser (the crypto
 * proxy), the Dockerfile, and the ECS task definitions.
 * ------------------------------------------------------------------ */

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Channel-agnostic core",
    body: "One send API in front of provider factories for email, SMS, WhatsApp and push. The caller asks for a notification; the service decides the vendor. Adding a channel doesn't change the callers.",
  },
  {
    title: "A deep provider bench",
    body: "Seven SMS vendors (Gupshup, Twilio, Sinch, Infobip, Unicel, Britannia…), three email providers (SendGrid, SES, internal delivery), WhatsApp via Gupshup — each behind a common interface so any one can be swapped or failed over.",
  },
  {
    title: "Provider failover",
    body: "Providers are an ordered array. A 5xx from the primary vendor falls through to the next in line, so a single vendor outage never becomes a missed OTP or a lost receipt.",
  },
  {
    title: "Versioned templates",
    body: "Handlebars templates with locale and per-store variants live in Postgres — marketing changes copy without a deploy, and engineering can trace exactly which template version a customer received.",
  },
  {
    title: "Rich content generation",
    body: "Barcodes (bwip-js), QR codes and chart images are rendered server-side and attached inline — the cairo/pango stack is baked into the image so a gift card's barcode is generated at send time.",
  },
  {
    title: "OTP with attempt limiting",
    body: "Generate → encrypt → cache in Redis with a TTL → deliver over multiple channels in parallel. Verification counts invalid attempts and locks out brute force; a failed delivery decrements the issue budget.",
  },
  {
    title: "Delivery-receipt tracking",
    body: "Providers call back to /track/:channel/:provider. Each vendor's status vocabulary is mapped to a common lifecycle — QUEUED → SENT → DELIVERED → FAILED — so any message's journey is a single lookup.",
  },
  {
    title: "PII encryption proxy",
    body: "An Express layer sits in front of Hasura: columns listed in crypto_table_mapping are encrypted on write and decrypted on read, so Postgres only ever holds ciphertext. GDPR is enforced at the edge, transparently.",
  },
  {
    title: "KMS-backed crypto",
    body: "woohooKMS envelope encryption and aes256 protect secure params and PII; logs are masked by configurable key lists. Secrets themselves come from AWS Secrets Manager at boot, never from the image.",
  },
  {
    title: "Query optimization",
    body: "The tracking tables grow with every message ever sent. Matching indexes to the real access patterns — status lookups, template fetches, OTP validation — turned hot table-scans into index hits, the difference between an OTP that beats the user and one that doesn't.",
  },
  {
    title: "Shipment tracking cron",
    body: "For physical gift cards, a scheduled task polls couriers (e.g. BlueDart), records shipment events, and pushes an S2S notification the moment a parcel is delivered or returned.",
  },
  {
    title: "Observability & audit",
    body: "OpenTelemetry traces, Telegraf fan-out to InfluxDB, Loki, QRadar and a Kafka audit trail, plus New Relic — every notification is traceable, and the security team gets its audit stream for free.",
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

export default function DeliveryDeepDive() {
  return (
    <section aria-label="Inside the delivery service">
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

      {/* ---------- notification lifecycle ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        The notification lifecycle — watch it run
      </h2>
      <P>
        Below is the path every message takes, replayed live: an email that renders a
        template and lands in an inbox, the delivery receipt that walks its status forward,
        and an SMS send that fails over to a backup vendor without the caller ever knowing.
      </P>
      <Reveal>
        <NotificationFlowDiagram />
      </Reveal>

      <H3>How a send works</H3>
      <P>
        A producer calls <Code>POST /api/email</Code> (or <Code>/api/sms</Code>,{" "}
        <Code>/api/whatsapp</Code>) with a refno, recipients, a template reference and
        params. The request is validated against an <Code>express-validator</Code> schema,
        then any <Code>secure</Code> params are decrypted (JWT or aes256). The template is
        retrieved by id, locale and store code, rendered with Handlebars, and the subject
        compiled. If the message carries a card, its barcode and QR code are generated
        server-side and attached inline. Only then is the provider config resolved — by{" "}
        <Code>uuid</Code> or <Code>external_id</Code>, decrypted from storage — and handed
        to the matching provider adapter. Because <Code>email.providers</Code> is an array
        run through <Code>Promise.all</Code>, a request can target several providers at once
        or fall through to a backup.
      </P>

      <H3>How delivery status is tracked</H3>
      <P>
        Sending is only half the story — knowing what happened is the other half. When a
        vendor accepts a message it&apos;s recorded as <Code>SENT</Code>; seconds or minutes
        later the vendor POSTs a delivery receipt to{" "}
        <Code>/track/:channel/:provider</Code>. The route dispatches to a provider-specific
        parser that maps that vendor&apos;s status codes onto one shared lifecycle —{" "}
        <Code>QUEUED → SENT → DELIVERED → FAILED</Code> — and updates the message row. That
        is what makes &ldquo;did this customer get their OTP?&rdquo; answerable in a single
        lookup, regardless of which of a dozen vendors actually carried it.
      </P>

      {/* ---------- OTP ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        The OTP path — the hottest flow on the platform
      </h2>
      <P>
        An OTP is login latency made visible: the user is staring at the screen while it
        travels. It&apos;s also the most attacked path, so it&apos;s built to be both fast
        and hostile to brute force.
      </P>
      <Reveal>
        <OtpFlowDiagram />
      </Reveal>
      <P>
        On <Code>send</Code>, the service first calls <Code>canSendOtp()</Code> to check the
        invalid-attempt ceiling in Redis, generates a random code (length capped by config),
        and saves it to Redis under a TTL equal to the OTP&apos;s validity. The code is
        encrypted (woohooKMS + aes256) into the secure param before storage — the plaintext
        OTP is never persisted — and delivered over every requested channel in parallel. On{" "}
        <Code>verify</Code>, each wrong guess increments an invalid-attempt counter; a match
        on both code and uuid clears the cache immediately, so an OTP is strictly single-use;
        and once the ceiling is hit the service refuses to issue or verify at all. Brute
        force is capped, not merely logged.
      </P>

      {/* ---------- encryption proxy ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        The PII encryption proxy — GDPR at the edge
      </h2>
      <P>
        Every message carries personal data — emails, phone numbers, names. Rather than
        trust every query to remember to encrypt, the service moves that decision into one
        place: an Express proxy that sits in front of Hasura. This is the architectural
        idea I&apos;m proudest of on this project.
      </P>
      <Reveal>
        <EncryptionProxyDiagram />
      </Reveal>
      <P>
        All GraphQL traffic is routed through <Code>/api/v1/graphql</Code> instead of hitting
        Hasura directly. The proxy parses the query, looks up which columns are sensitive in
        the <Code>crypto_table_mapping</Code> table, and encrypts those variables on the way
        in and decrypts them on the way back out. Postgres therefore stores only ciphertext,
        and plaintext exists only in the proxy&apos;s memory for the moment it&apos;s needed.
        A client that tries to bypass the layer by sending its own{" "}
        <Code>x-hasura-admin-secret</Code> is rejected with a 401 — the admin secret lives
        only inside the trusted boundary. It&apos;s field-level, config-driven encryption
        that no individual query author can forget to apply.
      </P>

      {/* ---------- deployment ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        How it ships — deployment, live
      </h2>
      <P>
        The service ships as a single ARM64 image that runs three roles: the API, the Hasura
        engine it proxies, and a scheduled shipment-tracking job.
      </P>
      <Reveal>
        <DeliveryDeployDiagram />
      </Reveal>

      <H3>Build once, boot into place</H3>
      <P>
        CodeBuild bakes an Amazon Linux ARM64 image with Node 20, PM2, nginx, the Telegraf
        agents, the cairo/pango libraries needed to render QR and barcode images, and the
        pre-built Vue console. It&apos;s pushed to ECR versioned and as <Code>latest</Code>,
        then CodeDeploy runs an ECS blue/green shift. Nothing environment-specific is baked
        in — <Code>update_secrets.py</Code> pulls the Postgres URL and Hasura admin secret
        from AWS Secrets Manager at boot, so the same image promotes cleanly across
        environments.
      </P>

      <H3>Two containers, one task</H3>
      <P>
        Each ECS task runs the delivery app (<Code>pm2-runtime app.js -i 2</Code>, two
        clustered workers) alongside a Hasura sidecar over shared Postgres, with an EFS
        volume mounted for attachment storage. Hasura&apos;s auth hook points back at{" "}
        <Code>/api/int/authorize</Code> in the app, so authorization for GraphQL and for the
        REST API is one decision, not two. The health check is deliberately broad — it curls{" "}
        <Code>/ping.html</Code>, <Code>/track/healthz</Code> and checks Telegraf is alive —
        so a task that can boot but not actually deliver is never marked healthy.
      </P>

      <H3>The shipment cron</H3>
      <P>
        Physical gift cards need tracking too. A separate cron task runs the shipment job on
        a schedule: it polls courier providers, records each shipment event, and the moment a
        parcel is marked delivered or returned it pushes an S2S notification back into the
        platform — closing the loop between a digital order and a physical object arriving at
        someone&apos;s door.
      </P>
    </section>
  );
}
