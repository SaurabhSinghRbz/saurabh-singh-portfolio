"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * SmartCursor — a premium custom cursor system.
 *
 * - Dot + trailing ring that follows with spring physics
 * - Expands on interactive elements (buttons, links, inputs)
 * - Color shifts on accent-colored elements
 * - Pulse on click
 * - Hidden on touch devices and with reduced motion
 * - Does not affect usability — native cursor is hidden but
 *   the custom dot tracks accurately
 */

export default function SmartCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const raf = useRef(0);
  const expanded = useRef(false);
  const clicking = useRef(false);

  useEffect(() => {
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;
    setEnabled(true);
  }, []);

  const animate = useCallback(() => {
    // Spring the ring toward the dot
    ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15;
    ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
    }
    if (ringRef.current) {
      ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%) scale(${expanded.current ? 1.8 : 1}) ${clicking.current ? "scale(0.85)" : ""}`;
    }

    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      // Check if hovering an interactive element
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target) {
        const interactive = target.closest(
          "a, button, [role='button'], input, textarea, select, [data-cursor='expand']",
        );
        expanded.current = !!interactive;

        if (ringRef.current) {
          ringRef.current.classList.toggle(
            "smart-cursor-ring--expanded",
            !!interactive,
          );
        }
      }
    };

    const onDown = () => {
      clicking.current = true;
      dotRef.current?.classList.add("smart-cursor-dot--click");
    };

    const onUp = () => {
      clicking.current = false;
      dotRef.current?.classList.remove("smart-cursor-dot--click");
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled, animate]);

  if (!enabled) return null;

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringRef}
        className="smart-cursor-ring"
        aria-hidden
      />
      {/* Center dot */}
      <div
        ref={dotRef}
        className="smart-cursor-dot"
        aria-hidden
      />
    </>
  );
}
