"use client";

import { useRef } from "react";
import { SPShell, SPNode, MoneyPacket, FooterNote, useStepper, type SPNodeDef, type Tone } from "./spKit";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * SmoothPayArchitectureDiagram — how the four SmoothPay repos actually
 * link up. Verified against the source:
 *   smooth-pay-portfolio  → marketing site; its only API call is
 *                           POST /demo-request (lead capture).
 *   smooth-pay-web        → ONE React app carrying BOTH the merchant
 *                           portal (POS, orders, menus, loyalty, roles)
 *                           and the platform-admin console (merchants,
 *                           countries, currencies, permissions).
 *   smooth-pay-customer   → the QR-scan PWA: menu, cart, order tracking,
 *                           checkout, payment links, receipts, reviews.
 *   smooth-pay-api        → NestJS + Prisma + PostgreSQL. 30+ modules,
 *                           five global guards, a socket.io gateway,
 *                           FCM push, S3 storage, and Stripe/AFS/Telr.
 * ------------------------------------------------------------------ */

const TOP = 84;
const MID = 176;
const BOT = 272;

const N: Record<string, SPNodeDef> = {
  site: { x: 96, y: TOP, w: 142, h: 54, title: "PORTFOLIO", sub: "marketing site", kind: "app" },
  web: { x: 372, y: TOP, w: 168, h: 56, title: "WEB", sub: "merchant + admin", kind: "app" },
  cust: { x: 668, y: TOP, w: 168, h: 56, title: "CUSTOMER", sub: "QR-scan PWA", kind: "app" },
  api: { x: 456, y: MID, w: 226, h: 56, title: "API · NestJS", sub: "guards → modules → Prisma", kind: "system" },
  db: { x: 152, y: BOT, w: 140, h: 52, title: "POSTGRES", sub: "Prisma schema", kind: "store" },
  rt: { x: 356, y: BOT, w: 148, h: 52, title: "REAL-TIME", sub: "socket.io · FCM", kind: "system" },
  rails: { x: 578, y: BOT, w: 156, h: 54, title: "RAILS", sub: "Stripe · AFS · Telr", kind: "gateway" },
  s3: { x: 786, y: BOT, w: 132, h: 52, title: "S3", sub: "menu images", kind: "store" },
};

type NodeId = keyof typeof N;

type Step = {
  at?: NodeId;
  move?: { from: NodeId; to: NodeId };
  log: string;
  tone: Tone;
  /** edges to light up, as "from>to" */
  edges?: string[];
  dur: number;
};

const SCRIPT: Step[] = [
  {
    at: "site",
    edges: ["site>api"],
    log: "smooth-pay-portfolio — the marketing site. It touches exactly one endpoint: POST /demo-request. A restaurant asks for a demo here, and that lead lands in the same database everything else lives in.",
    tone: "info",
    dur: 3200,
  },
  {
    at: "web",
    edges: ["web>api"],
    log: "smooth-pay-web is TWO products in one React app: the merchant portal (POS, orders, menus, loyalty, roles) and the platform-admin console (merchants, countries, currencies, permissions). Which one you see is decided by your role, not your URL.",
    tone: "accent",
    dur: 3600,
  },
  {
    at: "cust",
    edges: ["cust>api"],
    log: "smooth-pay-customer is the QR-scan PWA — menu, cart, live order tracking, checkout, payment links, receipts, reviews. No install, and login is optional right up until you want cashback.",
    tone: "accent",
    dur: 3300,
  },
  {
    at: "api",
    edges: ["site>api", "web>api", "cust>api"],
    log: "all three talk to one NestJS API — 30+ modules behind five global guards. There is no second backend, no merchant-only service, no customer-only service. One codebase owns the whole domain.",
    tone: "accent",
    dur: 3500,
  },
  {
    move: { from: "api", to: "db" },
    edges: ["api>db"],
    log: "one PostgreSQL schema underneath, through Prisma. Merchant → branches → tables → QR codes → menus → orders → transactions → rewards all hang off the same relational spine, which is why a merchant and a customer can look at one order and both be right.",
    tone: "info",
    dur: 3600,
  },
  {
    move: { from: "api", to: "rt" },
    edges: ["api>rt", "rt>web", "rt>cust"],
    log: "the real-time layer is what makes the apps feel like one system: a socket.io gateway with per-merchant and per-order rooms, plus FCM push. A waiter's tap and a customer's screen are the same event.",
    tone: "ok",
    dur: 3600,
  },
  {
    move: { from: "api", to: "rails" },
    edges: ["api>rails"],
    log: "Stripe, AFS and Telr sit behind one settlement path. The merchant picks the rail; the order code never learns which one it got.",
    tone: "accent",
    dur: 3100,
  },
  {
    move: { from: "api", to: "s3" },
    edges: ["api>s3"],
    log: "S3 holds menu imagery — resized and converted server-side on upload, so a merchant photographing a dish on a phone doesn't ship a 6 MB JPEG to every diner's browser.",
    tone: "info",
    dur: 3200,
  },
  {
    at: "api",
    edges: ["site>api", "web>api", "cust>api", "api>db", "api>rt", "api>rails", "api>s3", "rt>web", "rt>cust"],
    log: "four repos, one domain — and I own all of it: the schema, the guards, the payment integrations, the sockets, and the CSS on both front ends.",
    tone: "ok",
    dur: 4000,
  },
];

const DURATIONS = SCRIPT.map((s) => s.dur);

/** edges, drawn as straight segments between node anchors */
const EDGES: { id: string; from: NodeId; to: NodeId; label?: string }[] = [
  { id: "site>api", from: "site", to: "api" },
  { id: "web>api", from: "web", to: "api" },
  { id: "cust>api", from: "cust", to: "api" },
  { id: "api>db", from: "api", to: "db" },
  { id: "api>rt", from: "api", to: "rt" },
  { id: "api>rails", from: "api", to: "rails" },
  { id: "api>s3", from: "api", to: "s3" },
];

export default function SmoothPayArchitectureDiagram() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { i, reduced } = useStepper(DURATIONS, rootRef);
  const step = SCRIPT[i];

  const activeNode = step.at ?? step.move?.to ?? null;
  const live = (id: string) => !reduced && (step.edges?.includes(id) ?? false);

  const target = step.move
    ? { x: [N[step.move.from].x, N[step.move.to].x], y: [N[step.move.from].y, N[step.move.to].y] }
    : step.at
      ? { x: [N[step.at].x], y: [N[step.at].y] }
      : null;

  return (
    <div ref={rootRef} className="not-prose">
      <SPShell
        title="Four repos, one domain"
        step={i}
        total={SCRIPT.length}
        reduced={reduced}
        legend="▦ front-end app · ▧ SmoothPay service · ▩ data store · ▤ payment rail"
        log={step.log}
        logPrefix="arch"
        logTone={step.tone}
        footer={
          <>
            <FooterNote label="what links them">
              one <span className="text-accent">Prisma schema</span>, one guard chain, one settlement path. The apps are
              different audiences onto the same domain — not different systems that have to be kept in sync.
            </FooterNote>
            <FooterNote label="the real-time seam">
              the merchant portal and the customer PWA never talk to each other. They both listen to the{" "}
              <span className="text-good">same socket rooms</span>, so &ldquo;the waiter tapped accept&rdquo; and &ldquo;my
              screen says accepted&rdquo; are one event, not two writes.
            </FooterNote>
          </>
        }
      >
        <DiagramScroll>
        <svg
          viewBox="0 0 1000 336"
          className="block w-full"
          role="img"
          aria-label="SmoothPay architecture: the marketing site, the merchant-plus-admin web portal, and the customer QR-scan PWA all call one NestJS API, which owns a single PostgreSQL schema through Prisma and fans out to a socket.io and FCM real-time layer, the Stripe, AFS and Telr payment rails, and S3 for menu images. The real-time layer pushes back to both front-end apps."
        >
          {EDGES.map((e) => {
            const a = N[e.from];
            const b = N[e.to];
            const on = live(e.id);
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y + (b.y > a.y ? a.h / 2 : -a.h / 2)}
                x2={b.x}
                y2={b.y + (b.y > a.y ? -b.h / 2 : b.h / 2)}
                stroke={on ? "var(--t-accent)" : "var(--t-line)"}
                strokeWidth={on ? 2.2 : 1.2}
              />
            );
          })}

          {/* real-time push back up to both front-ends — the seam that makes it feel like one app */}
          {(["web", "cust"] as const).map((app) => {
            const on = live(`rt>${app}`);
            return (
              <path
                key={`rt>${app}`}
                d={`M ${N.rt.x} ${BOT - 26} C ${N.rt.x - 60} 120, ${N[app].x - 30} 150, ${N[app].x} ${TOP + 28}`}
                fill="none"
                stroke={on ? "var(--t-good)" : "var(--t-line)"}
                strokeWidth={on ? 2 : 1}
                strokeDasharray="4 5"
              />
            );
          })}
          <text
            x={252}
            y={130}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill={live("rt>web") ? "var(--t-good)" : "var(--t-muted)"}
          >
            live push ↑
          </text>

          {(Object.keys(N) as NodeId[]).map((id) => (
            <SPNode key={id} node={N[id]} active={activeNode === id && !reduced} good={!reduced && id === "api" && i === SCRIPT.length - 1} />
          ))}

          {!reduced && target && <MoneyPacket target={target} dur={step.dur} tone={step.tone === "ok" ? "ok" : "accent"} scaleAt={!!step.at} />}
        </svg>
        </DiagramScroll>
      </SPShell>
    </div>
  );
}
