"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const GLYPHS = "▪▝▘#/\\<>+=·:_";

/**
 * Mono-font text that decodes from queue-noise glyphs into the real
 * label when scrolled into view. Static under reduced motion.
 */
export default function ScrambleText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(text);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (reduced || !inView || started) return;
    setStarted(true);

    let frame = 0;
    const total = Math.max(14, text.length * 1.6);
    const id = setInterval(() => {
      frame++;
      const settled = Math.floor((frame / total) * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || i < settled) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (frame >= total) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 34);
    return () => clearInterval(id);
  }, [inView, reduced, started, text]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {display}
    </span>
  );
}
