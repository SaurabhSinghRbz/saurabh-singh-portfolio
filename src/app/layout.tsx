import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import ScrollProgress from "@/components/motion/ScrollProgress";
import CursorGlow from "@/components/motion/CursorGlow";
import ParticleNetworkCanvas from "@/components/three/ParticleNetworkCanvas";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: `${site.name} — Senior Software Engineer, payments infrastructure`,
    template: `%s · ${site.name}`,
  },
  description:
    "Senior Software Engineer at Pine Labs. Four years building the queue, notification and gift-card systems behind brands like Amazon, Flipkart, HDFC and Axis — plus a full payments platform shipped solo.",
  openGraph: {
    title: `${site.name} — Senior Software Engineer`,
    description: site.hero.headline,
    url: site.domain,
    siteName: site.name,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Senior Software Engineer",
  worksFor: { "@type": "Organization", name: "Pine Labs" },
  url: site.domain,
  sameAs: [site.github, site.linkedin],
  knowsAbout: [
    "Payments infrastructure",
    "Distributed systems",
    "Message queues",
    "Go",
    "Node.js",
    "TypeScript",
    "React",
  ],
};

/** Runs before paint: applies saved theme (or OS preference) to avoid a flash. */
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ScrollProgress />
        <CursorGlow />
        <ParticleNetworkCanvas />
        {children}
      </body>
    </html>
  );
}
