import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
  /**
   * Emit FAQPage JSON-LD for these items. The schema is generated from the SAME
   * `items` rendered in the accordion, so the visible text and the structured
   * data can never drift apart (Google requires them to match).
   * Set false only if another FAQPage already exists on the same route.
   */
  includeSchema?: boolean;
}

export default function FaqSection({
  items,
  title = 'Frequently Asked Questions',
  subtitle,
  includeSchema = true,
}: FaqSectionProps) {
  if (items.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-20 px-[6vw] relative z-10">
      {includeSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        </Helmet>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-micro text-mint mb-4">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-offwhite-dark max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {items.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-charcoal-light border border-white/10 rounded-xl px-5"
            >
              <AccordionTrigger className="text-offwhite font-display text-base md:text-lg hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-offwhite-dark text-base leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
