import { site } from "@/content/site";

/**
 * Lightweight, dependency-free request guards for the contact endpoint.
 *
 * Two layers live here:
 *   1. isAllowedOrigin() — rejects requests that don't come from our own site.
 *      Blocks casual curl/Postman calls that omit the Origin header. The Origin
 *      header IS forgeable, so this is a cheap first filter, not a hard wall.
 *   2. checkRateLimit()  — 5 requests / 10 min per IP, then a 3-hour ban on the
 *      next hit.
 *
 * NOTE ON THE RATE LIMITER: state lives in module memory. On Vercel each
 * serverless instance has its own memory and cold-started instances start
 * empty, so the counters/ban are best-effort — they hold while an instance is
 * warm but reset when it recycles. That's an accepted trade-off for a portfolio
 * (no external store). If abuse ever becomes real, swap checkRateLimit() for an
 * Upstash-Redis-backed version; the route only depends on this signature.
 */

// ── Origin allowlist ────────────────────────────────────────────────────────

function allowedOrigins(): string[] {
  const list: string[] = [site.domain]; // https://iamsaurabh.in

  // Accept the www. variant of the apex domain too.
  try {
    const u = new URL(site.domain);
    list.push(`${u.protocol}//www.${u.host}`);
  } catch {
    /* site.domain is a constant we control; ignore if ever malformed */
  }

  // Extra origins (e.g. a Vercel preview URL) via env, comma-separated.
  const extra = process.env.ALLOWED_ORIGINS;
  if (extra) {
    list.push(...extra.split(",").map((s) => s.trim()).filter(Boolean));
  }

  // Local dev.
  if (process.env.NODE_ENV !== "production") {
    list.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return list;
}

/**
 * True when the request originates from our own site. Browsers always send an
 * Origin header on cross-*and* same-origin POSTs; we fall back to Referer just
 * in case, and reject when neither is present (i.e. not a real browser submit).
 */
export function isAllowedOrigin(req: Request): boolean {
  const allowed = allowedOrigins();

  const origin = req.headers.get("origin");
  if (origin) return allowed.includes(origin);

  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer).origin;
      return allowed.some((o) => {
        try {
          return new URL(o).origin === r;
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  return false;
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

// ── In-memory rate limiter ──────────────────────────────────────────────────

const WINDOW_MS = 10 * 60 * 1000; // rolling window: 10 minutes
const MAX_HITS = 5; // allowed requests per window
const BAN_MS = 3 * 60 * 60 * 1000; // cooldown once the limit is exceeded: 3 hours

type Bucket = {
  hits: number[]; // request timestamps (ms) inside the current window
  bannedUntil: number; // ms epoch; 0 when not banned
};

const buckets = new Map<string, Bucket>();

// Bound memory growth: occasionally drop buckets that are idle and unbanned.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    const hasRecentHit = b.hits.some((t) => now - t < WINDOW_MS);
    const stillBanned = b.bannedUntil > now;
    if (!hasRecentHit && !stillBanned) buckets.delete(key);
  }
}

export type RateResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "banned" };

/**
 * Records a hit for `key` (an IP) and decides whether it's allowed.
 * - Up to 5 hits per 10-minute window pass.
 * - The 6th hit inside the window trips a 3-hour ban; every request during the
 *   ban is rejected and does not extend it.
 */
export function checkRateLimit(key: string): RateResult {
  const now = Date.now();
  sweep(now);

  let b = buckets.get(key);
  if (!b) {
    b = { hits: [], bannedUntil: 0 };
    buckets.set(key, b);
  }

  // Serving out an active ban.
  if (b.bannedUntil > now) {
    return { ok: false, retryAfterSec: Math.ceil((b.bannedUntil - now) / 1000), reason: "banned" };
  }

  // Forget hits that have aged out of the window.
  b.hits = b.hits.filter((t) => now - t < WINDOW_MS);

  // Already used the quota and coming back for more → start the 3-hour ban.
  if (b.hits.length >= MAX_HITS) {
    b.bannedUntil = now + BAN_MS;
    b.hits = [];
    return { ok: false, retryAfterSec: Math.ceil(BAN_MS / 1000), reason: "banned" };
  }

  b.hits.push(now);
  return { ok: true };
}
