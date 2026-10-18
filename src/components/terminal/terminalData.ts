/**
 * terminalData.ts
 * ─────────────────────────────────────────────────────────
 * Central data layer for the immersive terminal portfolio.
 * Every piece of content, theme definition, witty error
 * message, and boot line lives here. Portfolio content is
 * pulled from site.ts and case-studies.ts — nothing is
 * duplicated.
 * ─────────────────────────────────────────────────────────
 */

import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";

/* ================================================================== *
 * OUTPUT LINE TYPE
 * ================================================================== */

export type Tone =
  | "cmd"
  | "ok"
  | "info"
  | "muted"
  | "accent"
  | "error"
  | "heading"
  | "success"
  | "warning"
  | "ascii";

export type AnimStyle = "type" | "fade" | "counter" | "instant";

export type OutputLine = {
  text: string;
  tone: Tone;
  delay?: number;
  animate?: AnimStyle;
};

/* ================================================================== *
 * TONE → CSS COLOR MAPPING
 * Uses terminal-scoped --term-* variables so the terminal always
 * renders in its own dark palette regardless of the site theme.
 * ================================================================== */

export const toneColor: Record<Tone, string> = {
  cmd: "var(--term-ink)",
  ok: "var(--term-good)",
  info: "var(--term-ink)",
  muted: "var(--term-muted)",
  accent: "var(--term-accent)",
  error: "var(--term-bad)",
  heading: "var(--term-accent)",
  success: "var(--term-good)",
  warning: "var(--term-accent)",
  ascii: "var(--term-accent)",
};

export const toneExtra: Partial<Record<Tone, string>> = {
  info: "opacity: 0.85;",
  heading: "font-weight: 700;",
  success: "font-weight: 600;",
  ascii: "opacity: 0.8;",
};

/* ================================================================== *
 * BOOT SEQUENCE
 * ================================================================== */

const BOOT_LINES_POOL: string[] = [
  "Initializing SaurabhOS v2.0...",
  "Loading distributed systems kernel...",
  "Mounting payment engine modules...",
  "Starting event processor daemons...",
  "Connecting microservice mesh...",
  "Loading queue consumer workers...",
  "Initializing observability pipeline...",
  "Mounting PostgreSQL read replicas...",
  "Starting Redis cluster handshake...",
  "Loading Go runtime (goroutine pools)...",
  "Verifying gift-card lifecycle state machine...",
  "Calibrating rate limiter (500+ TPS)...",
  "Syncing ActiveMQ broker connections...",
  "Loading template engine (Handlebars)...",
  "Initializing Socket.IO event bus...",
  "Mounting Stripe payment adapters...",
  "Starting notification dispatcher...",
  "Loading RBAC policy engine...",
  "Connecting OpenTelemetry exporters...",
  "Verifying idempotency guarantees...",
  "Warming Redis hot-path caches...",
  "Loading portfolio runtime environment...",
];

export function getBootSequence(): OutputLine[] {
  // Pick 8-10 random lines from the pool
  const shuffled = [...BOOT_LINES_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 8 + Math.floor(Math.random() * 3));

  const lines: OutputLine[] = [
    { text: "╔══════════════════════════════════════════════╗", tone: "accent", delay: 0, animate: "instant" },
    { text: "║     SaurabhOS v2.0 — Boot Sequence           ║", tone: "accent", delay: 100, animate: "instant" },
    { text: "╚══════════════════════════════════════════════╝", tone: "accent", delay: 200, animate: "instant" },
    { text: "", tone: "muted", delay: 300 },
  ];

  selected.forEach((line, i) => {
    lines.push({
      text: `  ${line.padEnd(48, " ")} [OK]`,
      tone: "ok",
      delay: 400 + i * 280,
      animate: "type",
    });
  });

  const tailBase = 400 + selected.length * 280;

  lines.push(
    { text: "", tone: "muted", delay: tailBase + 200 },
    { text: "  All systems nominal. Integrity: 100%", tone: "success", delay: tailBase + 400, animate: "type" },
    { text: "", tone: "muted", delay: tailBase + 600 },
    { text: "  Welcome to SaurabhOS v2.0", tone: "heading", delay: tailBase + 800, animate: "type" },
    { text: "  Type 'help' to begin. Try commands like: about, skills, projects", tone: "muted", delay: tailBase + 1000, animate: "type" },
    { text: "", tone: "muted", delay: tailBase + 1150 },
  );

  // One-time command hints — printed once as part of the boot log, like a
  // real terminal's MOTD. Not a persistent UI chrome; `clear` wipes them
  // along with everything else, and they never reappear afterward.
  HINT_GROUPS.forEach((group, i) => {
    lines.push({
      text: `  ${group.label.padEnd(12, " ")} ${group.commands.join(" · ")}`,
      tone: "muted",
      delay: tailBase + 1300 + i * 150,
      animate: "type",
    });
  });

  return lines;
}

/* ================================================================== *
 * COMMAND HINTS — printed once at boot, as plain scrollback text
 * ================================================================== */

export const HINT_GROUPS = [
  {
    label: "START HERE",
    commands: ["help", "about", "skills", "experience", "projects"],
  },
  {
    label: "GO DEEPER",
    commands: ["architecture", "status", "show metrics", "recruiter", "project smoothpay"],
  },
  {
    label: "FOR FUN",
    commands: ["coffee", "fortune", "unlock", "neofetch"],
  },
] as const;

/* ================================================================== *
 * COMMAND CHIPS — Clickable suggestions shown after boot
 * ================================================================== */

export const COMMAND_CHIPS = [
  { label: "About", cmd: "about" },
  { label: "Projects", cmd: "projects" },
  { label: "Skills", cmd: "skills" },
  { label: "Experience", cmd: "experience" },
  { label: "Resume", cmd: "resume" },
  { label: "Contact", cmd: "contact" },
  { label: "Architecture", cmd: "architecture" },
  { label: "Status", cmd: "status" },
  { label: "Metrics", cmd: "show metrics" },
  { label: "SmoothPay", cmd: "project smoothpay" },
] as const;

/* ================================================================== *
 * ALL KNOWN COMMANDS (for autocomplete)
 * ================================================================== */

export const ALL_COMMANDS: string[] = [
  // Basic
  "help", "about", "skills", "experience", "projects", "contact",
  "resume", "education", "clear", "theme",
  // Theme variants
  "theme production", "theme matrix", "theme cyberpunk",
  "theme vscode", "theme terminal", "theme retro",
  // Advanced
  "architecture", "microservices", "payments", "system-design",
  "backend", "frontend", "cloud", "devops",
  // Engineering
  "show stack", "show metrics", "show timeline", "show achievements",
  "show tech-radar", "show strengths",
  // Projects
  "project smoothpay", "project queue-platform",
  "project gift-card-engine", "project delivery",
  // System
  "status", "search", "history", "whoami",
  // Personas
  "recruiter", "cto", "architect",
  // Fun
  "coffee", "sudo hire saurabh", "sudo make me rich",
  "fortune", "motivate", "uptime", "fun-fact", "quote",
  // Easter eggs
  "matrix", "hack", "42", "whoami --secret", "unlock",
  // Misc
  "ls", "pwd", "cat", "sudo", "neofetch",
];

/* ================================================================== *
 * SYSTEM STATUS — Fake but believable diagnostics
 * ================================================================== */

export function getSystemStatus(): OutputLine[] {
  return [
    { text: "┌─────────────────────────────────────────────┐", tone: "muted" },
    { text: "│         SYSTEM HEALTH — LIVE STATUS          │", tone: "heading" },
    { text: "├─────────────────────────────────────────────┤", tone: "muted" },
    { text: "│                                             │", tone: "muted" },
    { text: "│  API Gateway .............. ● HEALTHY       │", tone: "ok", delay: 100 },
    { text: "│  Payment Engine ........... ● HEALTHY       │", tone: "ok", delay: 200 },
    { text: "│  Queue Consumer ........... ● HEALTHY       │", tone: "ok", delay: 300 },
    { text: "│  Redis Cache .............. ● HEALTHY       │", tone: "ok", delay: 400 },
    { text: "│  PostgreSQL Primary ....... ● HEALTHY       │", tone: "ok", delay: 500 },
    { text: "│  PostgreSQL Replica ....... ● HEALTHY       │", tone: "ok", delay: 600 },
    { text: "│  Notification Service ..... ● HEALTHY       │", tone: "ok", delay: 700 },
    { text: "│  ActiveMQ Broker .......... ● HEALTHY       │", tone: "ok", delay: 800 },
    { text: "│  Socket.IO Gateway ....... ● HEALTHY        │", tone: "ok", delay: 900 },
    { text: "│                                             │", tone: "muted" },
    { text: "│  System Integrity: 100%                     │", tone: "success", delay: 1100 },
    { text: "│  Uptime: 99.99%                             │", tone: "success", delay: 1200 },
    { text: "│  Active Connections: 2,847                  │", tone: "info", delay: 1300 },
    { text: "│  Messages Today: 3.2M                      │", tone: "info", delay: 1400 },
    { text: "│                                             │", tone: "muted" },
    { text: "└─────────────────────────────────────────────┘", tone: "muted" },
  ];
}

/* ================================================================== *
 * HELP OUTPUT
 * ================================================================== */

export function getHelpOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "╔══════════════════════════════════════════════╗", tone: "accent" },
    { text: "║         SAURABHOS v2.0 — COMMAND REFERENCE   ║", tone: "heading" },
    { text: "╚══════════════════════════════════════════════╝", tone: "accent" },
    { text: "", tone: "muted" },
    { text: "  BASICS", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  help              Show this reference", tone: "info" },
    { text: "  about             Who is Saurabh Singh", tone: "info" },
    { text: "  skills            Tech stack breakdown", tone: "info" },
    { text: "  experience        Career timeline", tone: "info" },
    { text: "  projects          Production systems & case studies", tone: "info" },
    { text: "  education         Academic background", tone: "info" },
    { text: "  contact           How to reach me", tone: "info" },
    { text: "  resume            View / download résumé", tone: "info" },
    { text: "  clear             Wipe the screen", tone: "info" },
    { text: "  theme [name]      Switch theme", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ENGINEERING", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  architecture      System design philosophy", tone: "info" },
    { text: "  microservices     Microservice patterns I use", tone: "info" },
    { text: "  payments          Payment system expertise", tone: "info" },
    { text: "  system-design     Design principles & patterns", tone: "info" },
    { text: "  backend           Backend technologies deep-dive", tone: "info" },
    { text: "  frontend          Frontend capabilities", tone: "info" },
    { text: "  cloud             Cloud & infrastructure", tone: "info" },
    { text: "  devops            DevOps & observability", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  SHOW COMMANDS", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  show stack        Full technology stack", tone: "info" },
    { text: "  show metrics      Key production numbers", tone: "info" },
    { text: "  show timeline     Career progression", tone: "info" },
    { text: "  show achievements Production milestones", tone: "info" },
    { text: "  show tech-radar   Technology proficiency radar", tone: "info" },
    { text: "  show strengths    Core engineering strengths", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  PROJECTS", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  project smoothpay       SmoothPay payments platform", tone: "info" },
    { text: "  project queue-platform  B2B queue consumer", tone: "info" },
    { text: "  project gift-card-engine  Go gift-card service", tone: "info" },
    { text: "  project delivery        Notification microservice", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  PERSONAS", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  recruiter         Quick overview for hiring managers", tone: "info" },
    { text: "  cto               Technical leadership summary", tone: "info" },
    { text: "  architect         System architecture deep-dive", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  SYSTEM", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  status            Live system health check", tone: "info" },
    { text: "  search <query>    Search all portfolio content", tone: "info" },
    { text: "  history           Command history", tone: "info" },
    { text: "  whoami            Current session info", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  FUN", tone: "heading" },
    { text: "  ─────────────────────────────────────────", tone: "muted" },
    { text: "  coffee            Essential fuel", tone: "info" },
    { text: "  motivate          Need inspiration?", tone: "info" },
    { text: "  fortune           Dev wisdom", tone: "info" },
    { text: "  ...and a few hidden ones. Explore.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * ABOUT
 * ================================================================== */

export function getAboutOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: `  ┌─ ${site.name}`, tone: "heading" },
    { text: `  │  ${site.role} · Pine Labs (Qwikcilver · Woohoo)`, tone: "info" },
    { text: `  │  ${site.location}`, tone: "muted" },
    { text: "  │", tone: "muted" },
    ...site.about.map((p) => ({
      text: `  │  ${p}`,
      tone: "info" as Tone,
    })),
    { text: "  │", tone: "muted" },
    { text: `  │  Status: ${site.availability}`, tone: "ok" },
    { text: `  └─ "${site.mission}"`, tone: "accent" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * SKILLS
 * ================================================================== */

export function getSkillsOutput(): OutputLine[] {
  const lines: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: "  ╔══ TECHNICAL STACK ══╗", tone: "heading" },
    { text: "", tone: "muted" },
  ];

  site.skills.forEach((s) => {
    lines.push(
      { text: `  ▸ ${s.group.toUpperCase()}`, tone: "accent" },
      { text: `    ${s.items.join(" · ")}`, tone: "info" },
      { text: "", tone: "muted" },
    );
  });

  return lines;
}

/* ================================================================== *
 * EXPERIENCE
 * ================================================================== */

export function getExperienceOutput(): OutputLine[] {
  const lines: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: "  ╔══ CAREER TIMELINE ══╗", tone: "heading" },
    { text: "", tone: "muted" },
  ];

  site.experience.forEach((e, i) => {
    lines.push(
      { text: `  ┌─ ${e.role}`, tone: "heading" },
      { text: `  │  ${e.org}`, tone: "accent" },
      { text: `  │  ${e.period}`, tone: "muted" },
      { text: "  │", tone: "muted" },
    );
    e.points.forEach((p) => {
      lines.push({ text: `  │  • ${p}`, tone: "info" });
    });
    lines.push(
      { text: i < site.experience.length - 1 ? "  └────────" : "  └─ end", tone: "muted" },
      { text: "", tone: "muted" },
    );
  });

  return lines;
}

/* ================================================================== *
 * PROJECTS LIST
 * ================================================================== */

export function getProjectsOutput(): OutputLine[] {
  const lines: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: "  ╔══ PRODUCTION SYSTEMS ══╗", tone: "heading" },
    { text: "", tone: "muted" },
  ];

  caseStudies.forEach((c) => {
    lines.push(
      { text: `  ▸ ${c.title}`, tone: "accent" },
      { text: `    ${c.oneLiner}`, tone: "info" },
      { text: `    → project ${c.slug === "b2b-queue-consumer" ? "queue-platform" : c.slug === "woohoo-card" ? "gift-card-engine" : c.slug === "smooth" ? "smoothpay" : c.slug}`, tone: "muted" },
      { text: "", tone: "muted" },
    );
  });

  return lines;
}

/* ================================================================== *
 * SINGLE PROJECT DETAIL
 * ================================================================== */

const PROJECT_SLUG_MAP: Record<string, string> = {
  smoothpay: "smooth",
  smooth: "smooth",
  "queue-platform": "b2b-queue-consumer",
  "gift-card-engine": "woohoo-card",
  delivery: "delivery",
};

export function getProjectDetail(projectName: string): OutputLine[] | null {
  const slug = PROJECT_SLUG_MAP[projectName];
  if (!slug) return null;

  const c = caseStudies.find((cs) => cs.slug === slug);
  if (!c) return null;

  const lines: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: "  ╔══════════════════════════════════════════════╗", tone: "accent" },
    { text: `  ║  SYSTEM: ${c.title.toUpperCase().slice(0, 38).padEnd(38)}║`, tone: "heading" },
    { text: "  ╚══════════════════════════════════════════════╝", tone: "accent" },
    { text: "", tone: "muted" },
    { text: `  Status:     PRODUCTION`, tone: "success", delay: 200 },
    { text: `  Duration:   ${c.duration}`, tone: "info", delay: 300 },
    { text: `  Role:       ${c.role}`, tone: "info", delay: 400 },
  ];

  if (c.clients) {
    lines.push({ text: `  Clients:    ${c.clients}`, tone: "info", delay: 500 });
  }

  lines.push(
    { text: "", tone: "muted" },
    { text: "  ▸ TECH STACK", tone: "heading", delay: 600 },
    { text: `    ${c.stack.join(" · ")}`, tone: "accent", delay: 700 },
    { text: "", tone: "muted" },
    { text: "  ▸ THE PROBLEM", tone: "heading", delay: 800 },
    { text: `    ${c.problem}`, tone: "info", delay: 900 },
    { text: "", tone: "muted" },
    { text: "  ▸ ARCHITECTURE", tone: "heading", delay: 1000 },
    { text: `    ${c.architecture}`, tone: "info", delay: 1100 },
    { text: "", tone: "muted" },
    { text: "  ▸ KEY DECISIONS", tone: "heading", delay: 1200 },
  );

  c.decisions.forEach((d, i) => {
    lines.push(
      { text: `    Q: ${d.question}`, tone: "accent", delay: 1300 + i * 200 },
      { text: `    A: ${d.answer}`, tone: "info", delay: 1400 + i * 200 },
      { text: "", tone: "muted" },
    );
  });

  lines.push(
    { text: "  ▸ OUTCOMES", tone: "heading", delay: 1300 + c.decisions.length * 200 + 100 },
  );

  c.outcome.forEach((o, i) => {
    lines.push({
      text: `    ✓ ${o}`,
      tone: "success",
      delay: 1300 + c.decisions.length * 200 + 200 + i * 100,
    });
  });

  if (c.liveLinks?.length) {
    lines.push(
      { text: "", tone: "muted" },
      { text: "  ▸ LIVE LINKS", tone: "heading" },
    );
    c.liveLinks.forEach((l) => {
      lines.push({ text: `    → ${l.label}: ${l.href}`, tone: "accent" });
    });
  }

  lines.push({ text: "", tone: "muted" });

  return lines;
}

/* ================================================================== *
 * CONTACT
 * ================================================================== */

export function getContactOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ┌─ CONTACT", tone: "heading" },
    { text: "  │", tone: "muted" },
    { text: `  │  Email      ${site.email}`, tone: "info" },
    { text: `  │  GitHub     ${site.github}`, tone: "info" },
    { text: `  │  LinkedIn   ${site.linkedin}`, tone: "info" },
    { text: "  │", tone: "muted" },
    { text: `  │  ${site.contact.body}`, tone: "muted" },
    { text: `  └─ "${site.contact.heading}"`, tone: "accent" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * EDUCATION
 * ================================================================== */

export function getEducationOutput(): OutputLine[] {
  const lines: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: "  ╔══ EDUCATION ══╗", tone: "heading" },
    { text: "", tone: "muted" },
  ];

  site.education.forEach((e) => {
    lines.push(
      { text: `  ▸ ${e.year}`, tone: "accent" },
      { text: `    ${e.title}, ${e.org}`, tone: "info" },
      { text: `    ${e.note}`, tone: "muted" },
      { text: "", tone: "muted" },
    );
  });

  return lines;
}

/* ================================================================== *
 * ARCHITECTURE COMMAND — ASCII DIAGRAM
 * ================================================================== */

export function getArchitectureOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ SYSTEM ARCHITECTURE PHILOSOPHY ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  I design systems that are:", tone: "info" },
    { text: "  • Event-driven — decouple producers from consumers", tone: "info" },
    { text: "  • Idempotent — safe to retry, safe to replay", tone: "info" },
    { text: "  • Observable — if it moves, it emits a trace", tone: "info" },
    { text: "  • Cost-conscious — infrastructure cost is a feature", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ┌────────────────── ARCHITECTURE ──────────────────┐", tone: "ascii" },
    { text: "  │                                                  │", tone: "ascii" },
    { text: "  │   ┌─────────┐    ┌──────────┐    ┌──────────┐   │", tone: "ascii" },
    { text: "  │   │ Client  │───▶│ API GW   │───▶│ Auth/RBAC│   │", tone: "ascii" },
    { text: "  │   │ Apps    │    │ (chi/Exp)│    │ (JWT)    │   │", tone: "ascii" },
    { text: "  │   └─────────┘    └────┬─────┘    └──────────┘   │", tone: "ascii" },
    { text: "  │                       │                          │", tone: "ascii" },
    { text: "  │              ┌────────┴────────┐                 │", tone: "ascii" },
    { text: "  │              ▼                 ▼                 │", tone: "ascii" },
    { text: "  │   ┌──────────────┐   ┌──────────────┐           │", tone: "ascii" },
    { text: "  │   │   Service    │   │  Message     │           │", tone: "ascii" },
    { text: "  │   │   Layer      │   │  Queue       │           │", tone: "ascii" },
    { text: "  │   │  (Go/Node)  │   │ (ActiveMQ)  │           │", tone: "ascii" },
    { text: "  │   └──────┬───────┘   └──────┬───────┘           │", tone: "ascii" },
    { text: "  │          │                  │                    │", tone: "ascii" },
    { text: "  │   ┌──────┴───────┐   ┌──────┴───────┐           │", tone: "ascii" },
    { text: "  │   │   Database   │   │  Workers     │           │", tone: "ascii" },
    { text: "  │   │  (PG/MySQL) │   │ (Consumers) │           │", tone: "ascii" },
    { text: "  │   └──────┬───────┘   └──────────────┘           │", tone: "ascii" },
    { text: "  │          │                                       │", tone: "ascii" },
    { text: "  │   ┌──────┴───────┐                               │", tone: "ascii" },
    { text: "  │   │ Redis Cache  │──── OpenTelemetry ──── Alerts │", tone: "ascii" },
    { text: "  │   └──────────────┘                               │", tone: "ascii" },
    { text: "  │                                                  │", tone: "ascii" },
    { text: "  └──────────────────────────────────────────────────┘", tone: "ascii" },
    { text: "", tone: "muted" },
    { text: "  Patterns I've applied in production:", tone: "info" },
    { text: "  • CQRS with read/write split (MySQL replicas)", tone: "info" },
    { text: "  • Event sourcing via message queues", tone: "info" },
    { text: "  • Dead-letter queues with replay capability", tone: "info" },
    { text: "  • Circuit breakers for external provider calls", tone: "info" },
    { text: "  • Bounded goroutine pools for concurrency control", tone: "info" },
    { text: "  • Provider adapter pattern for swappable integrations", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * MICROSERVICES
 * ================================================================== */

export function getMicroservicesOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ MICROSERVICES ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  Services I've designed & operated:", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ B2B Queue Consumer    End-to-end ownership, 18 months", tone: "accent" },
    { text: "    Node.js · MongoDB · Redis · ActiveMQ", tone: "info" },
    { text: "    500+ TPS · millions of msgs/day", tone: "ok" },
    { text: "", tone: "muted" },
    { text: "  ▸ Gift-Card Lifecycle   Go service, 2 years", tone: "accent" },
    { text: "    Go · MySQL (R/W split) · Redis · goroutine pools", tone: "info" },
    { text: "    HDFC · Axis · FairPrice · Woohoo — a 300+ brand catalog", tone: "ok" },
    { text: "", tone: "muted" },
    { text: "  ▸ Delivery Service      Notification backbone", tone: "accent" },
    { text: "    Node.js · PostgreSQL · Hasura · Redis", tone: "info" },
    { text: "    Email · SMS · WhatsApp · Push", tone: "ok" },
    { text: "", tone: "muted" },
    { text: "  ▸ SmoothPay Platform    Owned end to end, live in UAE", tone: "accent" },
    { text: "    NestJS · PostgreSQL · Socket.IO · Stripe", tone: "info" },
    { text: "    3 apps · Apple Pay · Google Pay", tone: "ok" },
    { text: "", tone: "muted" },
    { text: "  Principles:", tone: "heading" },
    { text: "  • Each service owns its data store", tone: "info" },
    { text: "  • Communicate via events, not shared state", tone: "info" },
    { text: "  • Every service must be independently deployable", tone: "info" },
    { text: "  • If you build it, you operate it", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * PAYMENTS
 * ================================================================== */

export function getPaymentsOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ PAYMENT SYSTEMS EXPERTISE ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ GIFT CARD PAYMENTS", tone: "accent" },
    { text: "    Card activation, wallet credit, PIN reset", tone: "info" },
    { text: "    Block, cancel, reissue — all irreversible financial ops", tone: "info" },
    { text: "    Idempotency guarantees on every transaction", tone: "info" },
    { text: "    State machine discipline for order lifecycle", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ ONLINE PAYMENTS (SMOOTHPAY)", tone: "accent" },
    { text: "    Stripe integration — cards, Apple Pay, Google Pay", tone: "info" },
    { text: "    Multicurrency payment links (cross-border)", tone: "info" },
    { text: "    Webhook-driven payment confirmation", tone: "info" },
    { text: "    PCI-compliant token handling", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ SECURITY", tone: "accent" },
    { text: "    KMS encryption for sensitive data", tone: "info" },
    { text: "    PII masking in logs", tone: "info" },
    { text: "    JWT/JWKS authentication", tone: "info" },
    { text: "    RBAC with per-tenant isolation", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  Money math: decimal types, never floats.", tone: "warning" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * SYSTEM DESIGN
 * ================================================================== */

export function getSystemDesignOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ SYSTEM DESIGN PRINCIPLES ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    ...site.principles.map((p) => [
      { text: `  ▸ ${p.title}`, tone: "accent" as Tone },
      { text: `    ${p.body}`, tone: "info" as Tone },
      { text: "", tone: "muted" as Tone },
    ]).flat(),
    { text: "  Design patterns I reach for:", tone: "heading" },
    { text: "  • Event-driven architecture for decoupling", tone: "info" },
    { text: "  • CQRS for read-heavy workloads", tone: "info" },
    { text: "  • Saga pattern for distributed transactions", tone: "info" },
    { text: "  • Circuit breaker for external dependencies", tone: "info" },
    { text: "  • Bulkhead isolation for failure containment", tone: "info" },
    { text: "  • Idempotency keys for safe retries", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * BACKEND / FRONTEND / CLOUD / DEVOPS
 * ================================================================== */

export function getBackendOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ BACKEND DEEP-DIVE ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ LANGUAGES", tone: "accent" },
    { text: "    Go — production services, goroutine pools, chi/GORM", tone: "info" },
    { text: "    TypeScript/Node.js — APIs, queue consumers, NestJS", tone: "info" },
    { text: "    SQL — PostgreSQL, MySQL (R/W split)", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ FRAMEWORKS", tone: "accent" },
    { text: "    Express · NestJS · chi (Go) · Prisma · GORM", tone: "info" },
    { text: "    Hasura GraphQL · Socket.IO · Handlebars", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ DATABASES", tone: "accent" },
    { text: "    PostgreSQL — primary OLTP, Prisma ORM", tone: "info" },
    { text: "    MySQL — read/write split, GORM", tone: "info" },
    { text: "    MongoDB — document store, tracking data", tone: "info" },
    { text: "    Redis — caching, rate limiting, pub/sub", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ MESSAGE QUEUES", tone: "accent" },
    { text: "    ActiveMQ (STOMP) · Iron.io MQ · Webhooks", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

export function getFrontendOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ FRONTEND CAPABILITIES ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ FRAMEWORKS", tone: "accent" },
    { text: "    React · Next.js · Vue.js · Vite", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ STATE MANAGEMENT", tone: "accent" },
    { text: "    Zustand · Redux Toolkit · React Context", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ STYLING", tone: "accent" },
    { text: "    Tailwind CSS · Framer Motion · CSS Modules", tone: "info" },
    { text: "    Responsive design · Glassmorphism · Micro-animations", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ REAL-TIME", tone: "accent" },
    { text: "    Socket.IO for live order tracking", tone: "info" },
    { text: "    Optimistic UI updates", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  This terminal is itself a React component.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

export function getCloudOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ CLOUD & INFRASTRUCTURE ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ AWS", tone: "accent" },
    { text: "    S3 · ECR · EC2 · CloudWatch", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ GCP", tone: "accent" },
    { text: "    Cloud Functions · Cloud Storage · Firebase", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ CONTAINERIZATION", tone: "accent" },
    { text: "    Docker · nginx · PM2 process management", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ CI/CD", tone: "accent" },
    { text: "    Bitbucket Pipelines · automated deployments", tone: "info" },
    { text: "    SonarQube for code quality gates", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

export function getDevopsOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ DEVOPS & OBSERVABILITY ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ MONITORING", tone: "accent" },
    { text: "    OpenTelemetry — distributed tracing", tone: "info" },
    { text: "    New Relic — APM and dashboards", tone: "info" },
    { text: "    Telegraf — metrics collection", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ ALERTING", tone: "accent" },
    { text: "    Slack alerts on threshold breaches", tone: "info" },
    { text: "    Dead-letter queue monitoring", tone: "info" },
    { text: "    Health check endpoints", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ OPERATIONS", tone: "accent" },
    { text: "    Vue ops console for queue management", tone: "info" },
    { text: "    Per-message tracing with replay", tone: "info" },
    { text: "    RBAC for operational access", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  Philosophy: If you build it, you operate it.", tone: "warning" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * SHOW COMMANDS
 * ================================================================== */

export function getShowStack(): OutputLine[] {
  return getSkillsOutput();
}

export function getShowMetrics(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ PRODUCTION METRICS ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ┌─────────────────────────────────────┐", tone: "muted" },
    { text: "  │  500+        TPS sustained           │", tone: "success", animate: "counter" },
    { text: "  │  Millions    Messages processed/day  │", tone: "success", animate: "counter" },
    { text: "  │  300+        Brands on the platform  │", tone: "success", animate: "counter" },
    { text: "  │  4           Solo production projects │", tone: "success", animate: "counter" },
    { text: "  │  4+          Years in production      │", tone: "success", animate: "counter" },
    { text: "  │  99.99%      System uptime            │", tone: "success", animate: "counter" },
    { text: "  │  18          Months sole ownership    │", tone: "success", animate: "counter" },
    { text: "  └─────────────────────────────────────┘", tone: "muted" },
    { text: "", tone: "muted" },
    { text: "  Brands: Amazon · Flipkart · SBI · HDFC · Axis · Zomato · Blinkit · +300 more", tone: "accent" },
    { text: "", tone: "muted" },
  ];
}

export function getShowTimeline(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ CAREER TIMELINE ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  2024 — present  Senior Software Engineer, Pine Labs", tone: "accent" },
    { text: "                  Go gift-card lifecycle · HDFC, Axis, FairPrice", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  2022 — 2024     Software Engineer, Pine Labs", tone: "accent" },
    { text: "                  Queue platform (18mo) · Delivery service", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  Concurrent      SmoothPay (freelance, UAE)", tone: "accent" },
    { text: "                  3 apps · Payments · Live in production", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  2021 — 2022     Full-Stack Developer (Trainee), Masai School", tone: "accent" },
    { text: "                  2,200 hours retraining · Comeback Kid & Rising Star", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  2019 — 2022     Diploma, Mechanical Engineering", tone: "accent" },
    { text: "                  Where it started — tolerances & failure modes", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

export function getShowAchievements(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ ACHIEVEMENTS & MILESTONES ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ✦ Built & operated a 500+ TPS queue platform — solo, 18 months", tone: "success" },
    { text: "  ✦ Processed millions of messages daily in production", tone: "success" },
    { text: "  ✦ My services run under Woohoo — 300+ brands, ~9 of 10 gift cards issued in India", tone: "success" },
    { text: "  ✦ Owned the entire SmoothPay platform end to end — 3 live apps", tone: "success" },
    { text: "  ✦ Migrated MQ broker cutting messaging costs dramatically", tone: "success" },
    { text: "  ✦ Own core gift-card lifecycle in Go — 2 years continuous production", tone: "success" },
    { text: "  ✦ Comeback Kid & Rising Star awards at Masai School", tone: "success" },
    { text: "  ✦ 2,200 hours of deliberate, self-directed retraining", tone: "success" },
    { text: "  ✦ BCA in progress alongside full-time work", tone: "success" },
    { text: "", tone: "muted" },
  ];
}

export function getShowTechRadar(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ TECH RADAR ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ████████████████████  Go             EXPERT", tone: "success" },
    { text: "  ████████████████████  TypeScript      EXPERT", tone: "success" },
    { text: "  ████████████████████  Node.js         EXPERT", tone: "success" },
    { text: "  ████████████████████  PostgreSQL      EXPERT", tone: "success" },
    { text: "  ███████████████████░  React           ADVANCED", tone: "ok" },
    { text: "  ███████████████████░  Redis           ADVANCED", tone: "ok" },
    { text: "  ██████████████████░░  Next.js         ADVANCED", tone: "ok" },
    { text: "  ██████████████████░░  Docker          ADVANCED", tone: "ok" },
    { text: "  █████████████████░░░  NestJS          PROFICIENT", tone: "info" },
    { text: "  █████████████████░░░  MySQL           PROFICIENT", tone: "info" },
    { text: "  ████████████████░░░░  Vue.js          PROFICIENT", tone: "info" },
    { text: "  ████████████████░░░░  MongoDB         PROFICIENT", tone: "info" },
    { text: "  ███████████████░░░░░  AWS             GROWING", tone: "muted" },
    { text: "  ███████████████░░░░░  GCP             GROWING", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

export function getShowStrengths(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══ CORE ENGINEERING STRENGTHS ══╗", tone: "heading" },
    { text: "", tone: "muted" },
    { text: "  ▸ END-TO-END OWNERSHIP", tone: "accent" },
    { text: "    Design → Build → Deploy → Operate → On-call", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ SYSTEM RELIABILITY", tone: "accent" },
    { text: "    Idempotency, dead-letter queues, reconciliation crons", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ COST ENGINEERING", tone: "accent" },
    { text: "    Broker migration from per-call to flat pricing", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ FINANCIAL SAFETY", tone: "accent" },
    { text: "    State machines for irreversible operations, decimal math", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ SCALE", tone: "accent" },
    { text: "    500+ TPS, millions of messages, a 300+ brand platform", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ FULL-STACK OWNERSHIP", tone: "accent" },
    { text: "    Owned entire platforms end to end when needed (SmoothPay)", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * PERSONA COMMANDS
 * ================================================================== */

export function getRecruiterOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══════════════════════════════════════════════╗", tone: "accent" },
    { text: "  ║          RECRUITER QUICK BRIEF               ║", tone: "heading" },
    { text: "  ╚══════════════════════════════════════════════╝", tone: "accent" },
    { text: "", tone: "muted" },
    { text: `  ${site.name} — ${site.role}`, tone: "heading" },
    { text: `  ${site.location}`, tone: "muted" },
    { text: "", tone: "muted" },
    { text: "  ▸ HIGHLIGHTS", tone: "accent" },
    { text: "    • 4+ years production experience at Pine Labs", tone: "info" },
    { text: "    • 500+ TPS queue platform — sole owner, 18 months", tone: "info" },
    { text: "    • Go, TypeScript, Node.js, PostgreSQL, Redis", tone: "info" },
    { text: "    • Powers Woohoo — 300+ brands: Amazon, Flipkart, SBI, HDFC, Axis…", tone: "info" },
    { text: "    • Owned the entire SmoothPay platform end to end (3 live apps)", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ LOOKING FOR", tone: "accent" },
    { text: `    ${site.availability}`, tone: "ok" },
    { text: "", tone: "muted" },
    { text: "  ▸ QUICK LINKS", tone: "accent" },
    { text: `    Resume:   /saurabh_resume.pdf`, tone: "info" },
    { text: `    Email:    ${site.email}`, tone: "info" },
    { text: `    GitHub:   ${site.github}`, tone: "info" },
    { text: `    LinkedIn: ${site.linkedin}`, tone: "info" },
    { text: "", tone: "muted" },
    { text: "  → Type 'resume' for download options", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

export function getCtoOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ╔══════════════════════════════════════════════╗", tone: "accent" },
    { text: "  ║       CTO / ENGINEERING LEADER BRIEF         ║", tone: "heading" },
    { text: "  ╚══════════════════════════════════════════════╝", tone: "accent" },
    { text: "", tone: "muted" },
    { text: "  ▸ SCALE HANDLED", tone: "accent" },
    { text: "    500+ TPS sustained · millions of messages/day", tone: "info" },
    { text: "    6 enterprise clients in production", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ ARCHITECTURE DECISIONS", tone: "accent" },
    { text: "    Event-driven with idempotency guarantees", tone: "info" },
    { text: "    Pluggable MQ abstraction (Iron.io → ActiveMQ migration)", tone: "info" },
    { text: "    CQRS with MySQL read/write split", tone: "info" },
    { text: "    State machine discipline for financial operations", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ SYSTEM DESIGN STRENGTHS", tone: "accent" },
    { text: "    Dead-letter queues with replay · Reconciliation crons", tone: "info" },
    { text: "    Circuit breakers for downstream protection", tone: "info" },
    { text: "    Cost-conscious infrastructure decisions", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ LEADERSHIP STYLE", tone: "accent" },
    { text: "    End-to-end ownership — design, build, operate, on-call", tone: "info" },
    { text: "    Turned support escalations into self-serve ops tools", tone: "info" },
    { text: "    Built entire platforms solo when the situation demanded", tone: "info" },
    { text: "", tone: "muted" },
    { text: "  ▸ OPERATIONAL MATURITY", tone: "accent" },
    { text: "    OpenTelemetry tracing · New Relic APM", tone: "info" },
    { text: "    Ops console with RBAC · Slack alerting", tone: "info" },
    { text: "    Production ownership for 2+ years continuously", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

export function getArchitectOutput(): OutputLine[] {
  return getArchitectureOutput();
}

/* ================================================================== *
 * WHOAMI
 * ================================================================== */

export function getWhoamiOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: `  User:     guest`, tone: "info" },
    { text: `  Host:     saurabh@production-cluster`, tone: "info" },
    { text: `  Session:  SaurabhOS v2.0 (portfolio terminal)`, tone: "info" },
    { text: `  Shell:    /bin/portfolio`, tone: "info" },
    { text: `  Operator: ${site.name}`, tone: "accent" },
    { text: `  Role:     ${site.role}`, tone: "info" },
    { text: `  Location: ${site.location}`, tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * FUN COMMANDS
 * ================================================================== */

const FORTUNES: string[] = [
  "A good engineer automates themselves out of a job, then gets promoted for it.",
  "The best code is no code at all.",
  "In theory, there is no difference between theory and practice. In practice, there is.",
  "There are only two hard things in CS: cache invalidation and naming things.",
  "First, solve the problem. Then, write the code.",
  "The most dangerous phrase in engineering: 'We've always done it this way.'",
  "Debugging is twice as hard as writing code. If you write the code as cleverly as possible, you are by definition not smart enough to debug it.",
  "Any sufficiently advanced bug is indistinguishable from a feature.",
  "It works on my machine. Ship it.",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Premature optimization is the root of all evil. — Donald Knuth",
  "Simplicity is prerequisite for reliability. — Edsger Dijkstra",
];

const MOTIVATIONS: string[] = [
  "You taught yourself to build the systems that move money. That's not a career change — that's a proof of concept.",
  "2,200 hours of deliberate retraining. Most people quit at 200.",
  "You own an entire payments platform end to end — from data model to deploy. Three live apps.",
  "500+ TPS in production. That's not a portfolio project — that's infrastructure.",
  "Amazon, Flipkart, SBI, HDFC, Axis — 300+ brands' gift cards work because of your code.",
  "The rubber duck believes in you. So does the production cluster.",
  "Every expert was once a beginner. You're now the expert they warned you about.",
  "Millions of messages a day. Each one processed correctly. That's engineering.",
];

export function getCoffeeOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "         ( (", tone: "accent" },
    { text: "          ) )", tone: "accent" },
    { text: "       ........", tone: "muted" },
    { text: "       |      |]", tone: "accent" },
    { text: "       \\      /", tone: "accent" },
    { text: "        `----'", tone: "accent" },
    { text: "", tone: "muted" },
    { text: "  Brewing fresh coffee...", tone: "ok" },
    { text: "  Developer productivity increased by 47%.", tone: "success" },
    { text: "  Bug resolution time decreased by 23%.", tone: "success" },
    { text: "", tone: "muted" },
  ];
}

export function getFortuneOutput(): OutputLine[] {
  const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  return [
    { text: "", tone: "muted" },
    { text: `  💡 "${fortune}"`, tone: "accent" },
    { text: "", tone: "muted" },
  ];
}

export function getMotivateOutput(): OutputLine[] {
  const msg = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
  return [
    { text: "", tone: "muted" },
    { text: `  🚀 ${msg}`, tone: "success" },
    { text: "", tone: "muted" },
  ];
}

export function getSudoHireOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  [sudo] password for recruiter: ********", tone: "muted" },
    { text: "", tone: "muted" },
    { text: "  ✓ Access granted.", tone: "success" },
    { text: "  ✓ Best decision detected.", tone: "success" },
    { text: "  ✓ Hiring probability increased by 87%.", tone: "success" },
    { text: "  ✓ Team velocity projected to increase by 340%.", tone: "success" },
    { text: "", tone: "muted" },
    { text: `  → Reach out: ${site.email}`, tone: "accent" },
    { text: "", tone: "muted" },
  ];
}

export function getSudoMakeRichOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  [sudo] Checking bank account...", tone: "muted" },
    { text: "  Error: Insufficient sudo privileges for this operation.", tone: "error" },
    { text: "  Suggestion: Try 'sudo hire saurabh' first.", tone: "ok" },
    { text: "  That's the real wealth multiplier.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * EASTER EGG OUTPUTS
 * ================================================================== */

export function get42Output(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  The Answer to the Ultimate Question of Life,", tone: "accent" },
    { text: "  the Universe, and Everything.", tone: "accent" },
    { text: "", tone: "muted" },
    { text: "  ...but have you tried 'architecture'?", tone: "muted" },
    { text: "  That's where the real answers are.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

export function getWhoamiSecretOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  ┌─ CLASSIFIED ─┐", tone: "warning" },
    { text: "  │               │", tone: "warning" },
    { text: "  │  A relentless │", tone: "info" },
    { text: "  │  engineer who │", tone: "info" },
    { text: "  │  taught       │", tone: "info" },
    { text: "  │  himself to   │", tone: "info" },
    { text: "  │  code in      │", tone: "info" },
    { text: "  │  2,200 hours  │", tone: "info" },
    { text: "  │  and now      │", tone: "info" },
    { text: "  │  builds       │", tone: "info" },
    { text: "  │  systems that │", tone: "info" },
    { text: "  │  move money.  │", tone: "accent" },
    { text: "  │               │", tone: "warning" },
    { text: "  └───────────────┘", tone: "warning" },
    { text: "", tone: "muted" },
  ];
}

export function getUnlockOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  🔓 Hidden commands unlocked:", tone: "success" },
    { text: "", tone: "muted" },
    { text: "  matrix          Green rain (3 seconds)", tone: "info" },
    { text: "  hack            Hacker mode simulation", tone: "info" },
    { text: "  42              The answer", tone: "info" },
    { text: "  whoami --secret  The real story", tone: "info" },
    { text: "  coffee          Brew a cup", tone: "info" },
    { text: "  sudo hire saurabh  Best career move", tone: "info" },
    { text: "  neofetch        System info", tone: "info" },
    { text: "", tone: "muted" },
  ];
}

export function getNeofetchOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "         .---.        saurabh@production-cluster", tone: "accent" },
    { text: "        /     \\       ──────────────────────────", tone: "accent" },
    { text: "        \\.@-@./       OS:     SaurabhOS v2.0", tone: "info" },
    { text: "        /`\\_/`\\       Host:   portfolio-terminal", tone: "info" },
    { text: "       //  _  \\\\      Kernel: React 19 + Next.js 15", tone: "info" },
    { text: "      | \\     )|_     Shell:  /bin/portfolio", tone: "info" },
    { text: "     /`\\_`>  <_/ \\    DE:     Framer Motion", tone: "info" },
    { text: "     \\__/'---'\\__/    Theme:  Pine & Coral", tone: "info" },
    { text: "                      Uptime: 4+ years", tone: "info" },
    { text: "                      Stack:  Go · Node · TS · PG", tone: "info" },
    { text: "                      TPS:    500+", tone: "success" },
    { text: "                      Msgs:   Millions/day", tone: "success" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * LS / PWD / CAT
 * ================================================================== */

export function getLsOutput(): OutputLine[] {
  return [
    { text: "", tone: "muted" },
    { text: "  drwxr-xr-x  about/", tone: "info" },
    { text: "  drwxr-xr-x  experience/", tone: "info" },
    { text: "  drwxr-xr-x  projects/", tone: "info" },
    { text: "  drwxr-xr-x  skills/", tone: "info" },
    { text: "  drwxr-xr-x  architecture/", tone: "info" },
    { text: "  -rw-r--r--  saurabh_resume.pdf", tone: "accent" },
    { text: "  -rw-r--r--  contact.md", tone: "accent" },
    { text: "  -rwx------  .secret-commands", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

export function getPwdOutput(): OutputLine[] {
  return [
    { text: "  /home/saurabh/portfolio", tone: "info" },
  ];
}

export function getCatOutput(): OutputLine[] {
  return [
    { text: "  Usage: cat <filename>", tone: "muted" },
    { text: "  Try: cat .secret-commands (hint: use 'unlock')", tone: "muted" },
  ];
}

/* ================================================================== *
 * SEARCH FUNCTION
 * ================================================================== */

export function searchContent(query: string): OutputLine[] {
  const q = query.toLowerCase();
  const results: OutputLine[] = [
    { text: "", tone: "muted" },
    { text: `  Searching for "${query}"...`, tone: "muted" },
    { text: "", tone: "muted" },
  ];

  let found = 0;

  // Search in about
  site.about.forEach((p) => {
    if (p.toLowerCase().includes(q)) {
      results.push(
        { text: "  [ABOUT]", tone: "heading" },
        { text: `  ${p.slice(0, 120)}...`, tone: "info" },
        { text: "", tone: "muted" },
      );
      found++;
    }
  });

  // Search in experience
  site.experience.forEach((e) => {
    const match = [e.role, e.org, ...e.points].some((s) => s.toLowerCase().includes(q));
    if (match) {
      results.push(
        { text: `  [EXPERIENCE] ${e.role} — ${e.org}`, tone: "heading" },
        { text: `  ${e.period}`, tone: "muted" },
        { text: "", tone: "muted" },
      );
      found++;
    }
  });

  // Search in skills
  site.skills.forEach((s) => {
    const match = [s.group, ...s.items].some((i) => i.toLowerCase().includes(q));
    if (match) {
      results.push(
        { text: `  [SKILLS] ${s.group}`, tone: "heading" },
        { text: `  ${s.items.join(" · ")}`, tone: "info" },
        { text: "", tone: "muted" },
      );
      found++;
    }
  });

  // Search in case studies
  caseStudies.forEach((c) => {
    const match = [c.title, c.oneLiner, c.problem, c.architecture, ...c.stack]
      .some((s) => s.toLowerCase().includes(q));
    if (match) {
      results.push(
        { text: `  [PROJECT] ${c.title}`, tone: "heading" },
        { text: `  ${c.oneLiner.slice(0, 120)}...`, tone: "info" },
        { text: "", tone: "muted" },
      );
      found++;
    }
  });

  if (found === 0) {
    results.push(
      { text: `  No results found for "${query}".`, tone: "error" },
      { text: "  Try: payments, queue, go, react, smoothpay", tone: "muted" },
    );
  } else {
    results.push({ text: `  ${found} result(s) found.`, tone: "success" });
  }

  results.push({ text: "", tone: "muted" });
  return results;
}

/* ================================================================== *
 * UPTIME — simulated production uptime counter
 * ================================================================== */

export function getUptimeOutput(): OutputLine[] {
  // Simulate a realistic uptime since a "last deploy"
  const days = 47 + Math.floor(Math.random() * 30);
  const hours = Math.floor(Math.random() * 24);
  const mins = Math.floor(Math.random() * 60);
  const load = (0.2 + Math.random() * 0.6).toFixed(2);
  const mem = Math.round(40 + Math.random() * 25);

  return [
    { text: "", tone: "muted" },
    { text: "  ┌─────────────────────────────────────────┐", tone: "muted" },
    { text: "  │         SYSTEM UPTIME REPORT            │", tone: "heading" },
    { text: "  ├─────────────────────────────────────────┤", tone: "muted" },
    { text: `  │  Uptime ....... ${days}d ${hours}h ${mins}m`, tone: "ok" },
    { text: `  │  Load avg ..... ${load}`, tone: "ok" },
    { text: `  │  Memory ....... ${mem}% used`, tone: mem > 60 ? "warning" : "ok" },
    { text: "  │  Status ....... ● All systems nominal", tone: "success" },
    { text: "  │  Last deploy .. 2 days ago (v2.4.1)", tone: "info" },
    { text: "  │  Incidents .... 0 (this quarter)", tone: "success" },
    { text: "  └─────────────────────────────────────────┘", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * FUN-FACT — random engineering and tech fun facts
 * ================================================================== */

const FUN_FACTS: string[] = [
  "The first computer bug was an actual moth found in a Harvard Mark II relay in 1947.",
  "Git was created by Linus Torvalds in just 2 weeks because BitKeeper revoked its free license.",
  "The first version of JavaScript was written by Brendan Eich in 10 days.",
  "PostgreSQL has been in continuous development since 1986 — older than most developers using it.",
  "Redis stands for REmote DIctionary Server. It processes 100K+ operations per second.",
  "Go was designed at Google in 2007 because engineers were frustrated with C++ compile times.",
  "The term 'microservices' was first used at a software architecture workshop in Venice in 2011.",
  "Amazon processes roughly 1.6 million packages per day. Scale is a lifestyle.",
  "Stripe processes hundreds of billions of dollars annually. Payments are serious business.",
  "The 'sudo' command stands for 'superuser do'. Not 'pseudo' or 'sue dough'.",
  "The Linux kernel has over 30 million lines of code and 15,000+ contributors.",
  "Docker containers share the host OS kernel — that's why they're so much lighter than VMs.",
  "The CAP theorem proves you can only have 2 of: Consistency, Availability, Partition tolerance.",
  "Rubber duck debugging is a real technique: explain your code to a duck, find the bug.",
  "The Apollo 11 guidance computer had 74KB of memory. Your terminal uses more than that.",
  "TypeScript was released by Microsoft in 2012 and is now used by 78% of JavaScript developers.",
  "Kubernetes is Greek for 'helmsman'. Its logo has a 7-sided wheel for its 7 founding principles.",
  "The first message ever sent on the internet was 'LO' — it crashed before sending 'LOGIN'.",
  "Node.js runs on V8, the same JavaScript engine that powers Google Chrome.",
  "The average developer writes about 50–100 lines of production code per day.",
];

let lastFactIndex = -1;

export function getFunFactOutput(): OutputLine[] {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * FUN_FACTS.length);
  } while (idx === lastFactIndex && FUN_FACTS.length > 1);
  lastFactIndex = idx;

  return [
    { text: "", tone: "muted" },
    { text: "  🎯 Fun Fact", tone: "heading" },
    { text: "  ────────────────────────────────────────", tone: "muted" },
    { text: `  ${FUN_FACTS[idx]}`, tone: "info" },
    { text: "", tone: "muted" },
    { text: "  Run 'fun-fact' again for another one.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * QUOTE — random developer and engineering quotes
 * ================================================================== */

const QUOTES: { text: string; author: string }[] = [
  { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Hal Abelson" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "It's not a bug — it's an undocumented feature.", author: "Anonymous" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "The only way to go fast, is to go well.", author: "Robert C. Martin" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "The computer was born to solve problems that did not exist before.", author: "Bill Gates" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
];

let lastQuoteIndex = -1;

export function getQuoteOutput(): OutputLine[] {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * QUOTES.length);
  } while (idx === lastQuoteIndex && QUOTES.length > 1);
  lastQuoteIndex = idx;

  const q = QUOTES[idx];
  return [
    { text: "", tone: "muted" },
    { text: "  💬 Developer Quote", tone: "heading" },
    { text: "  ────────────────────────────────────────", tone: "muted" },
    { text: `  "${q.text}"`, tone: "info" },
    { text: `  — ${q.author}`, tone: "accent" },
    { text: "", tone: "muted" },
    { text: "  Run 'quote' again for another one.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * 100+ WITTY "COMMAND NOT FOUND" MESSAGES
 * ================================================================== */

const WITTY_ERRORS: string[] = [
  "Oops. That command was deployed directly to production. Recovery team notified.",
  "404: Coffee not found. Developer productivity reduced by 32%.",
  "The interns have no idea what that means. Try 'help'.",
  "That command escaped into Kubernetes. Still searching...",
  "Stack Overflow could not save us this time.",
  "The rubber duck is disappointed.",
  "That command failed CI/CD validation.",
  "The database politely declined.",
  "Command not found in any known universe. Multiverse search pending.",
  "Segmentation fault (core dumped). Just kidding. Try 'help'.",
  "That's not a command, that's a cry for help. Type 'help' for actual help.",
  "The load balancer evenly distributed that error across all nodes.",
  "Permission denied. This system runs on good vibes only.",
  "Your command has been added to the backlog. Sprint 47.",
  "The AI overlords have reviewed your command and found it wanting.",
  "Error: That command needs at least 3 code reviews.",
  "Compiling... just kidding. That's not a thing here.",
  "The monitoring dashboard just raised an eyebrow.",
  "That command is in a different branch. Probably 'main'. Definitely not here.",
  "The QA team would like a word with you.",
  "That's the kind of command that makes senior engineers cry.",
  "Error: Undefined is not a function. Wait, this isn't JavaScript... or is it?",
  "The oncall engineer is pretending they didn't see that.",
  "Your command has been rate-limited for being too creative.",
  "Error: Maximum recursion depth exceeded. Stop trying to break things.",
  "That command requires a mass of at least 3 microservices.",
  "The circuit breaker just tripped. Try again in 30 seconds. Or don't.",
  "That command has been dead-lettered for manual review.",
  "Error: Cannot read property 'meaning' of undefined.",
  "The Helm chart has no values for that.",
  "Your command was rejected by the API gateway. Status: 418 I'm a teapot.",
  "The Redis cache has no memory of that command.",
  "Error: ECONNREFUSED. The command server ghosted you.",
  "That went through all 7 layers of the OSI model and was rejected at each one.",
  "The message queue politely returned your command with a 'NAK'.",
  "Container crashed. Restarting... nah, just try 'help'.",
  "That command was deprecated in v1.0. We're on v2.0 now.",
  "The event bus has no subscribers for that event.",
  "Your command scored 0.0 on the relevance index.",
  "The goroutine pool rejected your request. Too creative.",
  "That command needs a feature flag that hasn't been flipped.",
  "Error: That command requires a pull request with 2 approvals.",
  "The deployment pipeline choked on that. Rollback initiated.",
  "That's not in the runbook. And I wrote the runbook.",
  "The OpenTelemetry trace for that command is just a question mark.",
  "Error: ENOMEM — not enough memory to process that much confusion.",
  "The SRE team just updated the incident timeline because of you.",
  "Your command was caught by the WAF. Suspicious intent detected.",
  "That command needs at least 99.99% more sense.",
  "Error: Command not found. But the journey was what mattered all along.",
  "The Kafka consumer group couldn't reach consensus on that one.",
  "That's the kind of input that makes state machines non-deterministic.",
  "The blue-green deployment strategy doesn't know which color that is.",
  "Error: Cannot create command from nil pointer.",
  "The auto-scaler just scaled down because there's nothing to do with that.",
  "Your command was serialized, deserialized, and still made no sense.",
  "Error: That command has no unit tests. Rejected.",
  "The canary deployment died. It was your command.",
  "That's not imperative, declarative, or functional. It's just confusing.",
  "Error: The CDN cached your mistake globally. All edge nodes know.",
  "The health check returned 'confused' for the first time.",
  "Your command triggered a distributed deadlock across 3 regions.",
  "Error: Invalid JSON. Oh wait, that wasn't even JSON.",
  "The webhook endpoint returned: 'new phone who dis'",
  "That command was so unexpected it triggered chaos engineering accidentally.",
  "Error: Database migration rolled back. Your command caused a schema meltdown.",
  "The PagerDuty alert for that would be classified as 'existential'.",
  "Your command has been forwarded to /dev/null for immediate processing.",
  "Error: That command violates the principle of least surprise.",
  "The Terraform plan for that shows 0 adds, 0 changes, 1 confusion.",
  "The container orchestrator assigned your command to: nobody.",
  "Error: Not enough coffee in the system to process that.",
  "That command was rejected by the rate limiter. Creativity quota exceeded.",
  "The observability platform can see your confusion from here.",
  "Error: Your command failed the smoke test. It just smoked.",
  "The DNS resolver couldn't find a domain for that level of confusion.",
  "That's not a bug, it's not a feature — it's just... nothing.",
  "Error: Your command was caught in an infinite redirect loop of sadness.",
  "The serverless function timed out trying to understand that.",
  "Your command has been quarantined by the security scanner.",
  "Error: That command needs a postmortem before it even runs.",
  "The GraphQL resolver returned: { data: null, errors: ['wat'] }",
  "The SSL certificate doesn't trust that command.",
  "Error: Docker build failed at step 1: COPY your-command /dev/null",
  "The Prometheus metric for that is: confusion_total{source='user'}",
  "That's the kind of command that keeps SREs up at night.",
  "Error: git blame shows nobody wants credit for that.",
  "The NGINX config doesn't have a location block for whatever that was.",
  "Your command scored 'F' on the technical review.",
  "Error: The dependency graph for that command is a circle.",
  "The linter has feelings now, and they're hurt.",
  "That command needs more yaml. Everything needs more yaml.",
  "Error: gRPC status code 13: INTERNAL (you broke something)",
  "The cron job for understanding that is set to: never.",
  "Your command was flagged by the anomaly detection system.",
  "Error: That's not RESTful, GraphQL, or gRPC. It's just stressful.",
  "The cache invalidation strategy for that command is: pretend it didn't happen.",
  "That command was load tested and couldn't handle 0 requests per second.",
  "Error: The test coverage for that command is -12%.",
  "The incident commander has classified your command as SEV-∞.",
  "Your command required 0 nodes, 0 CPU, 0 memory, and 0 sense.",
  "404: Command found a better opportunity.",
  "Syntax Error: Coffee required. Insert coffee and retry.",
  "Stack Overflow is loading... but even they can't help you with that.",
  "The compiler is judging you silently.",
];

let lastErrorIndex = -1;

// Shares `lastFactIndex` with `getFunFactOutput` so an error's fun fact and
// the `fun-fact` command's output don't repeat the same line back-to-back.
export function getRandomError(cmd: string): OutputLine[] {
  let idx: number;
  do {
    idx = Math.floor(Math.random() * WITTY_ERRORS.length);
  } while (idx === lastErrorIndex && WITTY_ERRORS.length > 1);
  lastErrorIndex = idx;

  let factIdx: number;
  do {
    factIdx = Math.floor(Math.random() * FUN_FACTS.length);
  } while (factIdx === lastFactIndex && FUN_FACTS.length > 1);
  lastFactIndex = factIdx;

  return [
    { text: "", tone: "muted" },
    { text: `  ✗ command not found: ${cmd}`, tone: "error" },
    { text: `  ${WITTY_ERRORS[idx]}`, tone: "muted" },
    { text: "", tone: "muted" },
    { text: `  💡 Fun fact: ${FUN_FACTS[factIdx]}`, tone: "info" },
    { text: "  Type 'help' for available commands.", tone: "muted" },
    { text: "", tone: "muted" },
  ];
}

/* ================================================================== *
 * THEME DEFINITIONS
 * ================================================================== */

export type TerminalTheme = {
  name: string;
  label: string;
  vars: Record<string, string>;
};

export const TERMINAL_THEMES: TerminalTheme[] = [
  {
    name: "production",
    label: "Production (Pine & Coral)",
    vars: {
      "--term-bg": "#0c1210",
      "--term-surface": "#111917",
      "--term-ink": "#e8efea",
      "--term-muted": "#8fa39a",
      "--term-accent": "#ff8a66",
      "--term-good": "#7fc99b",
      "--term-bad": "#e08b8b",
      "--term-line": "rgba(143, 163, 154, 0.16)",
      "--term-glow": "rgba(255, 138, 102, 0.12)",
    },
  },
  {
    name: "matrix",
    label: "Matrix",
    vars: {
      "--term-bg": "#000a00",
      "--term-surface": "#001100",
      "--term-ink": "#00ff41",
      "--term-muted": "#007a1f",
      "--term-accent": "#00ff41",
      "--term-good": "#00ff41",
      "--term-bad": "#ff3333",
      "--term-line": "rgba(0, 255, 65, 0.15)",
      "--term-glow": "rgba(0, 255, 65, 0.3)",
    },
  },
  {
    name: "cyberpunk",
    label: "Cyberpunk",
    vars: {
      "--term-bg": "#0a0015",
      "--term-surface": "#120024",
      "--term-ink": "#e0d0ff",
      "--term-muted": "#8a6abf",
      "--term-accent": "#ff2d95",
      "--term-good": "#00ffc8",
      "--term-bad": "#ff3e3e",
      "--term-line": "rgba(255, 45, 149, 0.15)",
      "--term-glow": "rgba(255, 45, 149, 0.3)",
    },
  },
  {
    name: "vscode",
    label: "VS Code Dark",
    vars: {
      "--term-bg": "#1e1e1e",
      "--term-surface": "#252526",
      "--term-ink": "#d4d4d4",
      "--term-muted": "#808080",
      "--term-accent": "#569cd6",
      "--term-good": "#6a9955",
      "--term-bad": "#f44747",
      "--term-line": "rgba(86, 156, 214, 0.15)",
      "--term-glow": "rgba(86, 156, 214, 0.2)",
    },
  },
  {
    name: "terminal",
    label: "Classic Terminal",
    vars: {
      "--term-bg": "#000000",
      "--term-surface": "#0a0a0a",
      "--term-ink": "#33ff33",
      "--term-muted": "#1a991a",
      "--term-accent": "#33ff33",
      "--term-good": "#33ff33",
      "--term-bad": "#ff3333",
      "--term-line": "rgba(51, 255, 51, 0.12)",
      "--term-glow": "rgba(51, 255, 51, 0.25)",
    },
  },
  {
    name: "retro",
    label: "Retro Amber",
    vars: {
      "--term-bg": "#1a0f00",
      "--term-surface": "#2a1a05",
      "--term-ink": "#ffb000",
      "--term-muted": "#996a00",
      "--term-accent": "#ffb000",
      "--term-good": "#ffb000",
      "--term-bad": "#ff4444",
      "--term-line": "rgba(255, 176, 0, 0.15)",
      "--term-glow": "rgba(255, 176, 0, 0.3)",
    },
  },
];

/* ================================================================== *
 * HEADER STATUS ITEMS
 * ================================================================== */

export const HEADER_STATUS_ITEMS = [
  { label: "NODE_A", status: "ONLINE" },
  { label: "NODE_B", status: "ONLINE" },
  { label: "PAY_ENGINE", status: "HEALTHY" },
  { label: "QUEUE_SYS", status: "RUNNING" },
  { label: "UPTIME", status: "99.99%" },
] as const;
