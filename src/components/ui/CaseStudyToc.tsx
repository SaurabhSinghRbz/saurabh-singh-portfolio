"use client";

import { useEffect, useState } from "react";

/**
 * "On this page" for a case study. Desktop: sticky rail with scroll-spy.
 * Phones/tablets: a horizontally scrolling chip row (rendered by the page
 * with `variant="chips"`), so the reader can jump without a sidebar.
 */
export default function CaseStudyToc({
  items,
  variant = "rail",
}: {
  items: { id: string; label: string }[];
  variant?: "rail" | "chips";
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  // Active = the last section whose top has passed the reading line. Sections
  // differ wildly in height (the deep dive is most of the page), which is why
  // this reads positions instead of using intersection ratios.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = 140;
      let current = items[0]?.id ?? "";
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= line) current = i.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  if (variant === "chips") {
    return (
      <nav aria-label="On this page" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
              active === i.id ? "border-accent text-accent" : "border-line text-muted"
            }`}
          >
            {i.label}
          </a>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label="On this page" className="sticky top-28">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">On this page</p>
      <ul className="relative flex flex-col border-l border-line">
        {items.map((i) => {
          const on = active === i.id;
          return (
            <li key={i.id}>
              <a
                href={`#${i.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l py-1.5 pl-4 text-[13px] transition-colors duration-150 ${
                  on ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {i.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
