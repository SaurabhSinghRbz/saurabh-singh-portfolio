import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The dev-only Next.js badge sits bottom-left and collides with FloatingDock's
  // first item at narrow widths — it's not part of the shipped site, so turn it off.
  devIndicators: false,
};

export default nextConfig;
