import { site } from "@/content/site";

/** Highlights ticker directly under the hero — in the page flow, so it never covers content on small screens. */
export default function ProofStrip() {
  // Two copies: the track scrolls by -50% for a seamless loop.
  const items = [...site.proofStrip, ...site.proofStrip];

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/60" aria-label="Highlights">
      <div className="marquee-mask">
        <ul className="marquee-track flex w-max items-center gap-10 px-6 py-3 font-mono text-xs text-muted">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap"
              aria-hidden={i >= site.proofStrip.length || undefined}
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-accent/70" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
