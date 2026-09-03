// JSON-LD builders shared by the service pages. Kept out of JsonLd.tsx so that
// file only exports a component (react-refresh / fast-refresh requirement).

export const LOCAL_BUSINESS = {
  '@type': 'LocalBusiness',
  '@id': 'https://ikonic303.com/#business',
  name: 'ikonic',
  url: 'https://ikonic303.com',
  telephone: '+1-720-679-1230',
  email: 'info@ikonic303.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '4880 Robb St #8',
    addressLocality: 'Wheat Ridge',
    addressRegion: 'CO',
    postalCode: '80033',
    addressCountry: 'US',
  },
} as const;

const AREA_SERVED = ['Wheat Ridge', 'Arvada', 'Lakewood', 'Golden', 'Denver', 'Colorado'];

export function serviceSchema(serviceType: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    name,
    description,
    areaServed: AREA_SERVED,
    provider: LOCAL_BUSINESS,
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
