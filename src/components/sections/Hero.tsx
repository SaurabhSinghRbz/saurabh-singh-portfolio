"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/content/site";
import HeroCanvas from "@/components/three/HeroCanvas";
import Magnetic from "@/components/motion/Magnetic";
import ScrambleText from "@/components/motion/ScrambleText";
import CodeStream from "@/components/motion/CodeStream";

const EASE = [0.16, 1, 0.3, 1] as const;

function HeadlineWords() {
  const reduced = useReducedMotion();
  let index = 0;

  return (
    <h1 className="font-display text-5xl md:text-7xl leading-[1.06] text-ink max-w-[16ch] text-balance">
      {site.hero.headlineParts.map((part) =>
        part.text.split(" ").map((word) => {
          const delay = 0.25 + index++ * 0.07;
          return (
            <span key={`${word}-${index}`} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                className={`inline-block ${part.accent ? "italic text-accent" : ""}`}
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, delay, ease: EASE }}
              >
                {word}
              </motion.span>
              <span className="inline-block">&nbsp;</span>
            </span>
          );
        }),
      )}
    </h1>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0.15]);

  const fade = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  });

  return (
    <section ref={ref} id="top" className="relative flex min-h-[92dvh] items-center overflow-hidden">
      {/* Ambient ground + single hero glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 480px at 70% 40%, color-mix(in srgb, var(--t-accent) 7%, transparent), transparent 70%)",
        }}
        aria-hidden
      />

      {/* Code streams — decorative code flowing upward */}
      <CodeStream />

      <HeroCanvas />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-5xl px-6 pt-24 pb-40 md:pb-16"
      >
        <div>
          <motion.p
            {...fade(0.05)}
            className="font-mono text-xs uppercase tracking-[0.22em] text-accent mb-6"
          >
            <ScrambleText text={`${site.role} · Pine Labs`} />
          </motion.p>

          <HeadlineWords />

          <motion.p {...fade(0.75)} className="mt-7 max-w-[56ch] text-lg md:text-xl text-muted">
            {site.hero.subheadline}
          </motion.p>

          <motion.div {...fade(0.9)} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a
                href="#work"
                className="inline-block rounded-md bg-accent px-5 py-2.5 font-semibold text-accent-contrast transition-transform duration-150 active:scale-[0.98] hover:bg-accent-hi"
              >
                View case studies
              </a>
            </Magnetic>
            <a
              href={site.resume}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line-2 px-5 py-2.5 text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              Résumé ↓
            </a>
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
              </span>
              {site.availability}
            </span>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          {...fade(1.4)}
          className="pointer-events-none absolute -bottom-10 left-6 hidden md:flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
          aria-hidden
        >
          <span className="relative h-8 w-px overflow-hidden bg-line-2">
            <span className="absolute inset-x-0 top-0 h-3 animate-scrollhint bg-accent" />
          </span>
          scroll
        </motion.div>
      </motion.div>
    </section>
  );
}
