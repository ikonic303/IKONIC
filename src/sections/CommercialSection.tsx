import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Store } from 'lucide-react';
import PhotoFrame from '../components/PhotoFrame';

const items = [
  'Storefront window tint — heat, glare, and energy savings on retail and office glass',
  'Privacy & decorative film for conference rooms, clinics, and street-facing glass',
  'Security & safety film that holds broken glass in the frame',
  'Custom window graphics — hours, logos, offers, and full-window art',
  'Business branding & promotional graphics that match your storefront',
];

export default function CommercialSection() {
  return (
    <section
      id="commercial"
      className="relative z-20 bg-charcoal/90 backdrop-blur-sm py-20 lg:py-28 scroll-mt-24"
    >
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="text-micro text-mint mb-4">ALSO AVAILABLE · SECONDARY SERVICE</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
              Commercial Storefront Film &amp; Graphics
            </h2>
            <p className="text-offwhite-dark mb-6">
              Beyond homes, ikonic tints and brands commercial storefronts across Denver. It&rsquo;s
              a supporting service to our residential work — same crew, same clean install,
              scheduled around your business hours.
            </p>
            <ul className="space-y-2.5 mb-8">
              {items.map((it) => (
                <li key={it} className="flex items-start gap-3 text-sm text-offwhite-dark">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mint flex-shrink-0" />
                  {it}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/window-tint/office"
                className="btn-primary inline-flex items-center gap-2 text-sm"
              >
                Commercial Storefront Tint <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/storefront-graphics" className="btn-outline inline-flex items-center gap-2 text-sm">
                Storefront Film &amp; Graphics
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
            <PhotoFrame
              alt="Denver storefront glass with solar-control window tint"
              label="Storefront tint"
              aspect="aspect-[3/4]"
              className="mt-8"
            >
              <Store className="absolute right-3 bottom-3 w-5 h-5 text-mint/40" />
            </PhotoFrame>
            <PhotoFrame
              alt="Office conference room glass with frosted privacy film and window graphics"
              label="Privacy film & graphics"
              aspect="aspect-[3/4]"
            >
              <Building2 className="absolute right-3 bottom-3 w-5 h-5 text-mint/40" />
            </PhotoFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
