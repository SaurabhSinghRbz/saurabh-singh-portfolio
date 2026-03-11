"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import type { SkillProficiency } from "@/content/skill-proficiency";

const SkillGalaxy = dynamic(() => import("./SkillGalaxy"), { ssr: false });

/**
 * Client-only wrapper for the 3D skill galaxy.
 * Reads theme colors, handles reduced motion, and passes
 * hover events up to the parent for the detail panel.
 */
export default function SkillGalaxyCanvas({
  onSkillHover,
}: {
  onSkillHover: (skill: SkillProficiency | null) => void;
}) {
  const [colors, setColors] = useState<{
    accent: string;
    ink: string;
  } | null>(null);

  useEffect(() => {
    const read = () => {
      const css = getComputedStyle(document.documentElement);
      setColors({
        accent:
          css.getPropertyValue("--t-accent").trim() || "#ff8a66",
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
    <div className="w-full" style={{ height: "min(60vh, 520px)" }}>
      <SkillGalaxy
        key={colors.accent}
        accent={colors.accent}
        ink={colors.ink}
        onSkillHover={onSkillHover}
      />
    </div>
  );
}
