import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C1210",
          color: "#FF8A66",
          fontSize: 110,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        S.
      </div>
    ),
    { ...size },
  );
}
