import { ImageResponse } from "next/og";
import { site } from "@/content/site";

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
            "radial-gradient(1200px 600px at 85% -10%, #16241d 0%, #0C1210 55%)",
          color: "#E8EFEA",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#FF8A66",
              color: "#0C1210",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            S.
          </div>
          <div style={{ fontSize: 26, letterSpacing: 1, color: "#9db3a7" }}>
            {site.domain.replace("https://", "")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 30, color: "#FF8A66", letterSpacing: 2 }}>
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
            <span style={{ color: "#FF8A66", fontStyle: "italic" }}>move money.</span>
          </div>
          <div style={{ fontSize: 30, color: "#9db3a7", maxWidth: 920 }}>
            Senior Software Engineer at Pine Labs · payments & distributed systems
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#c7d4cc" }}>
          {["Go", "Node.js", "TypeScript", "React", "500+ TPS"].map((t) => (
            <div
              key={t}
              style={{
                padding: "10px 20px",
                border: "1px solid #2b3a32",
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
