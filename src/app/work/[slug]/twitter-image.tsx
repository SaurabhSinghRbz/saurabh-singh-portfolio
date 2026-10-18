import { CaseStudyOgImage, caseStudyOgParams, size, contentType } from "./case-study-og";

export { size, contentType };
export const alt = "Case study by Saurabh Singh";

export function generateStaticParams() {
  return caseStudyOgParams();
}

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return CaseStudyOgImage(slug);
}
