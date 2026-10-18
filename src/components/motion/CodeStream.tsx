"use client";

import { useEffect, useRef, useState } from "react";
import { useElementInView } from "@/lib/perf";

/**
 * CodeStream — floating code snippets that drift upward behind the hero.
 * Pure CSS animation (no per-frame JS) for near-zero runtime cost.
 * Content is real-looking API requests, SQL queries, React components,
 * and Go functions — readable at a glance but clearly decorative.
 */

const CODE_COLUMNS = [
  {
    speed: 45,
    delay: 0,
    opacity: 0.04,
    left: "8%",
    lines: [
      "const handler = async (req, res) => {",
      "  const { orderId } = req.params;",
      "  const order = await db.orders.findUnique({",
      "    where: { id: orderId },",
      "    include: { items: true },",
      "  });",
      "  if (!order) return res.status(404).json({",
      '    error: "ORDER_NOT_FOUND"',
      "  });",
      "  await queue.publish('card.activate', {",
      "    orderId: order.id,",
      "    provider: order.contentProvider,",
      "    amount: order.amount,",
      "  });",
      '  res.json({ status: "processing" });',
      "};",
    ],
  },
  {
    speed: 55,
    delay: 8,
    opacity: 0.035,
    left: "28%",
    lines: [
      "SELECT c.card_number,",
      "       c.status,",
      "       c.activated_at,",
      "       o.merchant_id,",
      "       o.amount",
      "  FROM gift_cards c",
      "  JOIN orders o ON c.order_id = o.id",
      " WHERE c.status = 'ACTIVE'",
      "   AND o.created_at > NOW() - '24h'",
      " ORDER BY c.activated_at DESC",
      " LIMIT 100;",
      "",
      "-- Index: cards_status_activated",
      "-- Avg query time: 2.3ms",
    ],
  },
  {
    speed: 50,
    delay: 4,
    opacity: 0.03,
    left: "52%",
    lines: [
      "func (s *CardService) Activate(",
      "  ctx context.Context,",
      "  req *ActivateRequest,",
      ") (*Card, error) {",
      "  card, err := s.repo.FindByID(ctx, req.CardID)",
      "  if err != nil {",
      "    return nil, fmt.Errorf(",
      '      "find card: %w", err,',
      "    )",
      "  }",
      '  if card.Status != "PENDING" {',
      "    return nil, ErrInvalidTransition",
      "  }",
      "  card.Status = StatusActive",
      "  card.ActivatedAt = time.Now()",
      "  return s.repo.Save(ctx, card)",
      "}",
    ],
  },
  {
    speed: 60,
    delay: 12,
    opacity: 0.025,
    left: "76%",
    lines: [
      "export function OrderTracker() {",
      "  const { orderId } = useParams();",
      "  const [status, setStatus] =",
      '    useState("connecting");',
      "",
      "  useEffect(() => {",
      "    const socket = io('/orders', {",
      "      query: { orderId },",
      "    });",
      "    socket.on('status', (data) => {",
      "      setStatus(data.status);",
      "    });",
      "    return () => socket.close();",
      "  }, [orderId]);",
      "",
      "  return (",
      "    <StatusBadge status={status} />",
      "  );",
      "}",
    ],
  },
  {
    speed: 52,
    delay: 6,
    opacity: 0.03,
    left: "92%",
    lines: [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: queue-consumer",
      "spec:",
      "  replicas: 4",
      "  selector:",
      "    matchLabels:",
      "      app: queue-consumer",
      "  template:",
      "    spec:",
      "      containers:",
      "        - name: worker",
      "          image: registry/worker:v2",
      "          resources:",
      "            limits:",
      '              memory: "512Mi"',
      '              cpu: "250m"',
    ],
  },
];

export default function CodeStream() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Pause the columns while the hero is scrolled away.
  const heroInView = useElementInView("top");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)",
      }}
    >
      {CODE_COLUMNS.map((col, i) => (
        <div
          key={i}
          className="code-stream-col absolute top-0 font-mono text-[10px] leading-[1.6] whitespace-pre"
          style={{
            left: col.left,
            color: "var(--t-muted)",
            opacity: col.opacity,
            animationDuration: `${col.speed}s`,
            animationDelay: `${col.delay}s`,
            animationPlayState: heroInView ? "running" : "paused",
          }}
        >
          {/* Duplicate for seamless loop */}
          {[...col.lines, ...col.lines].map((line, j) => (
            <div key={j}>{line || "\u00A0"}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
