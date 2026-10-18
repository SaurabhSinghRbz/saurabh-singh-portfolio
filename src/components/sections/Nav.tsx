"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowUpRight, FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";
import ThemeToggle from "@/components/ThemeToggle";

/** In-page sections, in page order. "Work" is handled separately (menu). */
const links = [
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#console", label: "Console" },
  { href: "/#academic", label: "Academic" },
  { href: "/#contact", label: "Contact" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Nav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [workOpen, setWorkOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const workRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Set when a mouse hover opened the menu, so the click that follows does not close it again.
  const hoverOpened = useRef(false);

  const onWorkPage = pathname?.startsWith("/work") ?? false;

  /* Header background + active section highlight */
  useEffect(() => {
    const ids = ["work", ...links.map((l) => l.href.replace("/#", ""))];
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      let active = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 120 && r.bottom > 120) {
          active = id;
          break;
        }
      }
      setActiveSection(active);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!workOpen) hoverOpened.current = false;
  }, [workOpen]);

  /* Close menus on route change */
  useEffect(() => {
    setWorkOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  /* Escape closes; click outside closes the Work menu */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setWorkOpen(false);
        setMobileOpen(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (workRef.current && !workRef.current.contains(e.target as Node)) setWorkOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  /* Lock page scroll behind the mobile sheet */
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const openWork = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    hoverOpened.current = true;
    setWorkOpen(true);
  };
  const scheduleCloseWork = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => {
      hoverOpened.current = false;
      setWorkOpen(false);
    }, 140);
  };

  const workActive = onWorkPage || activeSection === "work";
  const solid = scrolled || mobileOpen || onWorkPage;

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        solid
          ? "border-b border-line bg-bg/85 shadow-[0_1px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6" aria-label="Primary">
        <Link href="/#top" className="shrink-0 font-mono text-sm tracking-wide text-ink">
          saurabh<span className="text-accent">.</span>singh
        </Link>

        {/* ---------- Desktop ---------- */}
        <ul className="hidden items-center gap-1 text-sm text-muted lg:flex">
          <li ref={workRef} className="relative" onPointerEnter={openWork} onPointerLeave={scheduleCloseWork}>
            <button
              type="button"
              aria-expanded={workOpen}
              aria-controls="work-menu"
              onClick={() => {
                if (hoverOpened.current) return;
                setWorkOpen((o) => !o);
              }}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition-colors duration-150 hover:text-ink ${
                workActive ? "text-accent" : ""
              }`}
            >
              Work
              <FiChevronDown
                aria-hidden
                className={`h-3.5 w-3.5 transition-transform duration-200 ${workOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {workOpen && (
                <motion.div
                  id="work-menu"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                >
                  <div className="overflow-hidden rounded-xl border border-line-2 bg-surface shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)]">
                    <p className="border-b border-line px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                      Case studies · production systems
                    </p>
                    <ul className="grid grid-cols-2 gap-px bg-line">
                      {caseStudies.map((cs, i) => (
                        <li key={cs.slug} className="bg-surface">
                          <Link
                            href={`/work/${cs.slug}`}
                            className="group flex h-full flex-col gap-1 p-4 transition-colors duration-150 hover:bg-surface-2"
                          >
                            <span className="flex items-center gap-2 font-mono text-[10px] text-accent">
                              {String(i + 1).padStart(2, "0")}
                              <span className="text-muted">{cs.eyebrow.split("·")[0].trim()}</span>
                            </span>
                            <span className="font-medium text-ink group-hover:text-accent">{cs.shortTitle}</span>
                            <span className="line-clamp-2 text-xs leading-snug text-muted">{cs.title}</span>
                            <span className="mt-1 font-mono text-[10px] text-muted">
                              {cs.highlights.map((h) => `${h.value} ${h.label}`).slice(0, 2).join(" · ")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/work"
                      className="flex items-center justify-between border-t border-line px-4 py-3 font-mono text-xs text-ink transition-colors duration-150 hover:bg-surface-2 hover:text-accent"
                    >
                      All work, side by side
                      <FiArrowUpRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {links.map((l) => {
            const id = l.href.replace("/#", "");
            const isActive = !onWorkPage && activeSection === id;
            return (
              <li key={l.href}>
                <a
                  href={l.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative rounded-md px-3 py-1.5 transition-colors duration-150 hover:text-ink ${
                    isActive ? "text-accent" : ""
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-accent" aria-hidden />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href={site.resume}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-contrast transition-all duration-150 hover:bg-accent-hi hover:shadow-[0_0_20px_-4px_var(--t-accent)] active:scale-[0.98] sm:inline-block"
          >
            Résumé
          </a>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ink transition-colors duration-150 hover:border-accent lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX className="h-4.5 w-4.5" aria-hidden /> : <FiMenu className="h-4.5 w-4.5" aria-hidden />}
          </button>
        </div>
      </nav>
    </header>

      {/* ---------- Mobile / tablet sheet (outside <header>: its backdrop-filter would trap a fixed child) ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[61px] z-40 overflow-y-auto overscroll-contain border-t border-line bg-bg lg:hidden"
          >
            <div className="mx-auto max-w-2xl px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 sm:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Work · case studies</p>
              <ul className="mt-3 flex flex-col gap-2">
                {caseStudies.map((cs, i) => (
                  <motion.li
                    key={cs.slug}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.03 * i, ease: EASE }}
                  >
                    <Link
                      href={`/work/${cs.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 active:bg-surface-2"
                    >
                      <span className="font-mono text-xs text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink">{cs.shortTitle}</span>
                        <span className="block truncate text-xs text-muted">{cs.title}</span>
                      </span>
                      <FiArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-muted" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                href="/work"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex font-mono text-xs text-accent"
              >
                All work, side by side →
              </Link>

              <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Sections</p>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg border border-line px-3.5 py-3 text-sm text-ink active:bg-surface-2"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>

              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="mt-8 flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-contrast"
              >
                Download résumé
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
