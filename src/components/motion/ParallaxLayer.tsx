"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

type ParallaxLayerProps = {
  children: React.ReactNode;
  /** Speed multiplier: 0 = no movement, 1 = full scroll displacement. Negative = reverse. */
  speed?: number;
  /** Base offset in pixels at scroll=0 */
  offset?: number;
  className?: string;
};

/**
 * Wraps children in a scroll-linked parallax layer. Each layer moves at
 * a different speed relative to the page scroll, creating realistic depth.
 * GPU-accelerated via translate3d. Falls back to static in reduced motion.
 */
export default function ParallaxLayer({
  children,
  speed = 0.2,
  offset = 0,
  className,
}: ParallaxLayerProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [offset - speed * 80, offset + speed * 80],
  );

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      style={{ y, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
