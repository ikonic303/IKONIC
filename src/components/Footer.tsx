import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

// `ext: true` = prerendered static HTML page (vercel rewrite) → full-page <a>.
const residential = [
  { label: 'Residential Window Tinting', href: '/window-tint' },
  { label: 'Solar & Heat-Rejection Film', href: '/window-tint/solar-heat' },
  { label: 'UV & Fade Protection', href: '/window-tint/uv-protection' },
  { label: 'Privacy Window Film', href: '/window-tint/privacy' },
  { label: 'Decorative & Frosted Film', href: '/window-tint/decorative-privacy' },
  { label: 'Security & Safety Film', href: '/window-tint/security-film' },
];

const commercial = [
  { label: 'Storefront Window Tint', href: '/window-tint/office' },
  { label: 'Storefront Film & Window Graphics', href: '/storefront-graphics' },
  { label: 'Privacy & Decorative Film', href: '/window-tint/decorative-privacy' },
  { label: 'Business Branding & Promo Graphics', href: '/storefront-graphics' },
];

const company = [
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blogs' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact / Free Estimate', href: '/contact' },
];

const areas = [
  { label: 'Wheat Ridge', href: '/service-areas/wheat-ridge' },
  { label: 'Arvada', href: '/service-areas/arvada' },
  { label: 'Lakewood', href: '/service-areas/lakewood' },
  { label: 'Golden', href: '/service-areas/golden' },
];

export default function Footer() {
  return (
    <footer className="mt-24 pt-12 border-t border-white/10 relative z-10">
      <div className="px-[6vw]">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <img src="/logo-ikonic.webp" alt="ikonic" style={{ height: '64px', width: 'auto' }} className="mb-4" />
            <p className="text-offwhite-dark text-sm mb-4">
              Professional residential window tinting in Denver — heat, glare, UV, privacy, and
              energy savings. Commercial storefront film &amp; graphics also available.
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+17206791230" className="flex items-center gap-2 text-offwhite-dark hover:text-mint transition-colors">
                  <Phone className="w-4 h-4 text-mint" /> (720) 679-1230
                </a>
              </li>
              <li>
                <a href="mailto:info@ikonic303.com" className="flex items-center gap-2 text-offwhite-dark hover:text-mint transition-colors">
                  <Mail className="w-4 h-4 text-mint" /> info@ikonic303.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-offwhite-dark">
                <MapPin className="w-4 h-4 text-mint" /> Wheat Ridge, CO
              </li>
            </ul>
            <div className="flex gap-3 mt-5">
              <a href="https://www.facebook.com/ikonic303" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all">
                <Facebook className="w-4 h-4 text-offwhite" />
              </a>
              <a href="https://www.instagram.com/ikonic_303/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all">
                <Instagram className="w-4 h-4 text-offwhite" />
              </a>
              <a href="https://www.tiktok.com/@ikonic_303" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-10 h-10 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all">
                <svg className="w-4 h-4 text-offwhite" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {[
            { title: 'Residential Tinting', links: residential },
            { title: 'Commercial', links: commercial },
            { title: 'Company', links: company },
            { title: 'Service Areas', links: areas.map((a) => ({ ...a, ext: true })) },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-offwhite font-medium mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'ext' in l && l.ext ? (
                      <a href={l.href} className="text-offwhite-dark text-sm hover:text-mint transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="text-offwhite-dark text-sm hover:text-mint transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-offwhite-dark text-sm">
            © {new Date().getFullYear()} ikonic. All rights reserved. · Residential &amp; commercial
            window tinting, Denver, CO.
          </p>
        </div>
      </div>
    </footer>
  );
}
