"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ *
 * FloatingDock — glass pill with section shortcuts. Fades in after
 * scrolling past the hero. Enhanced with active section indicator
 * and hover glow effects.
 * ------------------------------------------------------------------ */

/* Same sections as the top nav, in the same order — the dock is the
 * primary navigation on mobile (where the header menu is hidden). */
const items = [
  {
    href: "/#top",
    label: "Top",
    id: "top",
    icon: <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
  },
  {
    href: "/#console",
    label: "Console",
    id: "console",
    icon: <path d="M4 5h16v14H4zM7 9l3 3-3 3m5 0h5" />,
  },
  {
    href: "/#work",
    label: "Work",
    id: "work",
    icon: <path d="M4 7h16v12H4zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
  },
  {
    href: "/#experience",
    label: "Experience",
    id: "experience",
    icon: <path d="M4 19V5m4 14V9m4 10V4m4 15v-7m4 7V8" />,
  },
  {
    href: "/#skills",
    label: "Skills",
    id: "skills",
    icon: <path d="m8 6-6 6 6 6m8-12 6 6-6 6" />,
  },
  {
    href: "/#academic",
    label: "Academic",
    id: "academic",
    icon: <path d="M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />,
  },
  {
    href: "/#contact",
    label: "Contact",
    id: "contact",
    icon: <path d="M4 6h16v12H4zm0 1 8 6 8-6" />,
  },
];

export default function FloatingDock() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.9);

      // Find active section
      const sections = items
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      let active = "";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom > 200) {
          active = section.id;
          break;
        }
      }
      setActiveSection(active);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-2 sm:bottom-8 sm:px-4"
          aria-label="Section shortcuts"
        >
          <ul className="no-scrollbar flex max-w-[calc(100vw-0.75rem)] items-center gap-0.5 overflow-x-auto rounded-full border border-line bg-surface/85 px-1.5 py-1.5 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:gap-1 sm:px-2.5 sm:py-2">
            {items.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.href} className="shrink-0">
                  <a
                    href={item.href}
                    className={`group relative flex flex-col items-center gap-0.5 rounded-full px-2 py-1.5 transition-all duration-200 sm:px-3 ${
                      isActive
                        ? "text-accent bg-accent/10"
                        : "text-muted hover:bg-surface-2 hover:text-accent"
                    }`}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className={`transition-transform duration-200 ${
                        isActive ? "scale-110" : "group-hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </svg>
                    <span className="text-[9px] font-medium tracking-wide">
                      {item.label}
                    </span>
                    {/* Active indicator dot */}
                    {isActive && (
                      <span
                        className="absolute -top-0.5 right-2 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_1px_var(--t-accent)]"
                        aria-hidden
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
