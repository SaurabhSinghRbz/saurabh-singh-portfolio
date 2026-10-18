"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import DiagramScroll from "@/components/ui/DiagramScroll";

/* ------------------------------------------------------------------ *
 * EncryptionProxyDiagram — the architectural signature of the
 * service: an Express proxy sits IN FRONT of Hasura. Every GraphQL
 * call is routed through /api/v1/graphql, where the query is parsed
 * and columns listed in crypto_table_mapping are encrypted on write
 * and decrypted on read (lib/hasura.js + helper/hasura/parser). The
 * database only ever holds ciphertext, and a client that smuggles an
 * admin-secret header is rejected outright.
 * ------------------------------------------------------------------ */

const NODES = {
  client: { x: 74, y: 150, w: 108, h: 60, title: "CLIENT", sub: "GraphQL query" },
  proxy: { x: 320, y: 150, w: 160, h: 72, title: "EXPRESS PROXY", sub: "crypto_table_mapping" },
  hasura: { x: 566, y: 150, w: 132, h: 64, title: "HASURA", sub: "GraphQL engine" },
  pg: { x: 792, y: 150, w: 116, h: 64, title: "POSTGRES", sub: "ciphertext at rest" },
} as const;

type NodeId = keyof typeof NODES;
type Tone = "ok" | "err" | "info" | "accent" | "muted";
type Data = "PLAINTEXT" | "CIPHERTEXT" | null;

type Step = {
  move?: { from: NodeId; to: NodeId; lane?: "write" | "read" };
  at?: NodeId;
  log: string;
  tone: Tone;
  data?: Data;
  payload?: string;
  phase: "WRITE" | "READ" | "SECURITY";
  hidePacket?: boolean;
  dur: number;
};

const SCRIPT: Step[] = [
  // ---- write path ----
  { move: { from: "client", to: "proxy", lane: "write" }, log: "mutation insert_message · { email: \"a@b.com\", mobile: \"98•••\" }", tone: "info", phase: "WRITE", data: "PLAINTEXT", payload: 'email: "a@b.com"', dur: 1500 },
  { at: "proxy", log: "parse query → crypto_table_mapping says messages.email, .recipient are PII", tone: "accent", phase: "WRITE", data: "PLAINTEXT", payload: 'email: "a@b.com"', dur: 1700 },
  { at: "proxy", log: "encrypt flagged variables (woohooKMS / aes256) before they leave the process", tone: "accent", phase: "WRITE", data: "CIPHERTEXT", payload: 'email: "enc:9f3a…"', dur: 1800 },
  { move: { from: "proxy", to: "hasura", lane: "write" }, log: "forward to Hasura with encrypted variables only", tone: "info", phase: "WRITE", data: "CIPHERTEXT", payload: 'email: "enc:9f3a…"', dur: 1300 },
  { move: { from: "hasura", to: "pg", lane: "write" }, log: "row written — the database has never seen the plaintext", tone: "ok", phase: "WRITE", data: "CIPHERTEXT", payload: 'email: "enc:9f3a…"', dur: 1500 },
  // ---- read path ----
  { move: { from: "client", to: "pg", lane: "read" }, log: "later: query messages → proxy → Hasura → Postgres", tone: "info", phase: "READ", data: "CIPHERTEXT", payload: 'email: "enc:9f3a…"', dur: 1600 },
  { move: { from: "pg", to: "proxy", lane: "read" }, log: "rows come back as ciphertext", tone: "info", phase: "READ", data: "CIPHERTEXT", payload: 'email: "enc:9f3a…"', dur: 1500 },
  { at: "proxy", log: "decrypt flagged columns for this authorized caller only", tone: "accent", phase: "READ", data: "PLAINTEXT", payload: 'email: "a@b.com"', dur: 1700 },
  { move: { from: "proxy", to: "client", lane: "read" }, log: "plaintext returned to the client — GDPR boundary held at the edge", tone: "ok", phase: "READ", data: "PLAINTEXT", payload: 'email: "a@b.com"', dur: 1500 },
  // ---- security ----
  { at: "proxy", log: "a client that smuggles x-hasura-admin-secret is rejected with 401 — only the proxy holds it", tone: "err", phase: "SECURITY", dur: 2000 },
];

const toneText: Record<Tone, string> = {
  ok: "text-good",
  err: "text-bad",
  info: "text-ink/85",
  accent: "text-accent",
  muted: "text-muted",
};

function NodeBox({ node, active, danger }: { node: (typeof NODES)[NodeId]; active: boolean; danger?: boolean }) {
  const stroke = danger ? "var(--t-bad)" : active ? "var(--t-accent)" : "var(--t-line-2)";
  return (
    <g>
      <rect x={node.x - node.w / 2} y={node.y - node.h / 2} width={node.w} height={node.h} rx={10} fill="var(--t-surface)" stroke={stroke} strokeWidth={active || danger ? 2 : 1} />
      <text x={node.x} y={node.y - 3} textAnchor="middle" fill="var(--t-ink)" fontSize={13} fontWeight={600} fontFamily="var(--font-mono)">
        {node.title}
      </text>
      <text x={node.x} y={node.y + 15} textAnchor="middle" fill="var(--t-muted)" fontSize={10} fontFamily="var(--font-mono)">
        {node.sub}
      </text>
    </g>
  );
}

export default function EncryptionProxyDiagram() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const [i, setI] = useState(0);
  const step = SCRIPT[i];

  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setI((p) => (p + 1) % SCRIPT.length), step.dur);
    return () => clearTimeout(t);
  }, [i, inView, reduced, step.dur]);

  const activeNode: NodeId | null = step.at ?? step.move?.to ?? null;
  const target = step.move
    ? { x: [NODES[step.move.from].x, NODES[step.move.to].x], y: [NODES[step.move.from].y, NODES[step.move.to].y] }
    : step.at
      ? { x: [NODES[step.at].x], y: [NODES[step.at].y] }
      : null;

  const dataColor = step.data === "CIPHERTEXT" ? "var(--t-good)" : step.data === "PLAINTEXT" ? "var(--t-accent)" : "var(--t-muted)";

  return (
    <div ref={rootRef} className="not-prose">
      <div className="overflow-hidden rounded-xl border border-line bg-surface-2/40">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            PII encryption proxy — live replay
          </p>
          <div className="flex items-center gap-3">
            {!reduced && (
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${step.phase === "SECURITY" ? "bg-bad/15 text-bad" : "bg-surface-2 text-muted"}`}>
                {step.phase}
              </span>
            )}
            {!reduced && <p className="font-mono text-[10px] text-muted">step {i + 1}/{SCRIPT.length}</p>}
          </div>
        </div>

        <DiagramScroll>
        <svg viewBox="0 0 920 250" className="block w-full" role="img" aria-label="Animated diagram: an Express proxy sits in front of Hasura. On writes it encrypts PII columns before they reach Hasura and Postgres, so the database stores only ciphertext; on reads it decrypts for authorized callers; a client sending an admin-secret header is rejected.">
          <line x1={NODES.client.x} y1={150} x2={NODES.pg.x} y2={150} stroke="var(--t-line)" strokeWidth={1.5} />

          {/* payload state chip travelling with the packet, shown above the row */}
          {!reduced && step.data && step.payload && (
            <g>
              <rect x={NODES.proxy.x - 96} y={54} width={192} height={26} rx={6} fill="var(--t-surface)" stroke={dataColor} />
              <text x={NODES.proxy.x} y={71} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill={dataColor}>
                {step.payload}
              </text>
              <text x={NODES.proxy.x} y={98} textAnchor="middle" fontSize={9} fontFamily="var(--font-mono)" fill={dataColor} letterSpacing="0.1em">
                {step.data}
              </text>
            </g>
          )}

          {(Object.keys(NODES) as NodeId[]).map((id) => (
            <NodeBox key={id} node={NODES[id]} active={activeNode === id && !reduced} danger={id === "proxy" && step.phase === "SECURITY" && !reduced} />
          ))}

          {/* lock glyph on postgres when ciphertext */}
          {!reduced && step.data === "CIPHERTEXT" && (
            <text x={NODES.pg.x} y={210} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" fill="var(--t-good)">
              🔒 encrypted
            </text>
          )}

          {!reduced && target && (
            <motion.g
              animate={{ x: target.x, y: target.y, scale: step.at ? [1, 1.4, 1] : 1 }}
              transition={{ duration: step.dur / 1000, ease: "easeInOut" }}
            >
              <circle r={7} fill={dataColor} />
              <circle r={12} fill={dataColor} opacity={0.25} />
            </motion.g>
          )}
        </svg>
        </DiagramScroll>

        <div className="border-t border-line px-4 py-3">
          {reduced ? (
            <p className="font-mono text-xs text-muted">
              Animation disabled (reduced motion). The encryption proxy is described in the prose below.
            </p>
          ) : (
            <p key={i} className={`font-mono text-xs sm:text-[13px] ${toneText[step.tone]}`}>
              <span className="text-muted">[proxy]</span> {step.log}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
