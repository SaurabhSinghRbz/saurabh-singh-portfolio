"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 1120;

/**
 * Soft accent spotlight that follows the cursor across the page.
 * A fixed-size gradient moved with a GPU transform — the compositor slides it,
 * nothing is repainted per pointer move. Desktop pointer only; skipped for
 * touch and reduced motion.
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
        const el = ref.current;
        if (!el) return;
        el.style.opacity = "1";
        el.style.transform = `translate3d(${e.clientX - SIZE / 2}px, ${e.clientY - SIZE / 2}px, 0)`;
      });
    };
    const onLeave = () => {
      if (ref.current) ref.current.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      <div
        ref={ref}
        className="absolute left-0 top-0 rounded-full opacity-0 transition-opacity duration-300 will-change-transform"
        style={{
          width: SIZE,
          height: SIZE,
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--t-accent) 5%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
