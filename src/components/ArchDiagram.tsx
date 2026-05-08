/**
 * Queue-platform architecture as a theme-aware SVG (colors resolve from
 * the active theme's CSS variables, so it reads correctly in light & dark).
 */
export default function ArchDiagram() {
  const box = { fill: "var(--t-surface-2)", stroke: "var(--t-line-2)" };
  const label = { fill: "var(--t-ink)" };
  const sub = { fill: "var(--t-muted)" };
  const arrow = { stroke: "var(--t-accent)", strokeWidth: 1.5 };

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface p-4">
      <svg
        viewBox="0 0 720 240"
        className="min-w-[640px] w-full font-mono"
        role="img"
        aria-label="Architecture: producers publish to the broker layer (Iron.io or ActiveMQ); consumer workers pull with retries; failed messages go to a dead-letter queue; a Vue ops console inspects and replays; MongoDB stores tracking and Redis handles rate limiting."
      >
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--t-accent)" />
          </marker>
        </defs>

        {/* Producers */}
        <rect x="10" y="70" width="120" height="52" rx="8" {...box} />
        <text x="70" y="92" textAnchor="middle" fontSize="11" {...label}>Producers</text>
        <text x="70" y="108" textAnchor="middle" fontSize="9" {...sub}>client services</text>

        {/* Broker */}
        <rect x="200" y="70" width="130" height="52" rx="8" {...box} />
        <text x="265" y="92" textAnchor="middle" fontSize="11" {...label}>Broker layer</text>
        <text x="265" y="108" textAnchor="middle" fontSize="9" {...sub}>Iron.io / ActiveMQ</text>

        {/* Workers */}
        <rect x="400" y="70" width="140" height="52" rx="8" {...box} />
        <text x="470" y="92" textAnchor="middle" fontSize="11" {...label}>Consumer workers</text>
        <text x="470" y="108" textAnchor="middle" fontSize="9" {...sub}>retry + backoff · PM2</text>

        {/* DLQ */}
        <rect x="400" y="170" width="140" height="46" rx="8" {...box} />
        <text x="470" y="190" textAnchor="middle" fontSize="11" {...label}>Dead-letter queue</text>
        <text x="470" y="205" textAnchor="middle" fontSize="9" {...sub}>exhausted retries</text>

        {/* Ops console */}
        <rect x="600" y="70" width="110" height="52" rx="8" {...box} />
        <text x="655" y="92" textAnchor="middle" fontSize="11" {...label}>Ops console</text>
        <text x="655" y="108" textAnchor="middle" fontSize="9" {...sub}>Vue · RBAC · replay</text>

        {/* Data plane */}
        <rect x="200" y="10" width="130" height="34" rx="8" {...box} />
        <text x="265" y="31" textAnchor="middle" fontSize="9" {...sub}>MongoDB · tracking</text>
        <rect x="10" y="10" width="120" height="34" rx="8" {...box} />
        <text x="70" y="31" textAnchor="middle" fontSize="9" {...sub}>Redis · rate limits</text>

        {/* Arrows */}
        <line x1="130" y1="96" x2="196" y2="96" {...arrow} markerEnd="url(#ah)" />
        <line x1="330" y1="96" x2="396" y2="96" {...arrow} markerEnd="url(#ah)" />
        <line x1="470" y1="122" x2="470" y2="166" {...arrow} markerEnd="url(#ah)" />
        <line x1="540" y1="96" x2="596" y2="96" {...arrow} markerEnd="url(#ah)" />
        <line x1="544" y1="193" x2="655" y2="126" {...arrow} markerEnd="url(#ah)" />
      </svg>
    </div>
  );
}
