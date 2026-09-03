import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

// The 4 city pages are prerendered SPA routes served by the static HTML in
// public/service-areas/ (vercel rewrites). Use full-page <a> loads.
const areas = [
  { name: 'Wheat Ridge', href: '/service-areas/wheat-ridge', note: 'Home base — fastest scheduling' },
  { name: 'Arvada', href: '/service-areas/arvada', note: 'Olde Town to the newer corridors' },
  { name: 'Lakewood', href: '/service-areas/lakewood', note: 'Belmar and the Green Mountain area' },
  { name: 'Golden', href: '/service-areas/golden', note: 'Downtown and the foothills' },
];

export default function ServiceAreasSection() {
  return (
    <section id="service-areas" className="relative z-20 py-20 lg:py-28">
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-micro text-mint mb-4">SERVICE AREAS</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
            Residential Window Tinting Across the Denver Metro
          </h2>
          <p className="text-offwhite-dark">
            Based in Wheat Ridge and serving homes throughout the west metro and greater Denver.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {areas.map((a) => (
            <a
              key={a.name}
              href={a.href}
              className="group rounded-2xl border border-white/10 bg-charcoal-light/70 p-6 hover:border-mint/40 transition-colors"
            >
              <MapPin className="w-5 h-5 text-mint mb-3" />
              <p className="font-display text-lg font-bold text-offwhite group-hover:text-mint transition-colors">
                {a.name}
              </p>
              <p className="text-xs text-offwhite-dark mt-1">{a.note}</p>
            </a>
          ))}
        </div>

        <p className="text-center text-sm text-offwhite-dark mt-8">
          Also serving Denver, Edgewater, Applewood, and nearby communities.{' '}
          <Link to="/contact" className="text-mint hover:underline">
            Not sure if we cover you? Ask.
          </Link>
        </p>
      </div>
    </section>
  );
}
