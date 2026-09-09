import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sun, PanelsTopLeft, MapPin, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: PanelsTopLeft, label: 'Panes & Panels Installed', value: '10K+' },
  { icon: Sun, label: 'UV Blocked by Quality Film', value: '99%' },
  { icon: MapPin, label: 'Denver-Metro Service Radius', value: '30 mi' },
  { icon: ShieldCheck, label: 'Manufacturer Film Warranty', value: 'Lifetime' }
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Respect reduced-motion: skip the reveal entirely so content is just there.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(contentRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 88%',
            once: true
          }
        }
      );

      // Image animation
      gsap.fromTo(imageRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 88%',
            once: true
          }
        }
      );

      // Stats animation
      const statItems = statsRef.current?.querySelectorAll('.stat-item');
      if (statItems) {
        gsap.fromTo(statItems,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
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
      id="about" 
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Left - Image */}
          <div ref={imageRef} className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img 
                src="/innovate_team.jpg" 
                alt="Ikonic Team"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-mint rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,157,0.4)]">
              <p className="text-4xl font-bold text-charcoal">5+</p>
              <p className="text-charcoal/80 text-sm">Years Experience</p>
            </div>
          </div>

          {/* Right - Content */}
          <div ref={contentRef}>
            <p className="text-micro text-mint mb-4">ABOUT US</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight">
              One Shop for Film,<br />
              <span className="text-mint">Graphics &amp; Signage</span>
            </h2>

            <div className="space-y-4 text-offwhite-dark leading-relaxed">
              <p>
                ikonic is a Wheat Ridge, Colorado shop for the visible skin of a building.
                We install architectural window film for homes and businesses, print and apply
                storefront and window graphics, and fabricate and hang signage and wayfinding.
              </p>
              <p>
                The through-line is consistency: the film on your glass, the graphics on your
                windows, and the sign over your door should look like the same company did all
                three — because we did. Design, print, and installation happen under one roof,
                so nothing gets lost between vendors.
              </p>
              <p>
                Every job starts the same way — we check the glass or walk the site, confirm the
                film or substrate is right for the surface, and send one written quote with no
                surprise add-ons.
              </p>
            </div>

            {/* Mission */}
            <div className="mt-8 p-6 bg-charcoal-light border border-mint/30 rounded-xl">
              <h3 className="font-display text-lg font-bold text-mint mb-3">Our Standard</h3>
              <p className="text-offwhite-dark text-sm">
                We only install film a manufacturer's chart says is safe for your glass, we only
                promise timelines we can hold, and we finish the edges you can see and the ones
                you can't. Quality-first, every pane and every panel.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div 
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="stat-item bg-charcoal-light border border-white/10 rounded-xl p-6 text-center hover:border-mint/30 transition-colors"
            >
              <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-mint" />
              </div>
              <p className="text-3xl font-bold text-offwhite mb-1">{stat.value}</p>
              <p className="text-offwhite-dark text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
