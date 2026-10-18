import { ImageResponse } from "next/og";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";

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
          background: "radial-gradient(1200px 600px at 85% -10%, #16241d 0%, #0C1210 55%)",
          color: "#E8EFEA",
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
                background: "#FF8A66",
                color: "#0C1210",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              S.
            </div>
            <div style={{ fontSize: 24, color: "#9db3a7" }}>
              {`${site.name} · case study ${String(Math.max(index, 0) + 1).padStart(2, "0")}`}
            </div>
          </div>
          <div style={{ fontSize: 22, color: "#9db3a7" }}>{`${site.domain.replace("https://", "")}/work`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 24, color: "#FF8A66", letterSpacing: 2 }}>{cs.eyebrow.toUpperCase()}</div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>{cs.title}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {cs.highlights.map((h) => (
              <div
                key={h.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "14px 24px",
                  border: "1px solid #2b3a32",
                  borderRadius: 16,
                  minWidth: 200,
                }}
              >
                <div style={{ fontSize: 40, fontWeight: 800 }}>{h.value}</div>
                <div style={{ fontSize: 18, color: "#9db3a7", textTransform: "uppercase", letterSpacing: 1 }}>
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, color: "#c7d4cc" }}>
          {cs.flow.map((n, i) => (
            <div key={n.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ padding: "8px 16px", border: "1px solid #2b3a32", borderRadius: 10 }}>{n.label}</div>
              {i < cs.flow.length - 1 && <div style={{ color: "#FF8A66" }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
