import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { brandDark as D } from "@/theme/palettes";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Senior Software Engineer`,
    short_name: site.name,
    description:
      "Portfolio of Saurabh Singh — Senior Software Engineer at Pine Labs, payments & distributed systems.",
    start_url: "/",
    display: "standalone",
    background_color: D.bg,
    theme_color: D.bg,
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
