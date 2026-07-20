import { Helmet } from 'react-helmet-async';

// Brand token is "ikonic303" (Josh 2026-07-20: "ikonic303 branding on all pages") — used for
// og:site_name and the title suffix. The check below is case-insensitive so a title already
// naming the brand never gets a second one appended.
const SITE_NAME = 'ikonic303';
// The canonical host is the APEX ikonic303.com. ikonicmarketing303.com is the EMAIL domain and
// also serves this site at HTTP 200, so pointing canonicals there told Google the preferred
// copy of every page lived on the other hostname — splitting authority across two domains.
// Keep this in sync with vercel.json's host redirect and index.html's canonical.
const BASE_URL = 'https://ikonic303.com';
const DEFAULT_IMAGE = `${BASE_URL}/logo-ikonic.webp`;

interface PageSEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

export default function PageSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  noIndex = false,
}: PageSEOProps) {
  const fullTitle = title.toLowerCase().includes(SITE_NAME.toLowerCase())
    ? title
    : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
