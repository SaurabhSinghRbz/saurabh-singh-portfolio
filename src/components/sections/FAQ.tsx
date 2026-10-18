import { site } from "@/content/site";
import Reveal from "@/components/motion/Reveal";

/**
 * Visible, keyboard-accessible FAQ (native <details>) + FAQPage structured data.
 * The visible copy and the JSON-LD are the same source (site.faqs) so the schema
 * always matches what's on the page — a requirement for FAQ rich results and a
 * strong entity signal for AI search engines.
 */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${site.domain}/#faq`,
  mainEntity: site.faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="font-display text-3xl md:text-4xl text-ink text-balance"
          >
            Questions people ask
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col divide-y divide-line border-y border-line">
          {site.faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg text-ink marker:content-none">
                {f.q}
                <span
                  aria-hidden
                  className="shrink-0 font-mono text-accent transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
