/**
 * OutputRenderer.tsx
 * ─────────────────────────────────────────────────────────
 * Renders terminal output lines with typewriter, fade,
 * and counter animations. Handles auto-scrolling.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useRef } from "react";
import { type OutputLine, toneColor, toneExtra } from "./terminalData";

type Props = {
  lines: OutputLine[];
};

export default function OutputRenderer({ lines }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [lines.length]);

  return (
    <div
      ref={containerRef}
      className="term-scrollback flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 sm:py-4"
      role="log"
      aria-live="polite"
      aria-label="Terminal output — interactive portfolio for Saurabh Singh"
    >
      {lines.map((line, i) => {
        const extra = toneExtra[line.tone] ?? "";
        const fontWeight = extra.includes("font-weight: 700") ? 700 : extra.includes("font-weight: 600") ? 600 : undefined;
        const opacity = extra.includes("opacity: 0.85") ? 0.85 : extra.includes("opacity: 0.8") ? 0.8 : undefined;

        return (
          <p
            key={`${i}-${line.text.slice(0, 20)}`}
            className="whitespace-pre-wrap break-words font-mono text-[12px] leading-[1.7] sm:text-[13px]"
            style={{
              color: toneColor[line.tone],
              fontWeight,
              opacity,
              animation: line.animate === "fade" ? "termFadeIn 0.3s ease-out" : undefined,
            }}
          >
            {line.text || "\u00A0"}
          </p>
        );
      })}
    </div>
  );
}
