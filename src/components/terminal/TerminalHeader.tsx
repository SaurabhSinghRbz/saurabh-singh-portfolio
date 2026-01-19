/**
 * TerminalHeader.tsx
 * ─────────────────────────────────────────────────────────
 * Realistic terminal header with traffic lights, session
 * label, and live animated status indicators.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useState } from "react";
import { HEADER_STATUS_ITEMS } from "./terminalData";

export default function TerminalHeader() {
  // Animated uptime counter
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="term-header flex flex-col border-b sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: "var(--term-line, var(--t-line))" }}
    >
      {/* Top row: traffic lights + session */}
      <div className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
        {/* Traffic lights */}
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f57] opacity-80 transition-opacity hover:opacity-100" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e] opacity-80 transition-opacity hover:opacity-100" />
          <span className="h-3 w-3 rounded-full bg-[#28c840] opacity-80 transition-opacity hover:opacity-100" />
        </div>

        {/* Session label */}
        <p className="font-mono text-[11px] tracking-wide" style={{ color: "var(--term-muted, var(--t-muted))" }}>
          saurabh@production-cluster
          <span className="hidden sm:inline"> — portfolio session — 120×40</span>
        </p>
      </div>

      {/* Status indicators */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 sm:border-t-0 sm:px-5 sm:py-2.5"
        style={{ borderColor: "var(--term-line, var(--t-line))" }}
      >
        {HEADER_STATUS_ITEMS.map((item) => (
          <span
            key={item.label}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:animate-none"
                style={{ backgroundColor: "var(--term-good, var(--t-good))" }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "var(--term-good, var(--t-good))" }}
              />
            </span>
            <span style={{ color: "var(--term-muted, var(--t-muted))" }}>{item.label}:</span>
            <span style={{ color: "var(--term-good, var(--t-good))" }}>{item.status}</span>
          </span>
        ))}

        {/* Live uptime counter */}
        <span className="hidden font-mono text-[10px] tracking-[0.14em] sm:inline"
          style={{ color: "var(--term-accent, var(--t-accent))" }}
        >
          ⏱ {formatUptime(uptimeSeconds)}
        </span>
      </div>
    </div>
  );
}
