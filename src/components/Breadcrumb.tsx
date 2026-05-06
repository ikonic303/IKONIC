import { Link } from 'react-router-dom';

interface Crumb {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  const BASE = 'https://ikonicmarketing303.com';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${BASE}${c.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="text-xs text-white/40 flex items-center gap-1.5 mb-6">
        {crumbs.map((c, i) => (
          <span key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <span>/</span>}
            {i < crumbs.length - 1 ? (
              <Link to={c.href} className="hover:text-white/70 transition-colors">
                {c.name}
              </Link>
            ) : (
              <span className="text-white/60">{c.name}</span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
