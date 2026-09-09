import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home, Building2, LayoutGrid, ArrowRight, Phone, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const primary = {
  icon: Home,
  title: 'Residential Window Tinting',
  description:
    'Our main service. Home window film for heat and glare reduction, up to 99% UV protection, daytime privacy, energy savings, and fade protection for floors, furniture, and artwork — plus decorative and security options. We check your glass and recommend the right film per window.',
  features: [
    'Heat & glare reduction',
    '99% UV / fade protection',
    'Privacy & decorative film',
    'Energy-efficient low-E options',
    'Security & safety film',
    'Free in-home estimate',
  ],
  link: '/window-tint',
};

const secondary = [
  {
    icon: Building2,
    title: 'Commercial Storefront Window Tint',
    description:
      'Solar heat and glare control, energy savings, and privacy or security film for retail, offices, and multi-tenant buildings — scheduled around your business hours.',
    features: ['Solar heat & glare control', 'Lower cooling costs', 'Privacy & security film', 'After-hours install'],
    link: '/window-tint/office',
  },
  {
    icon: LayoutGrid,
    title: 'Commercial Storefront Film & Graphics',
    description:
      'Custom window graphics, privacy and decorative film, security film, and business branding & promotional graphics — designed in-house and installed on-site.',
    features: ['Custom window graphics', 'Privacy & decorative film', 'Security film', 'Branding & promo graphics'],
    link: '/storefront-graphics',
  },
];

export default function AllServices() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Window Tinting Services Denver | Residential & Commercial | ikonic303"
        description="ikonic specializes in residential window tinting in Denver — heat, glare, UV, privacy, and energy-efficient home window film. Commercial storefront window tint and graphics are also available as a secondary service."
        canonical="/services"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-3xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR SERVICES</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight text-balance">
            Residential Window Tinting in Denver &mdash;{' '}
            <span className="text-mint">Plus Commercial</span>
          </h1>
          <p className="text-lg text-offwhite-dark mb-8">
            Home window film is what we do most: comfort, privacy, and energy efficiency for Denver
            houses. Commercial storefront tint and graphics are offered as a supporting service.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Get a Free Home Tint Estimate
          </Link>
        </div>
      </section>

      {/* Primary service — featured */}
      <section className="py-14 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-mint/30 bg-charcoal p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-mint/15 flex items-center justify-center">
                  <primary.icon className="w-6 h-6 text-mint" />
                </div>
                <span className="text-micro text-mint">PRIMARY SERVICE</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-3">
                {primary.title}
              </h2>
              <p className="text-offwhite-dark mb-6">{primary.description}</p>
              <Link to={primary.link} className="btn-primary inline-flex items-center gap-2 text-sm">
                Residential window tinting <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="space-y-2.5">
              {primary.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-offwhite">
                  <Check className="w-4 h-4 text-mint flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Secondary services */}
      <section className="py-16 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-2 text-center">
            Also Available: Commercial Storefront Solutions
          </h2>
          <p className="text-offwhite-dark text-center mb-10 max-w-2xl mx-auto text-sm">
            Same crew and clean install as our home jobs — a supporting service, not our focus.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondary.map((s) => (
              <div key={s.title} className="bg-charcoal-light border border-white/10 rounded-xl p-8 hover:border-mint/50 transition-colors">
                <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6">
                  <s.icon className="w-7 h-7 text-mint" />
                </div>
                <h3 className="font-display text-xl font-bold text-offwhite mb-3">{s.title}</h3>
                <p className="text-offwhite-dark text-sm mb-6">{s.description}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-offwhite-dark">
                      <Check className="w-4 h-4 text-mint" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={s.link} className="inline-flex items-center gap-2 text-mint text-sm font-medium hover:gap-3 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Why Homeowners Choose <span className="text-mint">ikonic</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              { title: 'Right Film Per Window', desc: 'We recommend a film for each window, not one film for the whole house.' },
              { title: 'Glass Checked First', desc: 'We confirm your glass against the film compatibility chart before quoting.' },
              { title: 'Clean, One-Day Install', desc: 'Floors and furniture protected; most homes finished in a single visit.' },
            ].map((item) => (
              <div key={item.title} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center">
                <h3 className="font-display text-lg font-bold text-offwhite mb-3">{item.title}</h3>
                <p className="text-offwhite-dark text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-offwhite-dark mt-8">
            <Link to="/window-tint/films-and-pricing" className="text-mint hover:underline">
              See the films we install, their per-square-foot rates, and which are approved on your glass
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">Ready for a Free Estimate?</h2>
          <p className="text-offwhite-dark mb-8">
            We visit your home, look at the actual windows, and send one clear written quote.
          </p>
          <a href="tel:+17206791230" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Phone className="w-5 h-5" />
            Call (720) 679-1230
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
