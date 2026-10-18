import { ImageResponse } from "next/og";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";
import { brandDark as D, brandExtras as X } from "@/theme/palettes";

/** 1200×630 link preview for one case study — title, real figures, system flow. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function caseStudyOgParams() {
  return caseStudies.map((cs) => ({ slug: cs.slug }));
}

export function CaseStudyOgImage(slug: string) {
  const index = caseStudies.findIndex((c) => c.slug === slug);
  const cs = caseStudies[index] ?? caseStudies[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: `radial-gradient(1200px 600px at 85% -10%, ${X.ogGlow} 0%, ${D.bg} 55%)`,
          color: D.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: D.accent,
                color: D.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              S.
            </div>
            <div style={{ fontSize: 24, color: X.ogMuted }}>
              {`${site.name} · case study ${String(Math.max(index, 0) + 1).padStart(2, "0")}`}
            </div>
          </div>
          <div style={{ fontSize: 22, color: X.ogMuted }}>{`${site.domain.replace("https://", "")}/work`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, color: D.accent, letterSpacing: 2 }}>{cs.eyebrow.toUpperCase()}</div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>{cs.title}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {cs.highlights.map((h) => (
              <div
                key={h.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "14px 24px",
                  border: `1px solid ${X.ogBorder}`,
                  borderRadius: 16,
                  minWidth: 200,
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 800 }}>{h.value}</div>
                <div style={{ fontSize: 18, color: X.ogMuted, textTransform: "uppercase", letterSpacing: 1 }}>
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, color: X.ogChip }}>
          {cs.flow.map((n, i) => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ padding: "8px 16px", border: `1px solid ${X.ogBorder}`, borderRadius: 10 }}>{n.label}</div>
              {i < cs.flow.length - 1 && <div style={{ color: D.accent }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
