/**
 * DEPRECATED — not imported anywhere. This was the pre-refocus homepage "Services"
 * grid; the residential-first homepage (App.tsx, 2026-09-04) uses HomeBenefitsSection
 * + FilmOptionsSection + CommercialSection instead. Kept for reference only. The
 * `/signage` and `/wayfinding` links below are dead (those pages now 301 to
 * /storefront-graphics). Delete this file once nothing needs the old copy.
 */
import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import {
  Sun,
  Home,
  Building2,
  LayoutGrid,
  Shield,
  Signpost,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Service pages are React Router routes (src/pages/services) — internal <Link>s.
const services = [
  {
    icon: Sun,
    title: 'Architectural Window Film',
    description: 'Flat-glass film for homes and buildings — heat rejection, glare control, UV protection, privacy, and security. We confirm your glass is compatible before any commitment.',
    features: ['Heat & glare rejection', '99% UV blocking', 'Privacy & security films', 'Compatibility checked on-site'],
    link: '/window-tint'
  },
  {
    icon: Home,
    title: 'Residential Window Tint',
    description: 'Fix hot upstairs rooms, sun-faded floors, and harsh afternoon light without changing how your home looks from the street. Free written quote after we check your windows.',
    features: ['West-facing room relief', 'Fade protection for floors & furniture', 'Low-profile finish', 'Lifetime film warranty'],
    link: '/window-tint/home'
  },
  {
    icon: Building2,
    title: 'Commercial Window Tint',
    description: 'Cut cooling costs and screen glare across offices, clinics, and multi-tenant buildings — installed after hours so your team never loses a workday.',
    features: ['Lower cooling load', 'Screen-glare reduction', 'Tenant-consistent look', 'After-hours install'],
    link: '/window-tint/office'
  },
  {
    icon: LayoutGrid,
    title: 'Storefront & Window Graphics',
    description: 'Turn plain glass into a storefront that sells — window graphics, frosted privacy vinyl, hours and service lists, perforated film, and full storefront branding.',
    features: ['Cut vinyl & full-color prints', 'Frosted & etched-glass looks', 'Perforated see-through film', 'Wall murals & interior branding'],
    link: '/storefront-graphics'
  },
  {
    icon: Signpost,
    title: 'Signage & Visual Graphics',
    description: 'Storefront and building signage designed, fabricated, and installed on-site — dimensional letters, illuminated signs, banners, and interior branding that matches your glass.',
    features: ['Dimensional & lit letters', 'Monument & blade signs', 'Banners & event graphics', 'Permit drawings handled'],
    link: '/signage'
  },
  {
    icon: Shield,
    title: 'Wayfinding & ADA Signage',
    description: 'Directional, room ID, and ADA-compliant signage for offices, medical buildings, and campuses — a consistent system that cuts front-desk questions.',
    features: ['ADA-compliant room ID', 'Directional systems', 'Parking & exterior wayfinding', 'Brand-matched design'],
    link: '/wayfinding'
  }
];

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Respect reduced-motion: skip the reveal entirely so content is just there.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 88%',
            once: true
          }
        }
      );

      // Cards animation
      const cards = cardsRef.current?.querySelectorAll('.service-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 88%',
              once: true
            }
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="services" 
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-micro text-mint mb-4">WHAT WE DO</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6">
            Window Film, Graphics &<br />
            <span className="text-mint">Signage — Under One Roof</span>
          </h2>
          <p className="text-lg text-offwhite-dark max-w-3xl mx-auto">
            One Wheat Ridge shop for the whole exterior of your building — architectural window
            tint, storefront and window graphics, signage, and wayfinding — so every surface a
            customer sees looks like the same company.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="service-card group bg-charcoal-light border border-white/10 rounded-xl p-8 hover:border-mint/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,255,157,0.15)]"
            >
              <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-mint/20 transition-colors">
                <service.icon className="w-7 h-7 text-mint" />
              </div>
              
              <h3 className="font-display text-xl font-bold text-offwhite mb-4">
                {service.title}
              </h3>
              
              <p className="text-offwhite-dark text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2 text-sm text-offwhite-dark">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Link
                to={service.link}
                className="inline-flex items-center gap-2 text-mint text-sm font-medium hover:gap-3 transition-all"
              >
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-offwhite-dark mb-6">
            We design, print, and install everything in-house — and we check your glass and
            walk your site before quoting, so the number you get is the number you pay.
          </p>
          <Link
            to="/contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            Book a Free On-Site Consultation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
