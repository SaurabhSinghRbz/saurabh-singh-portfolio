"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Soft accent spotlight that follows the cursor across the page.
 * Desktop pointer only; skipped for touch and reduced motion.
 */
export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    setEnabled(true);

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.background = `radial-gradient(560px circle at ${e.clientX}px ${e.clientY}px, color-mix(in srgb, var(--t-accent) 5%, transparent), transparent 70%)`;
        }
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!enabled) return null;
  return <div ref={ref} className="pointer-events-none fixed inset-0 z-40" aria-hidden />;
}
