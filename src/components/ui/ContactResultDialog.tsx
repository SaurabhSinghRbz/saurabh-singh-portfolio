"use client";

import { useEffect, useRef } from "react";
import { FiCheck, FiAlertTriangle, FiPhone, FiX } from "react-icons/fi";
import { SiWhatsapp } from "react-icons/si";
import { site } from "@/content/site";

type Variant = "success" | "error";

type Props = {
  variant: Variant;
  message?: string;
  onClose: () => void;
};

/**
 * Post-submit dialog. Colors come entirely from the semantic theme tokens
 * (--t-surface / --t-ink / --t-accent / --t-good / --t-bad), so it renders
 * correctly in both light and dark without a single hard-coded color.
 *
 * The "priority line" block mirrors the one in the Contact section: a fast
 * lane for someone who's just reached out. Framed as an incident escalation
 * to match the reliability brand.
 */
export default function ContactResultDialog({ variant, message, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isSuccess = variant === "success";

  // Escape to close + lock body scroll + focus the close button on open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-[dialogFade_180ms_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-dialog-title"
    >
      {/* Backdrop */}
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm cursor-default"
      />

      {/* Card */}
      <div className="glass-panel-strong relative w-full max-w-md rounded-2xl p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)] animate-[dialogPop_220ms_cubic-bezier(0.16,1,0.3,1)]">
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <FiX className="h-4 w-4" aria-hidden />
        </button>

        {/* Status icon */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isSuccess
              ? "bg-[color-mix(in_srgb,var(--t-good)_16%,transparent)] text-good"
              : "bg-[color-mix(in_srgb,var(--t-bad)_16%,transparent)] text-bad"
          }`}
        >
          {isSuccess ? (
            <FiCheck className="h-7 w-7 animate-[checkDraw_400ms_ease-out]" aria-hidden />
          ) : (
            <FiAlertTriangle className="h-6 w-6" aria-hidden />
          )}
        </div>

        <h3
          id="contact-dialog-title"
          className="mt-5 font-display text-2xl text-ink"
        >
          {isSuccess ? "Message transmitted" : "That didn't go through"}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isSuccess
            ? "It landed. A confirmation is on its way to your inbox, and I'll reply within a day — usually much sooner."
            : message ||
              "Something broke on the way. Give it another go, or reach me directly below."}
        </p>

        {/* Priority escalation line — the tricky/urgent contact path */}
        <div className="mt-6 rounded-xl border border-line-2 bg-[color-mix(in_srgb,var(--t-surface)_50%,transparent)] p-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent">
              Priority line · Sev-1
            </p>
          </div>
          <p className="mt-2 text-sm text-ink">
            {isSuccess
              ? "Can't wait for email? If it's genuinely urgent, page me directly."
              : "Need an answer now? Skip the form — page me directly."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <a
              href={`tel:${site.phoneTel}`}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-sm text-accent-contrast transition-opacity hover:opacity-90"
            >
              <FiPhone className="h-4 w-4" aria-hidden />
              {site.phone}
            </a>
            <a
              href={`https://wa.me/${site.phoneWa}?text=${encodeURIComponent(
                "Hi Saurabh — reaching out from your site. It's urgent:",
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-line-2 px-4 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              <SiWhatsapp className="h-4 w-4" aria-hidden />
              WhatsApp
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-md border border-line py-2.5 font-mono text-sm text-muted transition-colors hover:border-accent hover:text-ink"
        >
          {isSuccess ? "Done" : "Close"}
        </button>
      </div>
    </div>
  );
}
