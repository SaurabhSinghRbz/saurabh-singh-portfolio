import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudies } from "@/content/case-studies";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: site.domain, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${site.domain}/work`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...caseStudies.map((cs) => ({
      url: `${site.domain}/work/${cs.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
