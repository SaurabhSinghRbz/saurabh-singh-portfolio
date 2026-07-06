"use client";

import { useState, useCallback, type FormEvent } from "react";
import { FiGithub, FiLinkedin, FiDownload } from "react-icons/fi";
import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";
import SignalTransmission from "@/components/motion/SignalTransmission";

const FIELD_CLASS =
  "w-full rounded-md border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors duration-150 focus:border-accent";

type FormState = "idle" | "submitting" | "success" | "error";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [transmitting, setTransmitting] = useState(false);

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          company: data.get("company"), // honeypot
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong.");
      }

      form.reset();
      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setFormState("error");
    }
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

            <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-4" noValidate>
              {/* Honeypot — hidden from real visitors, catches simple bots */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="hidden"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="Your name"
                  className={FIELD_CLASS}
                  disabled={formState === "submitting"}
                />
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={200}
                  placeholder="Your email"
                  className={FIELD_CLASS}
                  disabled={formState === "submitting"}
                />
              </div>
              <input
                type="text"
                name="subject"
                required
                maxLength={150}
                placeholder="Subject"
                className={FIELD_CLASS}
                disabled={formState === "submitting"}
              />
              <textarea
                name="message"
                required
                maxLength={5000}
                rows={5}
                placeholder="What's the problem you're trying to solve?"
                className={`${FIELD_CLASS} resize-y`}
                disabled={formState === "submitting"}
              />

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-sm text-accent-contrast transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formState === "submitting" ? "Sending…" : "Send message"}
                </button>
                {formState === "success" && (
                  <span className="font-mono text-sm text-good" role="status">
                    Sent — check your inbox for a confirmation. I'll reply within a day.
                  </span>
                )}
                {formState === "error" && (
                  <span className="font-mono text-sm text-bad" role="alert">
                    {errorMsg}
                  </span>
                )}
              </div>
            </form>

            <p className="mt-9 font-mono text-xs uppercase tracking-[0.18em] text-muted">
              or reach me directly
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
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
