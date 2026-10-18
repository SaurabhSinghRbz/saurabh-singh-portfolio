"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * DeliveryDeployDiagram — the real release + runtime topology:
 * CodeBuild bakes an ARM64 image (Node 20, PM2, nginx, Telegraf, the
 * cairo/pango stack for QR & barcode rendering, the built Vue console),
 * ECR stores it, CodeDeploy runs a blue/green ECS shift. Each ECS task
 * runs TWO containers — the delivery app (pm2 app.js -i 2) and a Hasura
 * sidecar — over shared Postgres, with an EFS volume for attachments.
 * A separate cron task runs the shipment-tracking job.
 * ------------------------------------------------------------------ */

const N = {
  git: { x: 80, y: 60, w: 104, h: 52, title: "GIT PUSH", sub: "Bitbucket" },
  build: { x: 258, y: 60, w: 138, h: 58, title: "CODEBUILD", sub: "ARM64 · Node 20" },
  ecr: { x: 436, y: 60, w: 104, h: 54, title: "ECR", sub: "registry" },
  deploy: { x: 612, y: 60, w: 140, h: 58, title: "CODEDEPLOY", sub: "blue / green" },
  alb: { x: 436, y: 214, w: 132, h: 54, title: "TRAFFIC", sub: "ALB · port 80" },
  blue: { x: 792, y: 158, w: 176, h: 44, title: "BLUE — task", sub: "serving" },
  green: { x: 792, y: 250, w: 176, h: 44, title: "GREEN — task", sub: "starting…" },
} as const;

type NodeId = keyof typeof N;

const BOOT = [
  { text: "update_secrets.py → POSTGRES_URL + Hasura admin secret from SSM / Secrets Manager", status: "OK" },
  { text: "Telegraf up → metrics to InfluxDB · Loki · QRadar · Kafka audit trail", status: "OK" },
  { text: "nginx :80 → API + proxy + Vue ops console on one port", status: "OK" },
  { text: "Hasura sidecar boots in the same task; auth hook → /api/int/authorize", status: "OK" },
  { text: "EFS 'uploads' volume mounted for attachment storage", status: "OK" },
  { text: "pm2-runtime app.js -i 2 → 2 clustered API instances become PID 1", status: "ONLINE" },
];

const CONTAINERS = ["delivery app · pm2 -i 2", "hasura sidecar", "cron task · shipment track"];

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone?: "ok" | "accent" | "info" | "muted";
  boot?: number;
  fleet?: boolean;
  traffic: "blue" | "green";
  blueDrained?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { move: { from: "git", to: "build" }, log: "git push → CodeBuild triggers", tone: "info", traffic: "blue", dur: 1200 },
  { at: "build", log: "docker build — ARM64 Amazon Linux, + cairo/pango so QR & barcode render server-side", tone: "accent", traffic: "blue", dur: 1900 },
  { move: { from: "build", to: "ecr" }, log: "tag version + latest → push to ECR", tone: "info", traffic: "blue", dur: 1200 },
  { move: { from: "ecr", to: "deploy" }, log: "CodeDeploy registers the new two-container task definition", tone: "info", traffic: "blue", dur: 1400 },
  { move: { from: "deploy", to: "green" }, log: "GREEN task launches beside BLUE — app + Hasura sidecar together", tone: "accent", traffic: "blue", dur: 1500 },
  { at: "green", log: "container boot: process_init.sh takes over ↓", tone: "accent", boot: 0, traffic: "blue", dur: 1100 },
  { at: "green", log: "secrets injected at boot — the image carries no credentials", tone: "info", boot: 1, traffic: "blue", dur: 1300 },
  { at: "green", log: "observability agents up before the app", tone: "info", boot: 2, traffic: "blue", dur: 1200 },
  { at: "green", log: "nginx fronts API, proxy and console", tone: "info", boot: 3, traffic: "blue", dur: 1200 },
  { at: "green", log: "Hasura sidecar authorizes every GraphQL call back through the app", tone: "info", boot: 4, traffic: "blue", dur: 1500 },
  { at: "green", log: "shared EFS keeps attachments available across tasks", tone: "info", boot: 5, traffic: "blue", dur: 1400 },
  { at: "green", log: "two clustered API workers online; health check hits /ping.html + /track/healthz", tone: "ok", boot: 6, fleet: true, traffic: "blue", dur: 1800 },
  { at: "alb", log: "health passes on GREEN → traffic shifts BLUE → GREEN, zero downtime", tone: "ok", boot: 6, fleet: true, traffic: "green", dur: 2000 },
  { at: "blue", log: "BLUE drains and retires. A separate cron task keeps polling couriers for shipment status.", tone: "muted", boot: 6, fleet: true, traffic: "green", blueDrained: true, dur: 2000 },
];

function Box({ id, active, drained, live }: { id: NodeId; active: boolean; drained?: boolean; live?: boolean }) {
  const n = N[id];
  return (
    <g opacity={drained ? 0.35 : 1}>
      <rect x={n.x - n.w / 2} y={n.y - n.h / 2} width={n.w} height={n.h} rx={10} fill="var(--t-surface)" stroke={active ? "var(--t-accent)" : live ? "var(--t-good)" : "var(--t-line-2)"} strokeWidth={active || live ? 2 : 1} />
      <text x={n.x} y={n.y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={12.5} fontWeight={600} fontFamily="var(--font-mono)">
        {n.title}
      </text>
      <text x={n.x} y={n.y + 15} textAnchor="middle" fill="var(--t-muted)" fontSize={10} fontFamily="var(--font-mono)">
        {n.sub}
      </text>
    </g>
  );
}

export default function DeliveryDeployDiagram() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const [i, setI] = useState(0);
  const step = SCRIPT[i];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((p) => (p + 1) % SCRIPT.length), step.dur);
    return () => clearTimeout(t);
  }, [i, inView, reduced, step.dur]);

  const bootShown = reduced ? BOOT.length : (step.boot ?? -1);
  const fleetShown = reduced || !!step.fleet;
  const trafficTarget = reduced ? "green" : step.traffic;
  const activeNode: NodeId | null = reduced ? null : (step.at ?? step.move?.to ?? null);

  const packet = step.move
    ? step.move.to === "green"
      ? { x: [N.deploy.x, N.deploy.x + 60, N.green.x - N.green.w / 2], y: [N.deploy.y, N.green.y, N.green.y] }
      : { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Release path — build · ship · blue/green shift
          </p>
          {!reduced && <p className="font-mono text-[10px] text-muted">step {i + 1}/{SCRIPT.length}</p>}
        </div>

        <DiagramScroll>
        <svg viewBox="0 0 920 300" className="block w-full" role="img" aria-label="Animated deployment diagram: git push builds an ARM64 image in CodeBuild, pushes to ECR, CodeDeploy starts a green ECS task (delivery app plus Hasura sidecar) beside blue, and traffic shifts to green with zero downtime while a separate cron task polls couriers.">
          <line x1={N.git.x} y1={60} x2={N.deploy.x} y2={60} stroke="var(--t-line)" strokeWidth={1.5} />
          <path d={`M ${N.deploy.x} ${60 + 29} C ${N.deploy.x + 60} 158, ${N.deploy.x + 30} ${N.green.y}, ${N.green.x - N.green.w / 2} ${N.green.y}`} fill="none" stroke="var(--t-line)" strokeWidth={1.5} strokeDasharray="5 5" />

          <motion.line
            x1={N.alb.x + N.alb.w / 2}
            y1={N.alb.y}
            animate={{ x2: N.blue.x - N.blue.w / 2 - 6, y2: trafficTarget === "blue" ? N.blue.y : N.green.y, stroke: trafficTarget === "blue" ? "var(--t-line-2)" : "var(--t-good)" }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            strokeWidth={2.5}
          />

          {(Object.keys(N) as NodeId[]).map((id) => (
            <Box key={id} id={id} active={activeNode === id} drained={id === "blue" && (reduced || step.blueDrained)} live={id === "green" && trafficTarget === "green"} />
          ))}

          {!reduced && packet && (
            <motion.g animate={{ x: packet.x, y: packet.y, scale: step.at ? [1, 1.4, 1] : 1 }} transition={{ duration: step.dur / 1000, ease: "easeInOut" }}>
              <circle r={6.5} fill="var(--t-accent)" />
              <circle r={11} fill="var(--t-accent)" opacity={0.25} />
            </motion.g>
          )}
        </svg>
        </DiagramScroll>

        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">Animation disabled (reduced motion) — the boot sequence below is shown complete.</p>
          ) : (
            <p key={i} className={`font-mono text-xs sm:text-[13px] ${step.tone === "ok" ? "text-good" : step.tone === "accent" ? "text-accent" : step.tone === "muted" ? "text-muted" : "text-ink/85"}`}>
              <span className="text-muted">[deploy]</span> {step.log}
            </p>
          )}
        </div>
      </div>

      {/* boot checklist */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2/70 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
          </div>
          <p className="font-mono text-[11px] tracking-wide text-muted">inside the GREEN task — process_init.sh</p>
        </div>
        <div className="px-4 py-4 font-mono text-xs sm:text-[13px]">
          {BOOT.map((line, idx) => (
            <motion.div key={line.text} initial={false} animate={{ opacity: idx < bootShown ? 1 : 0.15 }} transition={{ duration: 0.3 }} className="flex items-baseline justify-between gap-4 py-1">
              <span className="text-ink/85">
                <span className="mr-2 text-muted">{idx + 1}.</span>
                {line.text}
              </span>
              <span className={`shrink-0 ${line.status === "ONLINE" ? "text-accent" : "text-good"}`}>[{idx < bootShown ? line.status : "…"}]</span>
            </motion.div>
          ))}

          <motion.div initial={false} animate={{ opacity: fleetShown ? 1 : 0 }} transition={{ duration: 0.4 }} className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">one image, three roles running</p>
            <div className="flex flex-wrap gap-2">
              {CONTAINERS.map((c, idx) => (
                <motion.span key={c} initial={false} animate={fleetShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }} transition={{ delay: reduced ? 0 : idx * 0.12, duration: 0.25 }} className={`rounded-full border px-2.5 py-1 text-[11px] ${idx === 0 ? "border-accent/50 text-accent" : "border-line text-muted"}`}>
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-good align-middle" />
                  {c}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
