import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

// Residential window tinting is the primary service — the dropdown lists the
// overview hub plus every dedicated film page.
const residentialLinks = [
  { label: 'Residential Window Tinting', href: '/window-tint' },
  { label: 'Solar & Heat-Rejection Film', href: '/window-tint/solar-heat' },
  { label: 'UV & Fade Protection Film', href: '/window-tint/uv-protection' },
  { label: 'Privacy Window Film', href: '/window-tint/privacy' },
  { label: 'Frosted & Decorative Film', href: '/window-tint/decorative-privacy' },
  { label: 'Security & Safety Film', href: '/window-tint/security-film' },
  { label: 'Films & Pricing', href: '/window-tint/films-and-pricing' },
];

// Commercial is the secondary service — grouped under one dropdown so residential
// stays the clear primary in the bar. Kept in sync with the footer's Commercial column.
const commercialLinks = [
  { label: 'Storefront Window Tint', href: '/window-tint/office' },
  { label: 'Storefront Film & Window Graphics', href: '/storefront-graphics' },
  { label: 'Privacy & Decorative Film', href: '/window-tint/decorative-privacy' },
  { label: 'Business Branding & Promo Graphics', href: '/storefront-graphics' },
];

// City pages are prerendered SPA routes served by static HTML (vercel rewrites),
// so these use full-page <a> loads.
const areaLinks = [
  { label: 'Wheat Ridge', href: '/service-areas/wheat-ridge' },
  { label: 'Arvada', href: '/service-areas/arvada' },
  { label: 'Lakewood', href: '/service-areas/lakewood' },
  { label: 'Golden', href: '/service-areas/golden' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<null | 'residential' | 'commercial' | 'areas'>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  const linkCls =
    'text-sm font-medium text-offwhite-dark hover:text-mint transition-colors';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isScrolled || isMobileMenuOpen ? 'bg-charcoal/95 backdrop-blur-md py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="px-[6vw] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-ikonic.webp"
              alt="ikonic"
              style={{ height: isScrolled || isMobileMenuOpen ? '44px' : '64px', width: 'auto' }}
              className="transition-all duration-300 group-hover:brightness-0 group-hover:invert-[.8] group-hover:sepia group-hover:saturate-[500%] group-hover:hue-rotate-[100deg]"
            />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-5">
            <Link to="/" className={linkCls}>Home</Link>

            {/* Residential dropdown (primary) */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'residential' ? null : 'residential')}
                onMouseEnter={() => setOpenMenu('residential')}
                className="flex items-center gap-1 text-sm font-semibold text-offwhite hover:text-mint transition-colors"
              >
                Residential Tinting
                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'residential' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'residential' && (
                <div
                  onMouseLeave={() => setOpenMenu(null)}
                  className="absolute top-full left-0 mt-2 w-64 bg-charcoal border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  {residentialLinks.map((l) => (
                    <Link
                      key={l.href}
                      to={l.href}
                      className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Commercial dropdown (secondary) */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'commercial' ? null : 'commercial')}
                onMouseEnter={() => setOpenMenu('commercial')}
                className={`flex items-center gap-1 ${linkCls}`}
              >
                Commercial
                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'commercial' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'commercial' && (
                <div
                  onMouseLeave={() => setOpenMenu(null)}
                  className="absolute top-full left-0 mt-2 w-72 bg-charcoal border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  {commercialLinks.map((l) => (
                    <Link
                      key={l.label}
                      to={l.href}
                      className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/gallery" className={linkCls}>Gallery</Link>

            {/* Service areas dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === 'areas' ? null : 'areas')}
                onMouseEnter={() => setOpenMenu('areas')}
                className={`flex items-center gap-1 ${linkCls}`}
              >
                Service Areas
                <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'areas' ? 'rotate-180' : ''}`} />
              </button>
              {openMenu === 'areas' && (
                <div
                  onMouseLeave={() => setOpenMenu(null)}
                  className="absolute top-full left-0 mt-2 w-48 bg-charcoal border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  {areaLinks.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors"
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link to="/blogs" className={linkCls}>Blog</Link>
            <Link to="/about" className={linkCls}>About</Link>

            <Link to="/contact" className="btn-primary text-sm">
              Get a Free Estimate
            </Link>
          </div>

          <button
            className="lg:hidden text-offwhite"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile */}
      <div
        className={`fixed inset-0 bg-charcoal z-[99] overflow-y-auto overscroll-contain transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="min-h-full w-full max-w-xs mx-auto flex flex-col items-center justify-center gap-4 px-6 pt-24 pb-32 text-center">
          <Link to="/" className="text-xl font-display font-bold text-offwhite hover:text-mint transition-colors">Home</Link>

          <div className="w-full">
            <p className="text-mint text-xs font-semibold uppercase tracking-wider mb-2">Residential Tinting</p>
            {residentialLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                className="block text-base font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-1 leading-tight"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="w-full">
            <p className="text-mint text-xs font-semibold uppercase tracking-wider mb-2">Commercial</p>
            {commercialLinks.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className="block text-base font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-1 leading-tight"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link to="/gallery" className="text-xl font-display font-bold text-offwhite hover:text-mint transition-colors">Gallery</Link>

          <div className="w-full">
            <p className="text-mint text-xs font-semibold uppercase tracking-wider mb-2">Service Areas</p>
            {areaLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="block text-base font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-1 leading-tight"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link to="/blogs" className="text-xl font-display font-bold text-offwhite hover:text-mint transition-colors">Blog</Link>
          <Link to="/about" className="text-xl font-display font-bold text-offwhite hover:text-mint transition-colors">About</Link>
          <Link to="/contact" className="btn-primary mt-2">Get a Free Estimate</Link>
        </div>
      </div>
    </>
  );
}
