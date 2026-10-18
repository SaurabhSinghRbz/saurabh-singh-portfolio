"use client";

import { useEffect, useState } from "react";

/**
 * Client-side performance budget for the decorative WebGL layers.
 *
 * - "none": reduced motion, Data Saver, or a low-end device (≤ 2 GB RAM or
 *   ≤ 2 cores) — no three.js is downloaded at all.
 * - "lite": a capable touch device — the hero scene only, never the global
 *   particle background.
 * - "full": a desktop-class pointer device — hero scene + particle background.
 *
 * Read once on mount; the answer is cached for the session.
 */
export type WebGLBudget = "none" | "lite" | "full";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cached: WebGLBudget | null = null;

export function webglBudget(): WebGLBudget {
  if (cached) return cached;
  const nav = navigator as NavigatorHints;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = nav.connection?.saveData === true;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  const lowMemory = (nav.deviceMemory ?? 8) <= 2;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 2;

  if (reduced || saveData || slowNet || lowMemory || fewCores) cached = "none";
  else if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) cached = "full";
  else cached = "lite";
  return cached;
}

/** Runs `cb` once the main thread is idle (falls back to a short timeout). */
export function whenIdle(cb: () => void, timeout = 2500): () => void {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 600);
  return () => window.clearTimeout(id);
}

/** True while the element with `id` is on screen (re-evaluated on mount). */
export function useElementInView(id: string, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) {
      setInView(false);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [id, rootMargin]);
  return inView;
}

/** True while `ref`'s element is on screen. For pausing timers off-screen. */
export function useInViewRef<T extends Element>(ref: React.RefObject<T | null>, rootMargin = "100px"): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
