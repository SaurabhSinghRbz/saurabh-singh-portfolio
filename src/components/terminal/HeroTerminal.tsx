/**
 * HeroTerminal.tsx
 * ─────────────────────────────────────────────────────────
 * Root terminal component — the primary attraction of the
 * portfolio. Occupies 80–90% viewport width, min 700px
 * height. Orchestrates boot sequence, output, input,
 * command chips, themes, and visual effects.
 * ─────────────────────────────────────────────────────────
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTerminalEngine } from "./useTerminalEngine";
import { ALL_COMMANDS } from "./terminalData";
import TerminalHeader from "./TerminalHeader";
import OutputRenderer from "./OutputRenderer";
import InputLine from "./InputLine";
import StatusBar from "./StatusBar";

export default function HeroTerminal() {
  const [state, actions] = useTerminalEngine();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  /* ------------------------------------------------------------------ *
   * BOOT ON SCROLL INTO VIEW
   * ------------------------------------------------------------------ */

  useEffect(() => {
    const el = rootRef.current;
    if (!el || startedRef.current) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();
        actions.startBoot();
      },
      { threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [actions]);

  /* ------------------------------------------------------------------ *
   * APPLY THEME CSS VARIABLES
   * ------------------------------------------------------------------ */

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Clear old vars
    const props = [
      "--term-bg", "--term-surface", "--term-ink", "--term-muted",
      "--term-accent", "--term-good", "--term-bad", "--term-line", "--term-glow",
    ];
    props.forEach((p) => el.style.removeProperty(p));

    // Apply new vars
    Object.entries(state.currentTheme.vars).forEach(([key, value]) => {
      el.style.setProperty(key, value);
    });
  }, [state.currentTheme]);

  /* ------------------------------------------------------------------ *
   * FOCUS TERMINAL ON CLICK
   * ------------------------------------------------------------------ */

  const handleClick = useCallback(() => {
    // Find the input inside and focus it (preventScroll: clicking inside an
    // already-visible terminal shouldn't cause the page to jump).
    const input = rootRef.current?.querySelector<HTMLInputElement>("input");
    if (input) input.focus({ preventScroll: true });
  }, []);

  /* ------------------------------------------------------------------ *
   * MATRIX RAIN EFFECT
   * ------------------------------------------------------------------ */

  const MatrixOverlay = () => {
    if (!state.matrixActive) return null;
    return (
      <div className="term-matrix-overlay pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-2xl">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="term-matrix-column absolute top-0 font-mono text-[11px] leading-[1.2]"
            style={{
              left: `${(i / 30) * 100}%`,
              color: "var(--term-good, #00ff41)",
              opacity: 0.6 + Math.random() * 0.4,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
            }}
            aria-hidden
          >
            {Array.from({ length: 40 }).map((_, j) => (
              <span key={j} className="block">
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  };

  /* ------------------------------------------------------------------ *
   * HACK OVERLAY
   * ------------------------------------------------------------------ */

  const HackOverlay = () => {
    if (!state.hackActive) return null;
    return (
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-2xl"
        style={{
          background: "rgba(0, 255, 0, 0.03)",
          boxShadow: "inset 0 0 60px rgba(0, 255, 0, 0.1)",
        }}
        aria-hidden
      />
    );
  };

  /* ------------------------------------------------------------------ *
   * RENDER
   * ------------------------------------------------------------------ */

  return (
    <div
      ref={rootRef}
      className="term-root relative flex w-full flex-col overflow-hidden rounded-xl border sm:rounded-2xl"
      style={{
        minHeight: "clamp(400px, 62vh, 760px)",
        maxHeight: "78vh",
        borderColor: "var(--term-line, var(--t-line))",
        background: "var(--term-bg, var(--t-surface))",
        boxShadow: `
          0 0 0 1px var(--term-line, rgba(143, 163, 154, 0.08)),
          0 25px 80px -20px rgba(0, 0, 0, 0.6),
          0 0 120px -40px var(--term-glow, rgba(255, 138, 102, 0.08))
        `,
      }}
      onClick={handleClick}
    >
      {/* Scanline overlay */}
      <div className="term-scanline pointer-events-none absolute inset-0 z-20 rounded-2xl" aria-hidden />

      {/* Matrix rain */}
      <MatrixOverlay />

      {/* Hack glow */}
      <HackOverlay />

      {/* CRT subtle glow at edges */}
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
        style={{
          boxShadow: `inset 0 0 80px -20px var(--term-glow, rgba(255, 138, 102, 0.06))`,
        }}
        aria-hidden
      />

      {/* Header */}
      <TerminalHeader />

      {/* Main body: a single continuous scrollback — output, boot cursor,
          and the live input line all live in the same scrolling region,
          like a real terminal, instead of a fixed input bar pinned below. */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <OutputRenderer lines={state.lines}>
          {/* Boot cursor while booting */}
          {state.booting && !state.booted && (
            <span
              className="terminal-cursor inline-block h-4 w-2 align-middle"
              style={{ backgroundColor: "var(--term-accent, var(--t-accent))" }}
              aria-hidden
            />
          )}

          {/* Input line — last line in the scrollback, not a fixed footer */}
          <InputLine
            value={state.input}
            suggestion={state.suggestion}
            onChange={actions.setInput}
            onKeyDown={actions.handleKeyDown}
            visible={state.booted}
          />
        </OutputRenderer>
      </div>

      {/* Status bar */}
      <StatusBar
        theme={state.currentTheme}
        commandCount={ALL_COMMANDS.length}
      />
    </div>
  );
}
