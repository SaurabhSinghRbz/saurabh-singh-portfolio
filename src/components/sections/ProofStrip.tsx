import { site } from "@/content/site";

/** Infinite ticker fixed at viewport bottom — always visible, always moving. */
export default function ProofStrip() {
  // Triple the items for seamless infinite scroll
  const items = [...site.proofStrip, ...site.proofStrip, ...site.proofStrip];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 overflow-hidden"
      aria-label="Highlights"
    >
      {/* Glassmorphism background with glow */}
      <div
        className="absolute inset-0 bg-surface/80 backdrop-blur-md border-t border-line"
        style={{
          boxShadow: "0 -8px 32px -12px rgba(0, 0, 0, 0.15)",
        }}
      />

      <div className="relative marquee-mask">
        <ul className="marquee-track flex w-max items-center gap-10 px-6 py-3 font-mono text-xs text-muted">
          {items.map((item, i) => (
            <li
              key={`${item}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap"
              aria-hidden={i >= site.proofStrip.length || undefined}
            >
              {item}
              <span
                className="h-1.5 w-1.5 rounded-full bg-accent/70 shadow-[0_0_8px_2px_var(--t-accent)]"
                style={{ opacity: 0.6 }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
