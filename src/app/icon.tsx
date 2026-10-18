import { ImageResponse } from "next/og";
import { brandDark as D } from "@/theme/palettes";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** "S." mark on the pine-black ground — the site's favicon. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: D.bg,
          color: D.accent,
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: 6,
        }}
      >
        S.
      </div>
    ),
    { ...size },
  );
}
