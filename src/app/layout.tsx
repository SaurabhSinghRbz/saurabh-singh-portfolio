import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import { site } from "@/content/site";
import { ACTIVE_PALETTE, paletteCss, palettes, type PaletteName } from "@/theme/palettes";
import DevPaletteSwitcher from "@/components/dev/DevPaletteSwitcher";
import ScrollProgress from "@/components/motion/ScrollProgress";
import CursorGlow from "@/components/motion/CursorGlow";
import ParticleNetworkCanvas from "@/components/three/ParticleNetworkCanvas";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description =
  "Saurabh Singh — Senior Software Engineer at Pine Labs (Qwikcilver · Woohoo), Bengaluru. Four years building the queue, notification and gift-card systems behind Woohoo — the platform issuing ~9 of every 10 gift cards in India, for 300+ brands from Amazon and Flipkart to SBI, HDFC and Axis — plus SmoothPay, a full payments platform owned end to end. Go · Node.js · TypeScript · distributed systems.";

// Kept <=160 chars for the <meta name="description"> tag — Bing/Google truncate or flag longer
// ones. The full `description` above is still used for OG/Twitter cards and JSON-LD.
const metaDescription =
  "Saurabh Singh, Senior Software Engineer at Pine Labs, Bengaluru. Builds the Woohoo gift-card platform behind 300+ brands. Go, Node.js, TypeScript.";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: `${site.name} — Senior Software Engineer, payments infrastructure`,
    template: `%s · ${site.name}`,
  },
  description: metaDescription,
  applicationName: `${site.name} · Portfolio`,
  keywords: [...site.seo.keywords],
  authors: [{ name: site.name, url: site.domain }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: { canonical: site.domain },
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    title: `${site.name} — Senior Software Engineer, payments infrastructure`,
    description,
    url: site.domain,
    siteName: site.name,
    locale: "en_US",
    type: "profile",
    firstName: "Saurabh",
    lastName: "Singh",
    username: "SaurabhSinghRbz",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Senior Software Engineer`,
    description,
    creator: "@SaurabhSinghRbz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Fill these in from Google Search Console / Bing Webmaster Tools once verified.
  // verification: { google: "…", other: { "msvalidate.01": "…" } },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${site.domain}/#person`,
  name: site.name,
  alternateName: [...site.seo.alternateNames],
  jobTitle: site.role,
  description,
  url: site.domain,
  email: `mailto:${site.email}`,
  image: `${site.domain}/opengraph-image`,
  worksFor: { "@type": "Organization", name: "Pine Labs (Qwikcilver · Woohoo)" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  homeLocation: { "@type": "Place", name: site.seo.hometown },
  alumniOf: [
    { "@type": "EducationalOrganization", name: "Amrita Vishwa Vidyapeetham" },
    { "@type": "EducationalOrganization", name: "Masai School" },
  ],
  sameAs: [site.github, site.linkedin],
  knowsAbout: [
    "Payments infrastructure",
    "Distributed systems",
    "Message queues",
    "Gift card platforms",
    "Go",
    "Node.js",
    "TypeScript",
    "React",
    "NestJS",
    "PostgreSQL",
    "MongoDB",
    "Redis",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.domain}/#website`,
  url: site.domain,
  name: `${site.name} — Portfolio`,
  description,
  inLanguage: "en",
  author: { "@id": `${site.domain}/#person` },
};

/** Runs before paint: applies saved theme (or OS preference) to avoid a flash. */
const themeInit = `(function(){try{var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;

const isDev = process.env.NODE_ENV === "development";
// Dev only: every palette is emitted so the switcher can preview them live; production ships just the active one.
const themeCss = paletteCss(isDev ? (Object.keys(palettes) as PaletteName[]) : [ACTIVE_PALETTE]);
// Dev only: restore the palette last picked in the switcher, before paint.
const paletteInit = `(function(){try{var p=localStorage.getItem("palette-preview");if(p&&${JSON.stringify(Object.keys(palettes))}.indexOf(p)>-1)document.documentElement.dataset.palette=p;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-palette={ACTIVE_PALETTE}
      suppressHydrationWarning
      className={`${fraunces.variable} ${manrope.variable} ${jetbrains.variable}`}
    >
      <head>
        <style id="theme-tokens" dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {isDev && <script dangerouslySetInnerHTML={{ __html: paletteInit }} />}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ScrollProgress />
        <CursorGlow />
        <ParticleNetworkCanvas />
        {children}
        {isDev && <DevPaletteSwitcher />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
