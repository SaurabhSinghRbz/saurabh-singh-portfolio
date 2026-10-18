import { MessageFlowDiagram, DeployFlowDiagram } from "@/components/queue/lazy";
import Reveal from "@/components/motion/Reveal";

/* ------------------------------------------------------------------ *
 * QueueDeepDive — b2b-queue-consumer only. Every claim below comes
 * from the actual source: consumer.js, backoff.js, the MQ provider
 * layer, postMessages route, Dockerfile, process_init.sh and the
 * CodeBuild/CodeDeploy specs.
 * ------------------------------------------------------------------ */

const FEATURES: { title: string; body: string }[] = [
  {
    title: "Pluggable broker layer",
    body: "Iron.io and ActiveMQ live behind one provider interface — post, reserve, touch, delete. The Iron.io → ActiveMQ migration was a config change per queue, not a rewrite.",
  },
  {
    title: "Idempotent push API",
    body: "Each queue can declare a uniqueIdentifier path. Duplicates are detected in one batched query and the original message-id is returned — a client retrying a push can never activate a card twice.",
  },
  {
    title: "Two-layer encryption",
    body: "Payloads are AES-256-encrypted by the app, then envelope-encrypted at the provider (KMS). Secure sub-payloads and per-message auth configs stay encrypted until the moment of delivery.",
  },
  {
    title: "Adaptive retry engine",
    body: "Exponential backoff (60 + n⁴s, capped), status-driven static windows (511–519 → (code−510) × 30min), and a custom_delay override the webhook can send back. Three retry vocabularies, one engine.",
  },
  {
    title: "Scheduled delivery",
    body: "Delayed messages ride AMQ_SCHEDULED_DELAY on the broker — festival campaigns are queued days ahead with zero cron jobs in the app.",
  },
  {
    title: "Per-message tracking & replay",
    body: "Every message writes a tracking trail in MongoDB: queued → delivered → retried, with payload snapshots. The Vue ops console can trace and replay any single message.",
  },
  {
    title: "Auth that heals itself",
    body: "OAuth tokens are cached per provider. A 401 from downstream drops the cached token and touches the message — the retry picks up a fresh token with no human involved.",
  },
  {
    title: "Blue/green aware routing",
    body: "A message flagged isGreenEnv is delivered to the green webhook with the green auth provider — the platform participates in downstream teams' blue/green cutovers.",
  },
  {
    title: "Multicast fan-out",
    body: "VirtualTopic queues fan one event out to many consumers, each with its own retry state — one order event, many independent subscribers.",
  },
  {
    title: "RBAC end to end",
    body: "Users, roles, permissions and pluggable identity providers gate every API and console action. Client services get scoped credentials per queue.",
  },
  {
    title: "Bulk uploads",
    body: "CSV uploads are validated, chunked and streamed onto queues from the console — the operations path for lakh-scale card batches.",
  },
  {
    title: "Observability built in",
    body: "Heartbeat and per-queue message metrics flow through Telegraf into InfluxDB; failures alert Slack with context. A silent worker is treated as an incident, not a mystery.",
  },
];

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-10 font-display text-xl text-ink">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-ink/90">{children}</p>;
}

export default function QueueDeepDive() {
  return (
    <section aria-label="Inside the queue platform">
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

      {/* ---------- message lifecycle ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        The message lifecycle — watch it run
      </h2>

      <P>
        Below is the loop the platform runs millions of times a day, replayed live. Three
        stories in one take: a clean delivery, a delivery that fails and recovers, and a
        delivery that exhausts its retries and gets handed to a human.
      </P>

      <Reveal>
        <MessageFlowDiagram />
      </Reveal>

      <H3>How a push works</H3>
      <P>
        A producer calls <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-accent">POST /queues/:queueName/messages</code>.
        The API looks the queue up in MongoDB — provider, type, batching, idempotency
        config all live there, not in code. If the queue declares a{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">uniqueIdentifier</code>, every
        message body is checked against the tracking store in a single batched query;
        duplicates are never re-queued — the caller just gets the original message-id
        back. Fresh messages are field-encrypted (AES-256), envelope-encrypted at the
        provider layer, then published with{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">persistent: true</code> and a
        broker receipt awaited — the API only confirms once the broker has the message
        durably. Tracking rows flip to <em>QUEUED</em> with their broker ids in one bulk
        write.
      </P>

      <H3>How consumer.js listens</H3>
      <P>
        Each queue gets its own PM2-supervised worker running an{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">async.forever</code> poll loop.
        Every cycle writes a heartbeat metric first — the fleet's liveness is a queryable
        time series, not an assumption. On ActiveMQ the worker subscribes with{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">ack: client</code> and{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">prefetch 1</code>: the broker
        hands over exactly one message and keeps it reserved until the worker explicitly
        acks. If nothing arrives in five seconds the worker unsubscribes and backs off —
        an idle queue costs almost nothing.
      </P>
      <P>
        The delivery itself: decrypt, template the webhook URL, attach a cached OAuth
        token and trace headers, POST with a 60-second timeout. Then the status code
        decides everything — the table above is the exact switch in{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">consumer.js</code>.
      </P>

      <H3>Touch &amp; release — retries without loss</H3>
      <P>
        ActiveMQ has no native &ldquo;retry later&rdquo;, so the platform builds one:{" "}
        <strong className="text-ink">touch</strong> acks the failed delivery and republishes the
        same body under the same correlation-id, with{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">reserved_count + 1</code> and an{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">AMQ_SCHEDULED_DELAY</code>{" "}
        computed by the backoff engine. The message is never in limbo: it is either
        reserved by a worker, scheduled on the broker, or deleted after a definitive
        outcome. When the retry budget runs out, the worker deletes the message{" "}
        <em>and</em> fires a Slack alert carrying the message&apos;s own{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">maxRetryAlert</code> context — the
        queue stays healthy, and nothing disappears silently.
      </P>

      {/* ---------- deployment ---------- */}
      <h2 className="mt-16 mb-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        How it ships — deployment, live
      </h2>

      <P>
        The platform deploys as a single container image that carries the API, the ops
        console, and the entire worker fleet — and decides <em>at boot</em> how many
        workers to run, by reading the queue registry from MongoDB.
      </P>

      <Reveal>
        <DeployFlowDiagram />
      </Reveal>

      <H3>Build once, configure at the edge</H3>
      <P>
        A push to Bitbucket triggers AWS CodeBuild, which bakes an ARM64 Amazon Linux
        image: Node 22, PM2, nginx, Telegraf agents and the pre-built Vue console.
        The image is tagged with the environment, instance and version, pushed to ECR
        twice (versioned + latest) — rollback is a tag, not a rebuild. Nothing
        environment-specific is baked in: at boot,{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">update_secrets.py</code> pulls
        credentials from AWS Secrets Manager, so the same image is promotable from
        staging to production untouched.
      </P>

      <H3>Blue/green on ECS — zero-downtime by construction</H3>
      <P>
        CodeDeploy drives an ECS blue/green shift: the GREEN task set boots next to the
        live BLUE one, health checks must pass, then traffic flips on port 80. During the
        overlap both consumers may poll the same queues — and that&apos;s safe by design,
        because the broker&apos;s reserve/ack protocol already guarantees a message is
        processed by exactly one worker. The deployment strategy leans on the same
        invariant the runtime does.
      </P>

      <H3>The self-assembling worker fleet</H3>
      <P>
        The most consequential deployment decision is the last boot step:{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">migratecli up process</code>{" "}
        queries MongoDB for active queues and writes{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">process.json</code> — one PM2
        entry per queue, each with its own retry policy, webhook and worker count
        injected as environment config. Then{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">pm2-runtime</code> becomes PID 1.
        Adding a client queue is a row in the console plus a redeploy — no code change,
        no new service. One crashed worker restarts alone under PM2 while the rest of
        the fleet keeps consuming; a worker that stops heartbeating shows up in InfluxDB
        and pages before a client notices.
      </P>
    </section>
  );
}
