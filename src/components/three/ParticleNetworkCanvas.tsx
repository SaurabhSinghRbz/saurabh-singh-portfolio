"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useElementInView, webglBudget } from "@/lib/perf";

const ParticleNetwork = dynamic(() => import("./ParticleNetwork"), {
  ssr: false,
});

/**
 * Global particle-network background — desktop-class devices only.
 *
 * Only one WebGL scene renders at a time: the network is not even mounted
 * until the visitor first scrolls past the hero (which has its own scene), and
 * its render loop pauses whenever the hero is back on screen. Pages without a
 * hero (#top) show it straight away. Colours follow the theme.
 */
export default function ParticleNetworkCanvas() {
  const [colors, setColors] = useState<{ accent: string; line: string } | null>(null);
  const [armed, setArmed] = useState(false);
  const heroInView = useElementInView("top");

  useEffect(() => {
    if (webglBudget() !== "full") return;

    const read = () => {
      const css = getComputedStyle(document.documentElement);
      setColors({
        accent: css.getPropertyValue("--t-accent").trim() || "#ff8a66",
        line: css.getPropertyValue("--t-muted").trim() || "#8fa39a",
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Arm on the first moment the hero is out of view; stay mounted afterwards.
  useEffect(() => {
    if (!heroInView) setArmed(true);
  }, [heroInView]);

  if (!colors || !armed) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 opacity-60 animate-[dialogFade_600ms_ease-out]" aria-hidden>
      <ParticleNetwork key={colors.accent} color={colors.accent} lineColor={colors.line} paused={heroInView} />
    </div>
  );
}
