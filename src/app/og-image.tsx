import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { brandDark as D, brandExtras as X } from "@/theme/palettes";

/** 1200×630 link-preview card, shared by opengraph-image and twitter-image. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            `radial-gradient(1200px 600px at 85% -10%, ${X.ogGlow} 0%, ${D.bg} 55%)`,
          color: D.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: D.accent,
              color: D.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            S.
          </div>
          <div style={{ fontSize: 26, letterSpacing: 1, color: X.ogMuted }}>
            {site.domain.replace("https://", "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, color: D.accent, letterSpacing: 2 }}>
            {site.name.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            <span>I build the systems that&nbsp;</span>
            <span style={{ color: D.accent, fontStyle: "italic" }}>move money.</span>
          </div>
          <div style={{ fontSize: 30, color: X.ogMuted, maxWidth: 920 }}>
            Senior Software Engineer at Pine Labs · payments & distributed systems
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: X.ogChip }}>
          {["Go", "Node.js", "TypeScript", "React", "500+ TPS"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 20px",
                border: `1px solid ${X.ogBorder}`,
                borderRadius: 999,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
