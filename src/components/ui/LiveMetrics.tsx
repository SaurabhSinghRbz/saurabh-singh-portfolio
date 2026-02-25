"use client";

import { useEffect, useState, useRef } from "react";

/**
 * LiveMetrics — simulated live deployment metrics that update periodically.
 * Shows Requests/sec, Response Time, Server Status, Deploy Version.
 * Compact monospace design with accent-colored values.
 */

type MetricDef = {
  label: string;
  value?: string;
  isStatus?: boolean;
  min?: number;
  max?: number;
  suffix?: string;
};

const METRICS: MetricDef[] = [
  { label: "req/s", min: 380, max: 640, suffix: "" },
  { label: "p99", min: 8, max: 24, suffix: "ms" },
  { label: "status", value: "healthy", isStatus: true },
  { label: "deploy", value: "v2.4.1" },
];

export default function LiveMetrics({ className }: { className?: string }) {
  const [values, setValues] = useState<string[]>(
    METRICS.map((m) =>
      m.isStatus
        ? m.value!
        : m.min
          ? `${Math.round(m.min + Math.random() * (m.max! - m.min))}${m.suffix || ""}`
          : m.value!,
    ),
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setValues(
        METRICS.map((m) =>
          m.isStatus
            ? m.value!
            : m.min
              ? `${Math.round(m.min + Math.random() * (m.max! - m.min))}${m.suffix || ""}`
              : m.value!,
        ),
      );
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] ${className || ""}`}
    >
      {METRICS.map((m, i) => (
        <span key={m.label} className="flex items-center gap-1.5">
          <span className="text-muted uppercase">{m.label}</span>
          {m.isStatus ? (
            <span className="flex items-center gap-1 text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" />
              {values[i]}
            </span>
          ) : (
            <span className="text-accent tabular-nums">{values[i]}</span>
          )}
        </span>
      ))}
    </div>
  );
}
