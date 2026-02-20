"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MiniArchFlow — compact animated architecture diagram.
 * Nodes connected by lines with travelling data-packet dots.
 * Fully SVG-based with CSS animations. Theme-aware colors.
 */

type ArchNode = {
  label: string;
  sub?: string;
};

const DEFAULT_NODES: ArchNode[] = [
  { label: "Client", sub: "frontend" },
  { label: "API Gateway", sub: "auth · routing" },
  { label: "Services", sub: "microservices" },
  { label: "Database", sub: "persistence" },
];

export default function MiniArchFlow({
  nodes = DEFAULT_NODES,
  className,
}: {
  nodes?: ArchNode[];
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const nodeWidth = 120;
  const nodeHeight = 40;
  const gap = 36;
  const totalWidth = nodes.length * nodeWidth + (nodes.length - 1) * gap;
  const viewHeight = 70;

  return (
    <div ref={ref} className={className}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${totalWidth} ${viewHeight}`}
          className="w-full min-w-[480px]"
          style={{ maxHeight: 64 }}
          aria-hidden
        >
          {nodes.map((node, i) => {
            const x = i * (nodeWidth + gap);
            const centerY = viewHeight / 2;

            return (
              <g
                key={node.label}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? "translateY(0)"
                    : "translateY(8px)",
                  transition: `opacity 0.4s ${i * 0.1}s ease, transform 0.4s ${i * 0.1}s ease`,
                }}
              >
                {/* Node box */}
                <rect
                  x={x}
                  y={centerY - nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={6}
                  fill="var(--t-surface-2)"
                  stroke="var(--t-line-2)"
                  strokeWidth={1}
                />
                {/* Label */}
                <text
                  x={x + nodeWidth / 2}
                  y={centerY - 3}
                  textAnchor="middle"
                  fontSize={10}
                  fill="var(--t-ink)"
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
                {/* Sub label */}
                {node.sub && (
                  <text
                    x={x + nodeWidth / 2}
                    y={centerY + 12}
                    textAnchor="middle"
                    fontSize={7}
                    fill="var(--t-muted)"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                )}

                {/* Arrow to next node */}
                {i < nodes.length - 1 && (
                  <>
                    <line
                      x1={x + nodeWidth}
                      y1={centerY}
                      x2={x + nodeWidth + gap}
                      y2={centerY}
                      stroke="var(--t-accent)"
                      strokeWidth={1}
                      strokeDasharray="none"
                      opacity={0.4}
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${x + nodeWidth + gap - 6},${centerY - 3} ${x + nodeWidth + gap},${centerY} ${x + nodeWidth + gap - 6},${centerY + 3}`}
                      fill="var(--t-accent)"
                      opacity={0.6}
                    />
                    {/* Traveling packet dot */}
                    {visible && (
                      <circle r={2.5} fill="var(--t-accent)" opacity={0.9}>
                        <animateMotion
                          dur={`${1.5 + i * 0.3}s`}
                          repeatCount="indefinite"
                          begin={`${i * 0.4}s`}
                          path={`M${x + nodeWidth},${centerY} L${x + nodeWidth + gap},${centerY}`}
                        />
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          dur={`${1.5 + i * 0.3}s`}
                          repeatCount="indefinite"
                          begin={`${i * 0.4}s`}
                        />
                      </circle>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
