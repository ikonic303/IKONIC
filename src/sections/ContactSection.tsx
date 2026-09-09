import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, ArrowRight, Facebook, Instagram } from 'lucide-react';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

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

      // Form animation
      gsap.fromTo(formRef.current,
        { x: -40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top 88%',
            once: true
          }
        }
      );

      // Info animation
      gsap.fromTo(infoRef.current,
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top 88%',
            once: true
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20 scroll-mt-24"
    >
      <div className="px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-micro text-mint mb-4">FREE ESTIMATE</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6">
            Get a Free <span className="text-mint">Home Tint</span><br />Estimate
          </h2>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            Tell us which rooms and windows you want treated and what you&rsquo;re trying to fix —
            heat, glare, privacy, fading, or a decorative look. We&rsquo;ll set up a free in-home
            visit and send one clear written quote, usually within a business day.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 max-w-6xl mx-auto">
          {/* Form */}
          <div
            ref={formRef}
            className="bg-charcoal-light border border-white/10 rounded-2xl p-8 lg:p-10"
          >
            <h3 className="font-display text-2xl font-bold text-offwhite mb-6">
              Request Your Estimate
            </h3>

            <iframe
              src="https://crm.ikonic303.com/widget/form/YoKGheZ0aVCEaSOJQFxY"
              className="w-full h-[1199px] border-0 rounded-[3px] bg-charcoal-light"
              title="Free home window tint estimate request"
              loading="lazy"
            />
          </div>

          {/* Contact Info */}
          <div ref={infoRef} className="space-y-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-offwhite mb-6">
                Prefer to Talk First?
              </h3>
              <p className="text-offwhite-dark mb-8">
                Call or email and we&rsquo;ll answer questions about film for a specific type of
                glass, privacy options, or scheduling — no pressure.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <a 
                href="mailto:info@ikonic303.com"
                className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl hover:border-mint/30 transition-colors"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Email</p>
                  <p className="text-offwhite">info@ikonic303.com</p>
                </div>
              </a>
              
              <a 
                href="tel:+17206791230"
                className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl hover:border-mint/30 transition-colors"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Phone</p>
                  <p className="text-offwhite">+1 (720) 679-1230</p>
                </div>
              </a>
              
              <div className="flex items-center gap-4 p-4 bg-charcoal-light border border-white/10 rounded-xl">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-mint" />
                </div>
                <div>
                  <p className="text-sm text-offwhite-dark">Shop</p>
                  <p className="text-offwhite">4880 Robb St #8, Wheat Ridge, CO 80033</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-offwhite-dark mb-4">Follow Us</p>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/ikonic303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Facebook className="w-5 h-5 text-offwhite" />
                </a>
                <a 
                  href="https://www.instagram.com/ikonic_303/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <Instagram className="w-5 h-5 text-offwhite" />
                </a>
                <a 
                  href="https://www.tiktok.com/@ikonic_303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-charcoal-light border border-white/10 rounded-lg flex items-center justify-center hover:border-mint/30 hover:bg-mint/10 transition-all"
                >
                  <svg className="w-5 h-5 text-offwhite" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/30 rounded-xl p-6">
              <p className="text-offwhite font-medium mb-2">
                Free in-home estimate — no commitment
              </p>
              <p className="text-offwhite-dark text-sm mb-4">
                We look at your actual windows, recommend the right film per room, and send one
                clear written quote.
              </p>
              <a
                href="tel:+17206791230"
                className="inline-flex items-center gap-2 text-mint font-medium hover:gap-3 transition-all"
              >
                Call (720) 679-1230
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </section>
  );
}
