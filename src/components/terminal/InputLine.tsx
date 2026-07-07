/**
 * InputLine.tsx
 * ─────────────────────────────────────────────────────────
 * Clean terminal input — no outline, no border, no box.
 * Just the prompt and a blinking cursor, exactly like a
 * real terminal.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useEffect, useRef } from "react";

type Props = {
  value: string;
  suggestion: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  visible: boolean;
};

const PROMPT = "saurabh@prod:~$";

export default function InputLine({ value, suggestion, onChange, onKeyDown, visible }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when visible. `preventScroll` matters here: a plain .focus()
  // scrolls the whole page to bring the element into view, which would yank
  // the user to the terminal the instant boot finishes — even if they were
  // reading a different section (boot starts as soon as the terminal is
  // merely 5% on-screen, see HeroTerminal's IntersectionObserver).
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="flex items-center gap-2 pt-1 pb-2"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
    >
      {/* Prompt */}
      <span
        className="shrink-0 font-mono text-[12px] font-semibold sm:text-[13px]"
        style={{ color: "var(--term-accent)" }}
      >
        {PROMPT}
      </span>

      {/* Input — completely borderless, no outline, like a real terminal */}
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="term-input w-full border-0 bg-transparent p-0 font-mono text-[12px] shadow-none ring-0 sm:text-[13px]"
          style={{
            color: "var(--term-ink)",
            caretColor: "var(--term-accent)",
            outline: "none",
          }}
          placeholder="type a command..."
          aria-label="Terminal command input"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {/* Ghost text for tab completion */}
        {suggestion && (
          <span
            className="pointer-events-none absolute left-0 top-0 font-mono text-[12px] sm:text-[13px]"
            style={{ color: "var(--term-muted)", opacity: 0.4 }}
            aria-hidden
          >
            <span className="invisible">{value}</span>
            <span>{suggestion}</span>
            <span
              className="ml-2 text-[10px] uppercase tracking-wider"
              style={{ color: "var(--term-muted)", opacity: 0.6 }}
            >
              tab
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
