import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import Navigation from '../../components/Navigation';
import MatrixBackground from '../../components/MatrixBackground';
import Footer from '../../components/Footer';
import PageSEO from '../../components/PageSEO';
import JsonLd from '../../components/JsonLd';
import { serviceSchema, faqSchema } from '../../lib/schema';

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceData {
  /** canonical path, e.g. "/window-tint" */
  path: string;
  seoTitle: string;
  seoDescription: string;
  schemaServiceType: string;
  schemaName: string;
  schemaDescription: string;
  eyebrow: string;
  h1: ReactNode;
  lead: string;
  sections: { heading: string; body: ReactNode }[];
  faqs: ServiceFaq[];
  /** `external` chips are prerendered static HTML pages — use a full page load. */
  related: { label: string; to: string; external?: boolean }[];
  ctaTitle: string;
  ctaBody: string;
}

export default function ServicePage({ data }: { data: ServiceData }) {
  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO title={data.seoTitle} description={data.seoDescription} canonical={data.path} />
      <JsonLd data={serviceSchema(data.schemaServiceType, data.schemaName, data.schemaDescription)} />
      <JsonLd data={faqSchema(data.faqs)} />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-micro text-mint mb-4">{data.eyebrow}</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight text-balance">
            {data.h1}
          </h1>
          <p className="text-lg text-offwhite-dark leading-relaxed mb-8">{data.lead}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get a Free Quote
            </Link>
            <a href="tel:+17206791230" className="btn-outline inline-flex items-center gap-2">
              Call (720) 679-1230
            </a>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {data.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-2xl font-bold text-mint mb-3">{s.heading}</h2>
              <div className="space-y-4 text-offwhite-dark leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-8 text-center">
            Frequently Asked <span className="text-mint">Questions</span>
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {data.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="font-display text-lg font-semibold text-offwhite mb-2">{f.q}</h3>
                <p className="text-offwhite-dark text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related */}
      {data.related.length > 0 && (
        <section className="pb-8 px-[6vw] relative z-10">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-3">
            {data.related.map((r) => {
              const cls =
                'text-sm px-4 py-2 rounded-lg bg-charcoal-light border border-white/10 text-offwhite-dark hover:border-mint/40 hover:text-mint transition-colors';
              return r.external ? (
                <a key={r.to} href={r.to} className={cls}>
                  {r.label}
                </a>
              ) : (
                <Link key={r.to} to={r.to} className={cls}>
                  {r.label}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4">{data.ctaTitle}</h2>
          <p className="text-offwhite-dark mb-8">{data.ctaBody}</p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get a Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
