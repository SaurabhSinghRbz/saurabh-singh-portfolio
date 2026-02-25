"use client";

import { useEffect, useState, useRef } from "react";

/**
 * SystemStatus — a live system dashboard widget that simulates
 * realistic backend metrics. Updates periodically to feel alive.
 * Glassmorphism card with pulsing status indicators.
 */

type StatusItem = {
  label: string;
  status: string;
  ok: boolean;
};

const BASE_ITEMS: StatusItem[] = [
  { label: "API Gateway", status: "Online", ok: true },
  { label: "Database", status: "Connected", ok: true },
  { label: "Queue Workers", status: "Healthy", ok: true },
  { label: "Cloud Run", status: "Active", ok: true },
  { label: "CI/CD Pipeline", status: "Passing", ok: true },
];

type Metric = {
  label: string;
  value: number;
  suffix: string;
  min: number;
  max: number;
};

const BASE_METRICS: Metric[] = [
  { label: "Requests", value: 512, suffix: "/s", min: 380, max: 640 },
  { label: "Latency", value: 12, suffix: "ms", min: 8, max: 28 },
  { label: "Uptime", value: 99.97, suffix: "%", min: 99.9, max: 99.99 },
];

export default function SystemStatus() {
  const [metrics, setMetrics] = useState(BASE_METRICS);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Small delay so it doesn't compete with hero entrance
    const show = setTimeout(() => setVisible(true), 2000);

    intervalRef.current = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => ({
          ...m,
          value:
            m.suffix === "%"
              ? Math.round((m.min + Math.random() * (m.max - m.min)) * 100) / 100
              : Math.round(m.min + Math.random() * (m.max - m.min)),
        })),
      );
    }, 3500);

    return () => {
      clearTimeout(show);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`glass-panel rounded-xl p-4 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
      style={{ maxWidth: 240 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-good">
          All Systems Operational
        </span>
      </div>

      {/* Status items */}
      <ul className="space-y-1.5 mb-3">
        {BASE_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex items-center justify-between font-mono text-[10px]"
          >
            <span className="text-muted">{item.label}</span>
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  item.ok ? "bg-good" : "bg-bad"
                }`}
              />
              <span className={item.ok ? "text-good" : "text-bad"}>
                {item.status}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div className="h-px bg-line mb-3" />

      {/* Live metrics */}
      <div className="grid grid-cols-3 gap-2">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="font-mono text-sm text-accent tabular-nums">
              {m.suffix === "%"
                ? m.value.toFixed(2)
                : m.value}
              <span className="text-[9px] text-muted">{m.suffix}</span>
            </p>
            <p className="font-mono text-[8px] text-muted uppercase tracking-wide">
              {m.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
