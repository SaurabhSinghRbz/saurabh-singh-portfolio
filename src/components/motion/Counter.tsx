"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Counts up numeric values ("500+", "6", "3") when scrolled into view.
 * Non-numeric values ("Millions") render as-is.
 */
export default function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const match = /^(\d+)(.*)$/.exec(value);
  const [display, setDisplay] = useState(match ? "0" + match[2] : value);

  useEffect(() => {
    if (!match || reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(`${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
