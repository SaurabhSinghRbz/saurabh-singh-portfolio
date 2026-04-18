"use client";

import { useEffect, useState } from "react";

/**
 * SignalTransmission — animated SVG pipeline showing message
 * transmission stages when email is copied or a message is sent.
 *
 * Stages: Message → Encrypt → Transmit → Delivered
 * Each node pulses in sequence with accent glow.
 */

const STAGES = [
  { label: "Message", icon: "M4 6h16v12H4z M4 7l8 5 8-5" },
  { label: "Encrypt", icon: "M12 2a5 5 0 0 0-5 5v3H6v10h12V10h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7z" },
  { label: "Transmit", icon: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" },
  { label: "Delivered", icon: "M20 6L9 17l-5-5" },
];

export default function SignalTransmission({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active) {
      setStep(-1);
      return;
    }

    let current = 0;
    setStep(0);

    const interval = setInterval(() => {
      current++;
      if (current >= STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete?.();
        }, 600);
      } else {
        setStep(current);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [active, onComplete]);

  if (!active && step === -1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4" aria-hidden>
      {STAGES.map((stage, i) => (
        <div key={stage.label} className="flex items-center gap-2">
          {/* Node */}
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500 ${
                i <= step
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_-4px_var(--t-accent)]"
                  : "border-line bg-surface"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={i <= step ? "var(--t-accent)" : "var(--t-muted)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-500 ${
                  i === step ? "scale-110" : ""
                }`}
              >
                <path d={stage.icon} />
              </svg>
            </div>
            <span
              className={`font-mono text-[9px] uppercase tracking-wide transition-colors duration-500 ${
                i <= step ? "text-accent" : "text-muted"
              }`}
            >
              {stage.label}
            </span>
          </div>

          {/* Connector */}
          {i < STAGES.length - 1 && (
            <div className="relative w-8 h-px">
              <div className="absolute inset-0 bg-line" />
              <div
                className="absolute inset-y-0 left-0 bg-accent transition-all duration-500"
                style={{
                  width: i < step ? "100%" : "0%",
                }}
              />
              {/* Traveling dot */}
              {i === step - 1 && (
                <span
                  className="absolute top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent"
                  style={{
                    animation: "signalDot 0.5s ease forwards",
                  }}
                />
              )}
            </div>
          )}
        </div>
      ))}

      <style jsx>{`
        @keyframes signalDot {
          from {
            left: 0;
            opacity: 1;
          }
          to {
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
