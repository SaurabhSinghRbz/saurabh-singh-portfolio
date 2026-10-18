"use client";

import { useState } from "react";

/**
 * Wraps a deep-dive diagram SVG. Full width from `sm` up; on phones the SVG
 * keeps a readable minimum width (see .diagram-scroll in globals.css) and the
 * frame scrolls sideways, with a hint that disappears once the visitor swipes.
 */
export default function DiagramScroll({ children }: { children: React.ReactNode }) {
  const [swiped, setSwiped] = useState(false);

  return (
    <div className="relative">
      <div
        className="diagram-scroll"
        onScroll={(e) => {
          if (!swiped && e.currentTarget.scrollLeft > 24) setSwiped(true);
        }}
      >
        {children}
      </div>
      {!swiped && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 right-2 rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] text-muted backdrop-blur sm:hidden"
        >
          swipe →
        </span>
      )}
    </div>
  );
}
