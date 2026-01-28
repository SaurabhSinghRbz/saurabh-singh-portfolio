"use client";

import { motion, useReducedMotion, type Target } from "framer-motion";

type RevealMode = "fade-up" | "blur-to-focus" | "depth-rise" | "fade";

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  /** Animation mode. Default: "fade-up" */
  mode?: RevealMode;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const variants: Record<RevealMode, { initial: Target; animate: Target }> = {
  "fade-up": {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
  },
  "blur-to-focus": {
    initial: { opacity: 0, filter: "blur(8px)", y: 6 },
    animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  "depth-rise": {
    initial: { opacity: 0, scale: 0.96, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};

/**
 * Multi-mode reveal animation on first entry into viewport.
 * - fade-up: classic slide + fade (default)
 * - blur-to-focus: starts blurred, sharpens on entry
 * - depth-rise: scales from 0.96 + translateY
 * - fade: opacity only
 *
 * All modes instant under reduced motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  mode = "fade-up",
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  const v = variants[mode];

  return (
    <motion.div
      className={className}
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
