"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import ThemeToggle from "@/components/ThemeToggle";

const links = [
  { href: "/#console", label: "Console" },
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
  { href: "/#academic", label: "Academic" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      // Find active section
      const sections = links
        .map((l) => l.href.replace("/#", ""))
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[];

      let active = "";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
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
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-xl shadow-[0_1px_24px_-8px_rgba(0,0,0,0.2)]"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <a href="/#top" className="font-mono text-sm text-ink tracking-wide">
          saurabh<span className="text-accent">.</span>singh
        </a>
        <div className="flex items-center gap-4">
          <ul className="hidden md:flex items-center gap-6 text-sm text-muted">
            {links.map((l) => {
              const id = l.href.replace("/#", "");
              const isActive = activeSection === id;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`nav-link hover:text-ink relative ${
                      isActive ? "text-accent" : ""
                    }`}
                  >
                    {l.label}
                    {isActive && (
                      <span
                        className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                        aria-hidden
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <ThemeToggle />
          <a
            href={site.resume}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-contrast transition-all duration-150 active:scale-[0.98] hover:bg-accent-hi hover:shadow-[0_0_20px_-4px_var(--t-accent)]"
          >
            Résumé
          </a>
        </div>
      </nav>
    </header>
  );
}
