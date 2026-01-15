"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FlowField = dynamic(() => import("./FlowField"), { ssr: false });

/**
 * Loads the WebGL flow field only after mount, and only when the visitor
 * does not prefer reduced motion. Particle color follows the active theme
 * (re-read whenever data-theme changes). Hero text never waits on this.
 */
export default function HeroCanvas() {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const readAccent = () =>
      setColor(
        getComputedStyle(document.documentElement).getPropertyValue("--t-accent").trim() ||
          "#ff8a66",
      );

    readAccent();
    const observer = new MutationObserver(readAccent);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  if (!color) return null;

  return (
    <div className="absolute inset-0" aria-hidden>
      <FlowField key={color} color={color} />
    </div>
  );
}
