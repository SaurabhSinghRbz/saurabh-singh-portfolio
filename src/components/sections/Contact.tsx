"use client";

import { useState, useCallback } from "react";
import { FiGithub, FiLinkedin, FiDownload } from "react-icons/fi";
import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SignalTransmission from "@/components/motion/SignalTransmission";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [transmitting, setTransmitting] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setTransmitting(true);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  }, []);

  const handleTransmitComplete = useCallback(() => {
    setCopied(true);
    setTransmitting(false);
    setTimeout(() => setCopied(false), 3000);
  }, []);

  return (
    <section id="contact" className="relative">
      {/* Glassmorphism container */}
      <div className="mx-auto max-w-5xl px-6 py-28">
        <Reveal>
          <div className="glass-panel rounded-2xl p-8 md:p-12">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              Contact
            </p>
            <h2 className="font-display text-3xl md:text-5xl text-ink max-w-[22ch] text-balance">
              {site.contact.heading}
            </h2>
            <p className="mt-5 text-muted max-w-[54ch]">
              {site.contact.body}
            </p>

            {/* Signal transmission animation */}
            <SignalTransmission
              active={transmitting}
              onComplete={handleTransmitComplete}
            />

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {/* Email copy button with transmission */}
              <button
                onClick={handleCopy}
                className="group inline-flex items-center gap-3 rounded-md border border-line-2 px-5 py-3 font-mono text-sm text-ink transition-all duration-200 hover:border-accent hover:shadow-[0_0_24px_-8px_var(--t-accent)] cursor-pointer"
                aria-live="polite"
              >
                {site.email}
                <span
                  className={
                    copied
                      ? "text-good"
                      : transmitting
                        ? "text-accent"
                        : "text-muted group-hover:text-accent"
                  }
                >
                  {copied
                    ? "delivered ✓"
                    : transmitting
                      ? "transmitting…"
                      : "copy"}
                </span>
              </button>

              <a
                href={site.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-line px-5 py-3 text-sm text-muted transition-all duration-150 hover:border-accent hover:text-ink hover:shadow-[0_0_20px_-8px_var(--t-accent)]"
              >
                <FiLinkedin className="h-4 w-4" aria-hidden />
                LinkedIn
              </a>
              <a
                href={site.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-line px-5 py-3 text-sm text-muted transition-all duration-150 hover:border-accent hover:text-ink hover:shadow-[0_0_20px_-8px_var(--t-accent)]"
              >
                <FiGithub className="h-4 w-4" aria-hidden />
                GitHub
              </a>
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-line px-5 py-3 text-sm text-muted transition-all duration-150 hover:border-accent hover:text-ink hover:shadow-[0_0_20px_-8px_var(--t-accent)]"
              >
                <FiDownload className="h-4 w-4" aria-hidden />
                Résumé (PDF)
              </a>
            </div>

            <p className="mt-8 font-mono text-xs text-muted">
              {site.location} · {site.availability}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
