"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ParticleNetwork = dynamic(() => import("./ParticleNetwork"), {
  ssr: false,
});

/**
 * Client-only wrapper for the global particle network background.
 * Reads theme colors via CSS custom properties and remounts on
 * theme change. Skipped entirely for reduced-motion users.
 */
export default function ParticleNetworkCanvas() {
  const [colors, setColors] = useState<{
    accent: string;
    line: string;
  } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only show on pointer devices (skip most phones for perf)
    if (!window.matchMedia("(hover: hover)").matches) return;

    const read = () => {
      const css = getComputedStyle(document.documentElement);
      setColors({
        accent:
          css.getPropertyValue("--t-accent").trim() || "#ff8a66",
        line: css.getPropertyValue("--t-muted").trim() || "#8fa39a",
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  if (!colors) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
      aria-hidden
    >
      <ParticleNetwork
        key={colors.accent}
        color={colors.accent}
        lineColor={colors.line}
      />
    </div>
  );
}
