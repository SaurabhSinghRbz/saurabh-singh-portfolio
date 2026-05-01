"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * DeployFlowDiagram — the real release path of the queue platform:
 * CodeBuild bakes an ARM64 image, ECR stores it, CodeDeploy runs a
 * blue/green shift on ECS, and inside the task process_init.sh boots
 * secrets → telegraf → nginx → process.json (generated from MongoDB)
 * → pm2-runtime with one worker per active queue.
 * ------------------------------------------------------------------ */

const N = {
  git: { x: 84, y: 62, w: 108, h: 54, title: "GIT PUSH", sub: "Bitbucket" },
  build: { x: 268, y: 62, w: 142, h: 60, title: "CODEBUILD", sub: "docker build · ARM64" },
  ecr: { x: 446, y: 62, w: 108, h: 56, title: "ECR", sub: "image registry" },
  deploy: { x: 626, y: 62, w: 142, h: 60, title: "CODEDEPLOY", sub: "blue / green" },
  alb: { x: 446, y: 218, w: 138, h: 56, title: "TRAFFIC", sub: "ALB · port 80" },
  blue: { x: 792, y: 160, w: 172, h: 46, title: "BLUE — v41", sub: "serving" },
  green: { x: 792, y: 252, w: 172, h: 46, title: "GREEN — v42", sub: "starting…" },
} as const;

type NodeId = keyof typeof N;

const BOOT_LINES = [
  { text: "update_secrets.py → pull runtime secrets from AWS Secrets Manager", status: "OK" },
  { text: "telegraf ×2 up → heartbeat & queue metrics stream to InfluxDB", status: "OK" },
  { text: "nginx :80 up → REST API + Vue ops console behind one port", status: "OK" },
  { text: "migratecli up process → read active queues from MongoDB → write process.json", status: "OK" },
  { text: "pm2-runtime process.json → API server + one consumer worker per queue", status: "ONLINE" },
];

const FLEET = ["server", "q:card-activations", "q:order-events", "q:notifications", "q:refunds", "…"];

type Step = {
  move?: { from: NodeId; to: NodeId };
  at?: NodeId;
  log: string;
  tone?: "ok" | "accent" | "info" | "muted";
  boot?: number; // number of boot lines revealed
  fleet?: boolean; // show PM2 fleet chips
  traffic: "blue" | "green";
  blueDrained?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  { move: { from: "git", to: "build" }, log: "git push → pipeline triggers CodeBuild", tone: "info", traffic: "blue", dur: 1300 },
  { at: "build", log: "docker build — Amazon Linux 2023 ARM64 · Node 22 · PM2 · nginx · Telegraf · Vue console baked in", tone: "accent", traffic: "blue", dur: 1900 },
  { move: { from: "build", to: "ecr" }, log: "tag env-instance-app:version + :latest → push to ECR", tone: "info", traffic: "blue", dur: 1300 },
  { move: { from: "ecr", to: "deploy" }, log: "CodeDeploy registers the new task definition — secrets wired from Secrets Manager, never baked into the image", tone: "info", traffic: "blue", dur: 1500 },
  { move: { from: "deploy", to: "green" }, log: "GREEN task set launches next to BLUE — same service, both behind port 80", tone: "accent", traffic: "blue", dur: 1500 },
  { at: "green", log: "container boot: process_init.sh takes over ↓", tone: "accent", boot: 0, traffic: "blue", dur: 1100 },
  { at: "green", log: "secrets injected — the image itself holds zero credentials", tone: "info", boot: 1, traffic: "blue", dur: 1300 },
  { at: "green", log: "metrics agents up before the app — if boot fails, we see why", tone: "info", boot: 2, traffic: "blue", dur: 1300 },
  { at: "green", log: "nginx fronts the API and the ops console on one port", tone: "info", boot: 3, traffic: "blue", dur: 1300 },
  { at: "green", log: "the fleet is data-driven: queues in MongoDB become PM2 processes — no code change to add a queue", tone: "accent", boot: 4, traffic: "blue", dur: 1900 },
  { at: "green", log: "pm2-runtime is PID 1 — a crashed worker restarts alone, the rest keep consuming", tone: "info", boot: 5, fleet: true, traffic: "blue", dur: 1900 },
  { at: "green", log: "health checks pass on GREEN", tone: "ok", boot: 5, fleet: true, traffic: "blue", dur: 1200 },
  { at: "alb", log: "traffic shifts BLUE → GREEN — zero downtime, consumers overlap safely (broker guarantees exactly-once via ack)", tone: "ok", boot: 5, fleet: true, traffic: "green", dur: 2000 },
  { at: "blue", log: "BLUE drains and retires. Rollback is the same arrow, pointed back.", tone: "muted", boot: 5, fleet: true, traffic: "green", blueDrained: true, dur: 1800 },
];

function Box({ id, active, drained, live }: { id: NodeId; active: boolean; drained?: boolean; live?: boolean }) {
  const n = N[id];
  return (
    <g opacity={drained ? 0.35 : 1}>
      <rect
        x={n.x - n.w / 2}
        y={n.y - n.h / 2}
        width={n.w}
        height={n.h}
        rx={10}
        fill="var(--t-surface)"
        stroke={active ? "var(--t-accent)" : live ? "var(--t-good)" : "var(--t-line-2)"}
        strokeWidth={active || live ? 2 : 1}
      />
      <text x={n.x} y={n.y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={12.5} fontWeight={600} fontFamily="var(--font-mono)">
        {n.title}
      </text>
      <text x={n.x} y={n.y + 15} textAnchor="middle" fill="var(--t-muted)" fontSize={10} fontFamily="var(--font-mono)">
        {n.sub}
      </text>
    </g>
  );
}

export default function DeployFlowDiagram() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const [i, setI] = useState(0);

  const step = SCRIPT[i];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((prev) => (prev + 1) % SCRIPT.length), step.dur);
    return () => clearTimeout(t);
  }, [i, inView, reduced, step.dur]);

  const bootShown = reduced ? BOOT_LINES.length : (step.boot ?? -1);
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
          {!reduced && (
            <p className="font-mono text-[10px] text-muted">
              step {i + 1}/{SCRIPT.length}
            </p>
          )}
        </div>

        <svg viewBox="0 0 920 300" className="block w-full" role="img" aria-label="Animated deployment diagram: git push builds an ARM64 image in CodeBuild, pushes to ECR, CodeDeploy starts a green ECS task set beside blue, and traffic shifts to green with zero downtime.">
          {/* pipeline line */}
          <line x1={N.git.x} y1={62} x2={N.deploy.x} y2={62} stroke="var(--t-line)" strokeWidth={1.5} />
          {/* deploy → green */}
          <path
            d={`M ${N.deploy.x} ${62 + 30} C ${N.deploy.x + 60} 160, ${N.deploy.x + 30} ${N.green.y}, ${N.green.x - N.green.w / 2} ${N.green.y}`}
            fill="none"
            stroke="var(--t-line)"
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />

          {/* traffic arrow: ALB → blue or green */}
          <motion.line
            x1={N.alb.x + N.alb.w / 2}
            y1={N.alb.y}
            animate={{
              x2: N.blue.x - N.blue.w / 2 - 6,
              y2: trafficTarget === "blue" ? N.blue.y : N.green.y,
              stroke: trafficTarget === "blue" ? "var(--t-line-2)" : "var(--t-good)",
            }}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] }}
            strokeWidth={2.5}
          />

          {(Object.keys(N) as NodeId[]).map((id) => (
            <Box
              key={id}
              id={id}
              active={activeNode === id}
              drained={id === "blue" && (reduced || step.blueDrained)}
              live={id === "green" && trafficTarget === "green"}
            />
          ))}

          {/* packet */}
          {!reduced && packet && (
            <motion.g
              animate={{ x: packet.x, y: packet.y, scale: step.at ? [1, 1.4, 1] : 1 }}
              transition={{ duration: step.dur / 1000, ease: "easeInOut" }}
            >
              <circle r={6.5} fill="var(--t-accent)" />
              <circle r={11} fill="var(--t-accent)" opacity={0.25} />
            </motion.g>
          )}
        </svg>

        {/* live log line */}
        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">
              Animation disabled (reduced motion) — the boot sequence below is shown complete.
            </p>
          ) : (
            <p
              key={i}
              className={`font-mono text-xs sm:text-[13px] ${
                step.tone === "ok"
                  ? "text-good"
                  : step.tone === "accent"
                    ? "text-accent"
                    : step.tone === "muted"
                      ? "text-muted"
                      : "text-ink/85"
              }`}
            >
              <span className="text-muted">[deploy]</span> {step.log}
            </p>
          )}
        </div>
      </div>

      {/* container boot checklist */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2/70 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-bad/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-good/70" />
          </div>
          <p className="font-mono text-[11px] tracking-wide text-muted">
            inside the GREEN task — process_init.sh
          </p>
        </div>
        <div className="px-4 py-4 font-mono text-xs sm:text-[13px]">
          {BOOT_LINES.map((line, idx) => (
            <motion.div
              key={line.text}
              initial={false}
              animate={{ opacity: idx < bootShown ? 1 : 0.15 }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline justify-between gap-4 py-1"
            >
              <span className="text-ink/85">
                <span className="mr-2 text-muted">{idx + 1}.</span>
                {line.text}
              </span>
              <span className={`shrink-0 ${line.status === "ONLINE" ? "text-accent" : "text-good"}`}>
                [{idx < bootShown ? line.status : "…"}]
              </span>
            </motion.div>
          ))}

          {/* PM2 fleet */}
          <motion.div
            initial={false}
            animate={{ opacity: fleetShown ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 border-t border-line pt-4"
          >
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-muted">
              pm2 ls — one process per active queue, generated from MongoDB
            </p>
            <div className="flex flex-wrap gap-2">
              {FLEET.map((p, idx) => (
                <motion.span
                  key={p}
                  initial={false}
                  animate={fleetShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  transition={{ delay: reduced ? 0 : idx * 0.1, duration: 0.25 }}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${
                    p === "server"
                      ? "border-accent/50 text-accent"
                      : "border-line text-muted"
                  }`}
                >
                  {p !== "…" && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-good align-middle" />}
                  {p}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
