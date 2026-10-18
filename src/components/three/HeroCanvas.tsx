"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useElementInView, webglBudget, whenIdle } from "@/lib/perf";

const FlowField = dynamic(() => import("./FlowField"), { ssr: false });

/**
 * Loads the WebGL hero scene only on devices within the WebGL budget, and only
 * once the main thread is idle — hero text never waits on three.js. The render
 * loop stops while the hero is scrolled out of view. Particle colour follows
 * the active theme (re-read whenever data-theme changes).
 */
export default function HeroCanvas() {
  const [color, setColor] = useState<string | null>(null);
  const heroInView = useElementInView("top");

  useEffect(() => {
    if (webglBudget() === "none") return;

    const readAccent = () =>
      setColor(
        getComputedStyle(document.documentElement).getPropertyValue("--t-accent").trim() || "#ff8a66",
      );

    const cancelIdle = whenIdle(readAccent);
    const observer = new MutationObserver(readAccent);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      cancelIdle();
      observer.disconnect();
    };
  }, []);

  if (!color) return null;

  return (
    <div className="absolute inset-0 animate-[dialogFade_600ms_ease-out]" aria-hidden>
      <FlowField key={color} color={color} paused={!heroInView} />
    </div>
  );
}
