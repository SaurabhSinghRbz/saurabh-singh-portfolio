/**
 * FlowStrip — a compact system flow for project cards.
 *
 * Plain HTML + CSS rather than a fixed-width SVG, so it reflows instead of
 * shrinking: a row of nodes from `sm` up, a vertical rail on phones. A packet
 * travels each connector in sequence (CSS only, no per-frame JS); the whole
 * animation is dropped under prefers-reduced-motion.
 */
export default function FlowStrip({
  nodes,
  className = "",
}: {
  nodes: { label: string; sub: string }[];
  className?: string;
}) {
  const cycle = nodes.length * 0.7;

  return (
    <ol
      className={`flow-strip flex flex-col gap-0 md:flex-row md:items-stretch ${className}`}
      aria-label={`System flow: ${nodes.map((n) => n.label).join(" → ")}`}
    >
      {nodes.map((n, i) => (
        <li key={n.label} className="flex flex-col md:min-w-0 md:flex-1 md:flex-row md:items-center">
          <div className="flow-node flex items-center gap-3 rounded-lg border border-line bg-bg/60 px-3 py-2 md:w-full md:flex-col md:items-start md:gap-0.5">
            <span className="font-mono text-[10px] text-accent tabular-nums md:hidden">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-mono text-[12px] font-medium text-ink">{n.label}</span>
              <span className="block truncate font-mono text-[10px] text-muted">{n.sub}</span>
            </span>
          </div>

          {i < nodes.length - 1 && (
            <span
              aria-hidden
              className="flow-link relative ml-[19px] block h-3.5 w-px shrink-0 bg-line-2 md:ml-0 md:h-px md:w-5"
            >
              <span
                className="flow-packet absolute rounded-full bg-accent"
                style={{
                  animationDuration: `${cycle}s`,
                  animationDelay: `${i * 0.7}s`,
                }}
              />
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
