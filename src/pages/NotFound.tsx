import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

/**
 * 404 page. `noIndex` is the important part: without it every mistyped, stale or
 * invented URL on the domain returned 200 with the HOMEPAGE's title and canonical,
 * which tells Google there are infinitely many copies of the homepage.
 */
export default function NotFound() {
  return (
    <div className="relative bg-charcoal min-h-screen flex flex-col">
      <PageSEO
        title="Page Not Found"
        description="That page doesn't exist. Find vehicle wraps, signage, and marketing for Denver businesses at ikonic303."
        noIndex
      />
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="text-mint font-mono text-sm tracking-widest mb-4">404</p>
          <h1 className="text-3xl md:text-4xl font-bold text-offwhite mb-4">
            That page doesn't exist
          </h1>
          <p className="text-offwhite-dark mb-10">
            The link may be out of date, or the address slightly off. Here's where most
            people are heading:
          </p>

          <div className="grid sm:grid-cols-2 gap-3 text-left mb-10">
            <Link to="/services" className="block bg-charcoal-light/80 border border-white/10 rounded-xl px-5 py-4 hover:border-mint transition-colors">
              <span className="block text-offwhite font-medium">Services</span>
              <span className="block text-offwhite-dark text-sm">Wraps, signage &amp; marketing</span>
            </Link>
            <Link to="/wrap-calculator" className="block bg-charcoal-light/80 border border-white/10 rounded-xl px-5 py-4 hover:border-mint transition-colors">
              <span className="block text-offwhite font-medium">Wrap calculator</span>
              <span className="block text-offwhite-dark text-sm">Estimate your vehicle</span>
            </Link>
            <Link to="/blogs" className="block bg-charcoal-light/80 border border-white/10 rounded-xl px-5 py-4 hover:border-mint transition-colors">
              <span className="block text-offwhite font-medium">Guides</span>
              <span className="block text-offwhite-dark text-sm">Marketing for local business</span>
            </Link>
            <Link to="/contact" className="block bg-charcoal-light/80 border border-white/10 rounded-xl px-5 py-4 hover:border-mint transition-colors">
              <span className="block text-offwhite font-medium">Contact</span>
              <span className="block text-offwhite-dark text-sm">Talk to us about a project</span>
            </Link>
          </div>

          <p className="text-offwhite-dark text-sm">
            Or call <a href="tel:+17206791230" className="text-mint hover:underline">(720) 679-1230</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
