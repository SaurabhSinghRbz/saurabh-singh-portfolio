"use client";

import { useState } from "react";
import { site } from "@/content/site";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }

  return (
    <button
      onClick={copy}
      className="group inline-flex items-center gap-3 rounded-md border border-line-2 px-5 py-3 font-mono text-sm text-ink transition-colors duration-150 hover:border-accent cursor-pointer"
      aria-live="polite"
    >
      {site.email}
      <span className={copied ? "text-good" : "text-muted group-hover:text-accent"}>
        {copied ? "copied ✓" : "copy"}
      </span>
    </button>
  );
}
