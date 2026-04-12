"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Topology = dynamic(() => import("./Topology"), { ssr: false });

/**
 * Mounts the 3D topology only on the client and only without
 * prefers-reduced-motion. Colors follow the active theme and the
 * scene remounts on toggle — same contract as HeroCanvas.
 */
export default function TopologyCanvas() {
  const [colors, setColors] = useState<{ accent: string; ink: string } | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const read = () => {
      const css = getComputedStyle(document.documentElement);
      setColors({
        accent: css.getPropertyValue("--t-accent").trim() || "#ff8a66",
        ink: css.getPropertyValue("--t-ink").trim() || "#e8efea",
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  if (!colors) return null;

  return (
    <div className="absolute inset-0" aria-hidden>
      <Topology key={colors.accent} accent={colors.accent} ink={colors.ink} />
    </div>
  );
}
