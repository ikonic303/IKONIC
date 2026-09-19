import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';
import PhotoFrame from '../components/PhotoFrame';

// No install photography ships with the repo yet. Drop real photos into
// public/photos/ and add `src` to the items below (e.g. src="/photos/xyz.jpg").
const residentialProjects = [
  { label: 'Living room · solar-control film', alt: 'Denver living room with solar-control window film cutting afternoon heat and glare' },
  { label: 'Primary bedroom · privacy film', alt: 'Primary bedroom window with daytime privacy film' },
  { label: 'Sunroom · heat-rejection film', alt: 'Home sunroom with heat-rejection window film' },
  { label: 'Kitchen · UV-blocking film', alt: 'Kitchen window with near-invisible UV-blocking film protecting cabinetry' },
  { label: 'Entry sidelights · frosted film', alt: 'Front entry sidelights with decorative frosted privacy film' },
  { label: 'Stairwell · low-E winter film', alt: 'Tall stairwell window with low-E film for winter warmth retention' },
  { label: 'Home office · glare-control film', alt: 'Home office window with glare-control film for screen work' },
  { label: 'Patio doors · security film', alt: 'Sliding patio doors with tear-resistant security film' },
];

const commercialProjects = [
  { label: 'Storefront · solar-control tint', alt: 'Denver retail storefront glass with solar-control window tint' },
  { label: 'Office glass wall · privacy film', alt: 'Office conference room glass wall with frosted privacy film' },
  { label: 'Storefront · hours & logo graphics', alt: 'Storefront window with hours and logo vinyl graphics' },
  { label: 'Ground-floor glass · security film', alt: 'Ground-floor storefront glass with security film' },
];

export default function Gallery() {
  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Residential Window Tinting Gallery Denver | ikonic303"
        description="Completed residential window tinting projects across Denver — living rooms, bedrooms, sunrooms, and entryways treated with solar, UV, privacy, and decorative film. Plus commercial storefront tint and graphics."
        canonical="/gallery"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR WORK</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight text-balance">
            Completed Residential Window Tinting Projects
          </h1>
          <p className="text-lg text-offwhite-dark">
            Homes across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver — the right film
            matched to each window for heat, glare, UV, privacy, or a decorative look.
          </p>
        </div>
      </section>

      {/* Residential */}
      <section className="px-[6vw] pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-6">Residential Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {residentialProjects.map((p) => (
              <PhotoFrame key={p.label} alt={p.alt} label={p.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Commercial */}
      <section className="px-[6vw] pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-2">
            Commercial Storefront Projects
          </h2>
          <p className="text-offwhite-dark text-sm mb-6">
            A secondary service — storefront tint, privacy film, and window graphics for Denver
            businesses.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {commercialProjects.map((p) => (
              <PhotoFrame key={p.label} alt={p.alt} label={p.label} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Want This for Your Home?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book a free in-home estimate &mdash; we look at your actual windows and send one clear
            written quote.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get a Free Home Tint Estimate
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
