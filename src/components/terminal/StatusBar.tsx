/**
 * StatusBar.tsx
 * ─────────────────────────────────────────────────────────
 * Bottom bar showing current theme, command count, and
 * keyboard shortcuts.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { type TerminalTheme } from "./terminalData";

type Props = {
  theme: TerminalTheme;
  commandCount: number;
};

export default function StatusBar({ theme, commandCount }: Props) {
  return (
    <div
      className="term-statusbar flex items-center justify-between border-t px-4 py-1.5 sm:px-5 sm:py-2"
      style={{
        borderColor: "var(--term-line, var(--t-line))",
        background: "rgba(0,0,0,0.15)",
      }}
    >
      {/* Left: theme + commands */}
      <div className="flex items-center gap-4 font-mono text-[10px] tracking-wide">
        <span style={{ color: "var(--term-accent, var(--t-accent))" }}>
          ● {theme.name}
        </span>
        <span style={{ color: "var(--term-muted, var(--t-muted))" }}>
          {commandCount} commands
        </span>
      </div>

      {/* Right: keyboard shortcuts */}
      <div
        className="hidden items-center gap-4 font-mono text-[10px] tracking-wide sm:flex"
        style={{ color: "var(--term-muted, var(--t-muted))" }}
      >
        <span>Tab → autocomplete</span>
        <span>↑↓ → history</span>
        <span>Ctrl+L → clear</span>
      </div>

      {/* Mobile: simplified */}
      <div
        className="flex items-center font-mono text-[10px] tracking-wide sm:hidden"
        style={{ color: "var(--term-muted, var(--t-muted))" }}
      >
        <span>Tab → autocomplete</span>
      </div>
    </div>
  );
}
