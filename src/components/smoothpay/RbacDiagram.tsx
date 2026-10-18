"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, FooterNote, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * RbacDiagram — the authorisation chain, verified against the source:
 * app.module registers five APP_GUARDs in order (JwtAuthGuard →
 * RolesGuard → PermissionGuard → BranchAccessGuard → ThrottlerGuard);
 * permission.guard checks @RequirePermission codes against the user's
 * role, with a super-admin bypass; branch-access.guard extracts branchId
 * from params → body → query and checks allowedBranchIds unless the role
 * has allBranchAccess; seed-permissions seeds 101 permissions across
 * ADMIN and MERCHANT scopes and the Owner / Manager / Staff roles.
 *
 * The story: the same request is run twice — once by a Staff user
 * reaching for a branch they don't own, once by their Manager.
 * ------------------------------------------------------------------ */

const Y = 150;

const N: Record<string, SPNodeDef> = {
  req: { x: 72, y: Y, w: 108, h: 54, title: "REQUEST", sub: "GET /orders", kind: "actor" },
  jwt: { x: 236, y: Y, w: 108, h: 56, title: "JWT", sub: "authenticate", kind: "guard" },
  roles: { x: 388, y: Y, w: 108, h: 56, title: "ROLES", sub: "user type", kind: "guard" },
  perm: { x: 545, y: Y, w: 118, h: 56, title: "PERMISSION", sub: "101 codes", kind: "guard" },
  branch: { x: 712, y: Y, w: 122, h: 56, title: "BRANCH", sub: "scope check", kind: "guard" },
  throttle: { x: 872, y: Y, w: 108, h: 56, title: "THROTTLE", sub: "rate limit", kind: "guard" },
  handler: { x: 872, y: 262, w: 122, h: 52, title: "HANDLER", sub: "orders.findAll", kind: "system" },
  denied: { x: 712, y: 262, w: 118, h: 52, title: "403", sub: "forbidden", kind: "state" },
};

type NodeId = keyof typeof N;

type Step = {
  at?: NodeId;
  move?: { from: NodeId; to: NodeId };
  log: string;
  tone: Tone;
  /** who is making the request right now */
  who: string;
  /** guards passed so far, for the chain lights */
  passed: NodeId[];
  deny?: NodeId;
  dur: number;
};

const SCRIPT: Step[] = [
  {
    at: "req",
    who: "Staff · Aisha",
    passed: [],
    log: "Aisha is Staff at the Marina branch. She opens the orders list — but the request carries branchId = Downtown, a branch she has no access to.",
    tone: "info",
    dur: 2800,
  },
  {
    move: { from: "req", to: "jwt" },
    who: "Staff · Aisha",
    passed: [],
    log: "guard 1 — JwtAuthGuard: the token is valid, so the request is hydrated with her userType, roleId, allowedBranchIds and allBranchAccess flag.",
    tone: "accent",
    dur: 2700,
  },
  {
    move: { from: "jwt", to: "roles" },
    who: "Staff · Aisha",
    passed: ["jwt"],
    log: "guard 2 — RolesGuard: is a MERCHANT user allowed on this route at all? Yes. Admin-only routes would already be gone.",
    tone: "accent",
    dur: 2500,
  },
  {
    move: { from: "roles", to: "perm" },
    who: "Staff · Aisha",
    passed: ["jwt", "roles"],
    log: "guard 3 — PermissionGuard: the route declares @RequirePermission('orders.view'). Her Staff role holds it, so she passes. (A super-admin short-circuits this guard entirely.)",
    tone: "accent",
    dur: 3000,
  },
  {
    at: "branch",
    who: "Staff · Aisha",
    passed: ["jwt", "roles", "perm"],
    deny: "branch",
    log: "guard 4 — BranchAccessGuard: she HAS orders.view… but for which branch? It pulls branchId from params → body → query and checks it against her allowedBranchIds.",
    tone: "err",
    dur: 3100,
  },
  {
    move: { from: "branch", to: "denied" },
    who: "Staff · Aisha",
    passed: ["jwt", "roles", "perm"],
    deny: "branch",
    log: "403. Downtown isn't hers. This is the guard that matters in a multi-tenant system: “can do” and “can do HERE” are different questions, and permission alone answers only the first.",
    tone: "err",
    dur: 3400,
  },
  {
    at: "req",
    who: "Manager · Omar",
    passed: [],
    log: "same request, different user. Omar is a Manager whose role carries allBranchAccess = true.",
    tone: "info",
    dur: 2500,
  },
  {
    move: { from: "req", to: "perm" },
    who: "Manager · Omar",
    passed: ["jwt", "roles"],
    log: "JWT and Roles pass identically. PermissionGuard: Manager also holds orders.view.",
    tone: "accent",
    dur: 2400,
  },
  {
    at: "branch",
    who: "Manager · Omar",
    passed: ["jwt", "roles", "perm"],
    log: "BranchAccessGuard sees allBranchAccess = true and waves him through without ever consulting allowedBranchIds.",
    tone: "ok",
    dur: 2700,
  },
  {
    move: { from: "branch", to: "throttle" },
    who: "Manager · Omar",
    passed: ["jwt", "roles", "perm", "branch"],
    log: "guard 5 — ThrottlerGuard: within the rate limit.",
    tone: "accent",
    dur: 2100,
  },
  {
    move: { from: "throttle", to: "handler" },
    who: "Manager · Omar",
    passed: ["jwt", "roles", "perm", "branch", "throttle"],
    log: "only now does a single line of business logic run. Five guards, registered globally in app.module — so a new endpoint is protected by default, not by remembering to protect it.",
    tone: "ok",
    dur: 3300,
  },
];

const DURATIONS = SCRIPT.map((s) => s.dur);
const CHAIN: NodeId[] = ["jwt", "roles", "perm", "branch", "throttle"];

export default function RbacDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const denied = !reduced && !!step.deny;

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="RBAC · five guards, every request, by default"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        badge={{ text: reduced ? "Manager · Omar" : step.who, bad: denied }}
        legend="⛨ global guard · ◈ caller · ▧ handler · ● terminal · guards run in the order app.module registers them"
        log={step.log}
        logPrefix="rbac"
        logTone={step.tone}
        footer={
          <>
            <FooterNote label="the model">
              <span className="text-accent">101 permissions</span> across ADMIN and MERCHANT scopes, grouped by resource
              (branches, orders, qr_codes, payment_links, rbac…). Roles are seeded per merchant as{" "}
              <span className="text-ink">Owner / Manager / Staff</span>, and a merchant can mint custom roles from the same
              permission set.
            </FooterNote>
            <FooterNote label="why two guards, not one">
              PermissionGuard answers <span className="text-accent">“can this role do X?”</span>. BranchAccessGuard answers{" "}
              <span className="text-accent">“…to THIS branch?”</span>. Collapsing them into one check is how multi-tenant
              systems leak data across tenants.
            </FooterNote>
          </>
        }
      >
        <DiagramScroll>
        <svg
          viewBox="0 0 1000 330"
          className="block w-full"
          role="img"
          aria-label="RBAC guard chain: every request passes five globally-registered guards in order — JwtAuth, Roles, Permission, BranchAccess and Throttler — before any handler runs. A Staff user who holds the orders.view permission is still rejected with a 403 by BranchAccessGuard when she requests a branch outside her allowedBranchIds, while a Manager whose role has allBranchAccess passes through to the handler."
        >
          {/* the chain rail */}
          <line x1={N.req.x} y1={Y} x2={N.throttle.x} y2={Y} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* pass-through arrows between guards, lit as they're passed */}
          {CHAIN.map((id, idx) => {
            const passed = !reduced && step.passed.includes(id);
            const prev = idx === 0 ? N.req : N[CHAIN[idx - 1]];
            const cur = N[id];
            const x1 = prev.x + prev.w / 2;
            const x2 = cur.x - cur.w / 2;
            return (
              <line
                key={`rail-${id}`}
                x1={x1}
                y1={Y}
                x2={x2}
                y2={Y}
                stroke={passed ? "var(--t-good)" : "var(--t-line)"}
                strokeWidth={passed ? 2.4 : 1.5}
              />
            );
          })}

          {/* guard ordinals */}
          {CHAIN.map((id, idx) => (
            <text
              key={`ord-${id}`}
              x={N[id].x}
              y={Y + N[id].h / 2 + 16}
              textAnchor="middle"
              fontSize={8}
              fontWeight={700}
              fontFamily="var(--font-mono)"
              fill={!reduced && step.passed.includes(id) ? "var(--t-good)" : "var(--t-muted)"}
            >
              guard {idx + 1}
            </text>
          ))}

          {/* branch → 403 (the deny path) */}
          <line
            x1={N.branch.x}
            y1={Y + 28}
            x2={N.denied.x}
            y2={262 - 26}
            stroke={denied ? "var(--t-bad)" : "var(--t-line)"}
            strokeWidth={denied ? 2 : 1.2}
            strokeDasharray="4 5"
          />
          {/* throttle → handler (the allow path) */}
          <line
            x1={N.throttle.x}
            y1={Y + 28}
            x2={N.handler.x}
            y2={262 - 26}
            stroke={!reduced && step.passed.includes("throttle") ? "var(--t-good)" : "var(--t-line)"}
            strokeWidth={!reduced && step.passed.includes("throttle") ? 2 : 1.2}
            strokeDasharray="4 5"
          />

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode
              key={id}
              node={N[id]}
              active={activeNode === id && !reduced && !denied}
              good={!reduced && (step.passed.includes(id) || (id === "handler" && step.passed.includes("throttle")))}
              danger={(denied && id === step.deny) || (denied && id === "denied" && activeNode === "denied")}
            />
          ))}

          {!reduced && target && (
            <MoneyPacket target={target} dur={step.dur} tone={step.tone === "err" ? "err" : step.tone === "ok" ? "ok" : "accent"} scaleAt={!!step.at} />
          )}
        </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
