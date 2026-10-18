"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = "clamp(400px, 62vh, 760px)";

function Placeholder() {
  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-xl border border-line bg-surface sm:rounded-2xl"
      style={{ minHeight: MIN_HEIGHT }}
      aria-hidden
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-line-2" />
        <span className="h-3 w-3 rounded-full bg-line-2" />
        <span className="h-3 w-3 rounded-full bg-line-2" />
      </div>
      <p className="px-5 py-4 font-mono text-[12px] text-muted">
        saurabh@prod:~$ <span className="terminal-cursor inline-block h-3.5 w-2 translate-y-0.5 bg-accent" />
      </p>
    </div>
  );
}

const HeroTerminal = dynamic(() => import("./HeroTerminal"), { ssr: false, loading: Placeholder });

/**
 * Defers the terminal (engine + ~1,500 lines of command data) until the
 * visitor scrolls within roughly a screen of it. Same footprint as the real
 * terminal, so nothing shifts when it swaps in.
 */
export default function LazyTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{load ? <HeroTerminal /> : <Placeholder />}</div>;
}
