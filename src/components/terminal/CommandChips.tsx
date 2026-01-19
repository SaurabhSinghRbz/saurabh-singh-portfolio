/**
 * CommandChips.tsx
 * ─────────────────────────────────────────────────────────
 * Text-based command hints shown after boot. NOT clickable —
 * commands must be typed by the user, like a real terminal.
 * ─────────────────────────────────────────────────────────
 */

"use client";

type Props = {
  visible: boolean;
};

const HINT_GROUPS = [
  {
    label: "START HERE",
    commands: ["help", "about", "skills", "experience", "projects"],
  },
  {
    label: "GO DEEPER",
    commands: ["architecture", "status", "show metrics", "recruiter", "project smoothpay"],
  },
  {
    label: "FOR FUN",
    commands: ["coffee", "fortune", "unlock", "neofetch"],
  },
];

export default function CommandChips({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      className="px-4 py-3 sm:px-6 sm:py-4"
      style={{ borderTop: "1px solid var(--term-line)" }}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
        {HINT_GROUPS.map((group) => (
          <div key={group.label} className="flex items-baseline gap-2">
            <span
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: "var(--term-muted)" }}
            >
              {group.label}:
            </span>
            <span
              className="font-mono text-[11px] sm:text-[12px]"
              style={{ color: "var(--term-ink)", opacity: 0.7 }}
            >
              {group.commands.join("  ·  ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
