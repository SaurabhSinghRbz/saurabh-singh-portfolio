"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Premium 3D perspective tilt on hover with:
 * - Moving glare highlight
 * - Dynamic shadow that follows tilt direction
 * - Reflective light sweep on hover
 *
 * Falls back to a plain div on touch devices and reduced motion.
 */
export default function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(
    useTransform(py, [0, 1], [8, -8]),
    { stiffness: 250, damping: 25 },
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-10, 10]),
    { stiffness: 250, damping: 25 },
  );

  // Glare effect
  const glareX = useTransform(px, [0, 1], ["20%", "80%"]);
  const glareY = useTransform(py, [0, 1], ["15%", "85%"]);
  const glare = useMotionTemplate`radial-gradient(380px circle at ${glareX} ${glareY}, color-mix(in srgb, var(--t-accent) 10%, transparent), transparent 60%)`;

  // Dynamic shadow follows tilt direction
  const shadowX = useSpring(
    useTransform(px, [0, 1], [12, -12]),
    { stiffness: 200, damping: 30 },
  );
  const shadowY = useSpring(
    useTransform(py, [0, 1], [-8, 8]),
    { stiffness: 200, damping: 30 },
  );
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 40px -12px var(--t-shadow)`;

  useEffect(() => {
    setEnabled(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !reduced,
    );
  }, [reduced]);

  if (!enabled) return <div className={className}>{children}</div>;

  function onPointerMove(e: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div style={{ perspective: 800 }} className={className}>
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: shadow,
        }}
        className="group/tilt relative h-full will-change-transform transition-shadow duration-300"
      >
        {children}
        {/* Glare overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"          style={{ background: glare }}
          aria-hidden
        />
        {/* Reflective sweep on hover */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--t-accent) 5%, transparent) 45%, transparent 50%)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
