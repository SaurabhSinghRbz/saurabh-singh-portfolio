"use client";

import { useEffect, useState } from "react";
import { ACTIVE_PALETTE, palettes, type PaletteName } from "@/theme/palettes";

const KEY = "palette-preview";
const NAMES = Object.keys(palettes) as PaletteName[];

/**
 * DEV ONLY (rendered by app/layout.tsx when NODE_ENV === "development").
 * Previews every palette in src/theme/palettes.ts live, in both themes,
 * without editing code. The choice is remembered in localStorage for the
 * dev session only — to ship one, set ACTIVE_PALETTE in palettes.ts.
 */
export default function PaletteSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<PaletteName>(ACTIVE_PALETTE);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const p = document.documentElement.dataset.palette as PaletteName | undefined;
    if (p && p in palettes) setCurrent(p);
    setTheme(document.documentElement.dataset.theme ?? "dark");
  }, []);

  const pick = (name: PaletteName) => {
    document.documentElement.dataset.palette = name;
    try {
      if (name === ACTIVE_PALETTE) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, name);
    } catch {}
    setCurrent(name);
  };

  const flipTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[90] font-mono text-[11px]">
      {open && (
        <div className="mb-2 w-72 overflow-hidden rounded-xl border border-line-2 bg-surface shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="uppercase tracking-[0.16em] text-muted">Palette · dev only</span>
            <button onClick={flipTheme} className="rounded border border-line px-2 py-0.5 text-ink hover:border-accent">
              {theme === "dark" ? "→ light" : "→ dark"}
            </button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto p-1.5">
            {NAMES.map((n) => {
              const p = palettes[n];
              const on = n === current;
              return (
                <li key={n}>
                  <button
                    onClick={() => pick(n)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                      on ? "bg-surface-2" : "hover:bg-surface-2"
                    }`}
                  >
                    {/* light | dark swatch pair */}
                    <span className="flex shrink-0 overflow-hidden rounded-md border border-line">
                      <span className="flex h-7 w-7 items-center justify-center" style={{ background: p.light.bg }}>
                        <span className="h-3 w-3 rounded-full" style={{ background: p.light.accent }} />
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center" style={{ background: p.dark.bg }}>
                        <span className="h-3 w-3 rounded-full" style={{ background: p.dark.accent }} />
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className={`block ${on ? "text-accent" : "text-ink"}`}>
                        {p.label}
                        {n === ACTIVE_PALETTE && <span className="text-muted"> · active</span>}
                      </span>
                      <span className="block truncate text-[10px] text-muted">{n}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="border-t border-line px-3 py-2 text-[10px] leading-snug text-muted">
            To ship one: set <span className="text-ink">ACTIVE_PALETTE = &quot;{current}&quot;</span> in src/theme/palettes.ts
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-2 text-ink shadow-lg hover:border-accent"
        aria-label="Toggle palette switcher"
      >
        <span className="h-3 w-3 rounded-full bg-accent" />
        {palettes[current].label}
      </button>
    </div>
  );
}
