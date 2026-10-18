export type CaseStudy = {
  slug: string;
  eyebrow: string;
  title: string;
  oneLiner: string;
  /** <=160 chars, for <meta name="description"> — oneLiner is used for OG/on-page copy. */
  metaDescription: string;
  duration: string;
  role: string;
  clients?: string;
  liveLinks?: { label: string; href: string }[];
  stack: string[];
  problem: string;
  constraints: string[];
  architecture: string;
  hasDiagram?: boolean;
  decisions: { question: string; answer: string }[];
  outcome: string[];
  differently?: string;
  footnote?: string;
  /** Short label for menus and the project index ("Queue platform"). */
  shortTitle: string;
  /** Real, production-observed figures shown on the project card. Never simulated. */
  highlights: { value: string; label: string }[];
  /** Compact left-to-right system flow drawn on the project card. */
  flow: { label: string; sub: string }[];
};

const nda =
  "Details generalized to respect confidentiality: no internal names beyond what's public, figures kept to production-observed ranges. The architecture reasoning is mine to tell; the code is not.";

export const caseStudies: CaseStudy[] = [
  {
    slug: "b2b-queue-consumer",
    eyebrow: "Pine Labs · first major ownership",
    title: "Queue platform that activates millions of gift cards",
    oneLiner:
      "A B2B message-queue platform built and operated end-to-end for 18 months — 500+ TPS sustained, millions of messages a day, powering card processing, activation and scheduled notifications.",
    metaDescription:
      "B2B message-queue platform built solo: 500+ TPS, millions of messages a day, powering gift-card activation across 300+ brands on the Woohoo platform.",
    duration: "18 months · ongoing in production",
    role: "Sole owner — design, build, operate",
    clients: "300+ brands on the Woohoo / Qwikcilver platform — Amazon, Flipkart, SBI, HDFC, Axis, Zomato, Blinkit & more",
    liveLinks: [{ label: "woohoo.in", href: "https://www.woohoo.in/" }],
    stack: [
      "Node.js",
      "Express",
      "MongoDB",
      "Redis",
      "ActiveMQ (STOMP)",
      "Iron.io MQ",
      "Vue.js",
      "OpenTelemetry",
      "PM2",
      "Docker · nginx",
    ],
    problem:
      "Gift-card orders from enterprise clients arrive in bursts — festival campaigns, corporate payouts, bank promotions — and every message must be processed exactly once: a duplicate activates a card twice, a drop leaves a customer with a dead card. The platform needed to absorb spikes, guarantee processing, and give operations a way to see and fix any message's journey.",
    constraints: [
      "Team of one for the first 18 months — design, build, operate.",
      "Zero tolerance for lost or double-processed activations: this is money on plastic.",
      "Multi-tenant from day one: per-client queues, configs, instances and rate limits.",
      "Per-API-call MQ pricing (Iron.io) made cost grow linearly with success.",
    ],
    architecture:
      "Producers publish encrypted payloads to the broker layer — pluggable between Iron.io and self-managed ActiveMQ over STOMP. Consumer workers pull with exponential-backoff retries; exhausted messages land in dead-letter queues with full message-tracking history. A Vue ops console exposes queues, clients, instances, bulk uploads, and per-message tracing with replay. RBAC (users, roles, permissions, identity providers) gates every operation. MongoDB stores tracking and config; Redis handles rate limiting and hot state; OpenTelemetry + Telegraf feed metrics; Slack alerts on thresholds; PM2 supervises workers behind nginx in Docker.",
    hasDiagram: true,
    decisions: [
      {
        question: "Why migrate from Iron.io to self-managed ActiveMQ?",
        answer:
          "Cost curve. Per-API-call pricing meant our bill scaled with our success. At our volume, a self-managed broker crossed over — with headroom to grow at flat cost. The service was built with a pluggable MQ provider abstraction, so the migration was a config change per tenant, not a rewrite.",
      },
      {
        question: "How do you guarantee exactly-once card activation on an at-least-once queue?",
        answer:
          "Idempotency at the consumer: every message carries a tracked identity, processing is recorded in MongoDB before side effects are confirmed, and redeliveries short-circuit against that record. The message-tracking model doubles as the audit trail operations use to answer 'what happened to this order?'",
      },
      {
        question: "Why build an ops console instead of just logs?",
        answer:
          "Because at millions of messages a day, 'grep the logs' is not an operations strategy. The Vue console turned every support escalation from an engineering interrupt into a self-serve lookup — queue depth, message history, replay — with RBAC so clients' teams see only their own tenants.",
      },
      {
        question: "How does 500+ TPS stay stable under burst?",
        answer:
          "Horizontally scaled PM2 worker instances pull at their own pace — the queue absorbs the burst, consumers drain it. Redis-backed rate limits protect downstream card processors with slower ceilings than ours, and backoff keeps retries from amplifying an outage into a storm.",
      },
    ],
    outcome: [
      "500+ TPS sustained throughput in production",
      "Millions of messages processed daily — card processing, activation, scheduled notifications",
      "Powers card activation across the Woohoo / Qwikcilver platform — 300+ brands, ~9 of every 10 gift cards issued in India",
      "Broker migration cut messaging spend from per-call pricing to flat infrastructure cost",
      "Still the backbone of B2B order processing today",
    ],
    differently:
      "I'd introduce OpenTelemetry tracing from day one instead of retrofitting it, and I'd formalize the dead-letter replay runbook before the first production incident rather than after it.",
    footnote: nda,
    shortTitle: "B2B queue platform",
    highlights: [
      { value: "500+", label: "TPS sustained" },
      { value: "Millions", label: "messages / day" },
      { value: "18 mo", label: "solo ownership" },
    ],
    flow: [
      { label: "Producers", sub: "client services" },
      { label: "Broker", sub: "ActiveMQ" },
      { label: "Workers", sub: "retry + backoff" },
      { label: "Tracking", sub: "MongoDB" },
      { label: "Ops console", sub: "Vue · RBAC" },
    ],
  },
  {
    slug: "delivery",
    eyebrow: "Pine Labs · communications backbone",
    title: "One service, every message a customer ever receives",
    oneLiner:
      "The delivery microservice behind every email, SMS, WhatsApp and push notification on the Woohoo platform — OTP flows, template management, and the query optimization that keeps it fast.",
    metaDescription:
      "Delivery microservice behind every email, SMS, WhatsApp and push on Woohoo — OTP flows, templates, and query optimization.",
    duration: "~7 months",
    role: "Core contributor — templates, OTP, tracking, query optimization",
    clients: "Every customer message across the Woohoo platform — 300+ brands' orders, activations & OTPs on woohoo.in and partner storefronts",
    liveLinks: [{ label: "woohoo.in", href: "https://www.woohoo.in/" }],
    stack: [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Hasura GraphQL",
      "Redis",
      "Handlebars",
      "New Relic",
      "OpenTelemetry",
      "Docker",
    ],
    problem:
      "Every order, activation and OTP on the platform becomes a message — across four channels, dozens of providers and hundreds of templates. Marketing needs to change copy without deploys; engineering needs delivery status for every request; and OTPs must arrive in seconds, every time.",
    constraints: [
      "OTP latency is user-facing login latency — the hottest path on the platform.",
      "Templates change weekly; deploys must not be the bottleneck.",
      "Every message carries PII — encryption and masking are non-negotiable.",
    ],
    architecture:
      "Channel-agnostic send API in front of provider adapters for email, SMS, WhatsApp and push. Handlebars-based template management with versioning lives in PostgreSQL, fronted by Hasura GraphQL for structured access; Redis caches hot templates and rate state. Request tracking records the full lifecycle of every message — queued, sent, delivered, failed — with barcode/QR generation for card-bearing messages. New Relic and OpenTelemetry watch latency; crons handle retries, digests and scheduled sends; PII is encrypted at rest and masked in logs.",
    decisions: [
      {
        question: "What did query optimization actually mean here?",
        answer:
          "The tracking tables grow by every message ever sent — the hot queries (status lookups, template fetches, OTP validation) were scanning where they should seek. Tightening indexes to match the real access patterns and caching template renders in Redis took the frequent paths from table-scan latency to index-hit latency, which is the difference between an OTP that arrives while the user waits and one that doesn't.",
      },
      {
        question: "Why template management in the service instead of hardcoded content?",
        answer:
          "Because copy changes at marketing speed and code deploys at engineering speed. Versioned Handlebars templates with locale support let non-engineers ship copy changes safely — and let engineering trace exactly which template version any customer received.",
      },
    ],
    outcome: [
      "Every email, SMS and WhatsApp message on woohoo.in flows through this service",
      "OTP and transactional paths kept fast via targeted indexing and Redis caching",
      "Full request tracking: any message's journey answerable in one lookup",
    ],
    footnote: nda,
    shortTitle: "Delivery microservice",
    highlights: [
      { value: "4", label: "channels" },
      { value: "OTP", label: "hottest login path" },
      { value: "1 lookup", label: "per message journey" },
    ],
    flow: [
      { label: "Send API", sub: "channel-agnostic" },
      { label: "Templates", sub: "Handlebars" },
      { label: "Providers", sub: "email · SMS · WA" },
      { label: "Tracking", sub: "PostgreSQL" },
    ],
  },
  {
    slug: "woohoo-card",
    eyebrow: "Pine Labs · current focus, 2 years",
    title: "The Go service that owns a gift card's whole life",
    oneLiner:
      "The core of the gift-card management system: order processing, activation, shipping, wallet, PIN reset, block, cancel, reissue — in Go, behind HDFC, Axis, FairPrice and Woohoo storefronts.",
    metaDescription:
      "Go service owning the gift-card lifecycle: activation, shipping, wallet, PIN reset, reissue — behind HDFC, Axis, FairPrice & Woohoo.",
    duration: "2 years · ongoing",
    role: "Backend owner — order lifecycle & critical card operations",
    clients: "HDFC & Axis gift sites, FairPrice, and woohoo.in — a 300+ brand catalog",
    liveLinks: [{ label: "woohoo.in", href: "https://www.woohoo.in/" }],
    stack: [
      "Go 1.24",
      "chi",
      "GORM",
      "MySQL (read/write split)",
      "MongoDB",
      "Redis",
      "goroutine pools (ants)",
      "Iron MQ",
      "OpenTelemetry",
      "Swagger",
      "SFTP",
    ],
    problem:
      "A gift card is a small bearer instrument with a long life: ordered, activated with a content provider, shipped or delivered digitally, added to a wallet, sometimes PIN-reset, sometimes blocked, cancelled or reissued. Every transition touches money, multiple providers, and a customer who is often standing at a checkout. The service that owns this lifecycle is the most critical piece of the platform.",
    constraints: [
      "Card operations are irreversible — a wrong activation or double reissue is a financial event.",
      "Multiple content providers with different APIs, formats and failure modes behind one interface.",
      "Bank-grade clients (HDFC, Axis) with their own security and audit requirements.",
      "High-volume reads (balance, status) must not contend with writes — hence the read/write split.",
    ],
    architecture:
      "A Go service (chi router, GORM) drives the order state machine: process → activate → ship/reship → deliver, with side flows for wallet credit, PIN reset, block, cancel and reissue. MySQL holds transactional state behind a reader/writer split; MongoDB stores document-shaped provider payloads; Redis serves hot lookups. Concurrency runs on bounded goroutine pools (ants) — burst-friendly without exhausting downstream providers. Provider drivers isolate each content partner; SFTP handles bank file exchange; money math uses decimal types, never floats. OpenTelemetry traces requests end-to-end; Swagger documents the surface; crons reconcile long-running states; an admin UI exposes operations.",
    decisions: [
      {
        question: "Why Go for this service?",
        answer:
          "The workload is thousands of small, concurrent, latency-sensitive operations against external providers — Go's goroutines with a bounded pool (ants) model this naturally, and static typing plus explicit error handling suit code where a swallowed error is a financial incident.",
      },
      {
        question: "How do you make irreversible card operations safe?",
        answer:
          "State-machine discipline: every transition validates the current state, is recorded before provider side effects are confirmed, and reconciliation crons sweep for orders stuck between states. Block, cancel and reissue are modeled as explicit flows with audit trails, not ad-hoc updates.",
      },
      {
        question: "Why MySQL read/write splitting?",
        answer:
          "Balance checks and status lookups outnumber writes by orders of magnitude, and they spike with consumer traffic. Routing reads to replicas keeps checkout-time lookups fast without letting them contend with the order-processing write path.",
      },
    ],
    outcome: [
      "Core of the gift-card management system across HDFC, Axis, FairPrice and Woohoo storefronts",
      "Owns every critical card operation: activation, shipping, wallet, PIN reset, block, cancel, reissue",
      "Two years of continuous production ownership — my longest-running system",
    ],
    differently:
      "I'd push for provider-driver contract tests earlier — each content partner's undocumented quirks were discovered in production before the test harness caught up.",
    footnote: nda,
    shortTitle: "Gift-card core (Go)",
    highlights: [
      { value: "7", label: "card operations" },
      { value: "2 yrs", label: "in production" },
      { value: "R/W", label: "split MySQL" },
    ],
    flow: [
      { label: "Order API", sub: "Go · chi" },
      { label: "Monitors", sub: "state machine" },
      { label: "Workers", sub: "per-card jobs" },
      { label: "Providers", sub: "activation" },
      { label: "MySQL", sub: "R/W split" },
    ],
  },
  {
    slug: "smooth",
    eyebrow: "Client project · UAE",
    title: "Smooth – Payments, POS & Loyalty in One Platform",
    oneLiner:
      "A multi-tenant payments, ordering and membership platform for UAE restaurants: scan, order, track live, pay with Apple Pay / Google Pay, join a subscription plan — plus multicurrency payment links payable from anywhere. Owned end to end, from data model to checkout flow.",
    metaDescription:
      "Smooth: multi-tenant QR ordering, POS, loyalty, memberships and payments for UAE restaurants, owned end to end — Stripe, AFS, Apple Pay, Google Pay.",
    duration: "Feb 2026 — present · live in production",
    role: "Owned end-to-end — product, data model, API, two frontends, payments, deploy",
    liveLinks: [
      { label: "smoothpay.ai", href: "https://www.smoothpay.ai/" },
      { label: "merchant.smoothpay.ai", href: "https://merchant.smoothpay.ai/" },
      { label: "app.smoothpay.ai", href: "https://app.smoothpay.ai/" },
    ],
    stack: [
      "NestJS",
      "Prisma",
      "PostgreSQL",
      "Socket.IO",
      "Redis",
      "Stripe · AFS · Telr",
      "Apple Pay · Google Pay",
      "React + Vite",
      "Zustand",
      "Firebase push",
      "AWS S3",
    ],
    problem:
      "UAE restaurants needed app-free ordering and payment: customers scan a QR, browse the menu, order, and pay — no download, no cash handoff. Merchants needed live order boards, menu control, staff roles and a way to get paid by anyone, anywhere, in any currency.",
    constraints: [
      "Full ownership of the whole platform: data model, API, customer app, merchant dashboard, payments, infrastructure.",
      "Payment must work without an app — Apple Pay / Google Pay / card, straight from a link.",
      "Multi-tenant with RBAC from day one: admins, merchants, staff — each seeing only their own world.",
      "Trust is the product: feedback flows to Google reviews to build merchant visibility.",
    ],
    architecture:
      "A NestJS + Prisma API on PostgreSQL is the single backend for three surfaces. Customers scan a table QR into a Vite/React app — menu, cart, order, live status — no install. Merchants run a dashboard with live order boards over Socket.IO, menu and staff management, QR generation and analytics (Recharts). Payments run on Stripe: Apple Pay, Google Pay and cards via payment links, including multicurrency links that work from any country. JWT plus Google/Apple OAuth handle identity; role guards enforce tenant boundaries; Firebase delivers push; S3 stores assets; throttling, validation and Swagger round out the API surface.",
    decisions: [
      {
        question: "Why payment links instead of in-app payment collection?",
        answer:
          "Links remove every barrier: no app install, no account creation, and the same mechanism serves dine-in checkout and remote invoicing. Multicurrency support means a merchant can bill a customer in another country with the same link — one payment primitive covering both product flows.",
      },
      {
        question: "How does live order tracking work for both sides?",
        answer:
          "Socket.IO rooms per merchant and per order: the kitchen's board and the customer's status page subscribe to the same event stream, so state changes propagate to both in real time — with polling fallback where sockets can't connect.",
      },
      {
        question: "What did owning this end-to-end teach you?",
        answer:
          "Scope discipline. Every feature had to justify its own operational cost — which is why the platform leans on managed services (Stripe, Firebase, S3) for undifferentiated heavy lifting, and spends its complexity budget on the two things merchants actually feel: order flow and getting paid.",
      },
    ],
    outcome: [
      "Three applications live: marketing site, merchant dashboard, customer ordering app",
      "Full payment stack: Apple Pay, Google Pay, cards, multicurrency payment links",
      "Multi-tenant RBAC serving admins, merchants and staff on one API",
      "Merchant-to-customer memberships: free trials, monthly and annual plans, pause, upgrade and downgrade, renewed on a daily engine that never double-charges",
      "Google-reviews feedback loop driving merchant trust and visibility",
    ],
    shortTitle: "SmoothPay platform",
    highlights: [
      { value: "3", label: "payment rails" },
      { value: "4", label: "apps, one API" },
      { value: "101", label: "RBAC permissions" },
    ],
    flow: [
      { label: "QR scan", sub: "customer PWA" },
      { label: "Order", sub: "NestJS · Prisma" },
      { label: "Settle", sub: "idempotent" },
      { label: "Membership", sub: "renewal engine" },
      { label: "Merchant", sub: "live board" },
    ],
  },
];
