import { useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const robotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isMobile) return; // Skip all GSAP work on mobile

    const section = sectionRef.current;
    if (!section) return;

    // Dynamically import GSAP only on desktop
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const loadTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

        loadTl
          .fromTo(headlineRef.current?.querySelectorAll('.headline-line') || [],
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
            0.2
          )
          .fromTo(subheadRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            0.5
          )
          .fromTo(ctaRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            0.7
          )
          .fromTo(robotRef.current,
            { x: 100, opacity: 0, scale: 0.8 },
            { x: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
            0.4
          );

        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6,
            onLeaveBack: () => {
              gsap.set([headlineRef.current, subheadRef.current, ctaRef.current, robotRef.current], {
                opacity: 1, x: 0, y: 0
              });
            }
          }
        });

        scrollTl
          .fromTo(headlineRef.current,
            { y: 0, opacity: 1 },
            { y: '-30vh', opacity: 0.2, ease: 'power2.in' },
            0.70
          )
          .to(headlineRef.current, { opacity: 0, ease: 'power2.in' }, 0.95)
          .fromTo(subheadRef.current,
            { y: 0, opacity: 1 },
            { y: '-20vh', opacity: 0, ease: 'power2.in' },
            0.72
          )
          .fromTo(ctaRef.current,
            { y: 0, opacity: 1 },
            { y: '-15vh', opacity: 0, ease: 'power2.in' },
            0.74
          )
          .fromTo(robotRef.current,
            { x: 0, opacity: 1 },
            { x: '30vw', opacity: 0.2, ease: 'power2.in' },
            0.70
          )
          .to(robotRef.current, { opacity: 0, ease: 'power2.in' }, 0.95);
      }, section);

      return () => ctx.revert();
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="section-pinned bg-charcoal/80 backdrop-blur-sm z-10"
    >
      {/* Content */}
      <div className="relative z-20 flex items-center min-h-[100svh] lg:h-full">
        <div className="w-full px-[6vw] py-24 lg:py-0 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left - Text content */}
          <div className="max-w-2xl">
            <h1 ref={headlineRef} className="space-y-1 mb-6">
              <div className="headline-line text-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-offwhite leading-tight">
                DIGITAL MARKETING
              </div>
              <div className="headline-line text-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
                <span className="text-offwhite">AUTOMATION: YOUR</span>{' '}
                <span className="text-mint drop-shadow-[0_0_15px_rgba(0,255,157,0.8)]">24/7</span>
              </div>
              <div className="headline-line text-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-offwhite leading-tight">
                LEAD CAPTURE SYSTEM
              </div>
            </h1>

            <p
              ref={subheadRef}
              className="text-base md:text-xl text-offwhite-dark leading-relaxed mb-8 max-w-xl"
            >
              We help Denver-area businesses build complete automated sales systems — from
              high-converting websites and sales funnels to CRM, automation, and lead flow —
              all inside one powerful, custom platform.
            </p>

            <div ref={ctaRef} className="flex flex-wrap gap-3">
              <Link 
                to="/contact"
                className="btn-primary flex items-center gap-2"
              >
                Start Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/learn-more"
                className="btn-outline"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Right - Robot mascot */}
          <div 
            ref={robotRef}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative">
              <div className="w-80 h-80 relative">
                {/* Robot body */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-56 bg-gradient-to-b from-mint/80 to-mint-dark/80 rounded-3xl relative shadow-2xl">
                    {/* Head */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-32 bg-gradient-to-b from-white to-mint/20 rounded-2xl shadow-lg">
                      {/* Eyes */}
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3">
                        <div className="w-8 h-8 bg-mint rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,157,1)]" />
                        <div className="w-8 h-8 bg-mint rounded-full animate-pulse shadow-[0_0_20px_rgba(0,255,157,1)]" />
                      </div>
                    </div>
                    {/* Body details */}
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-20 h-20 bg-mint/30 rounded-full animate-glow" />
                    {/* Arms */}
                    <div className="absolute top-16 -left-8 w-8 h-24 bg-gradient-to-b from-mint/60 to-mint-dark/60 rounded-full rotate-12" />
                    <div className="absolute top-16 -right-8 w-8 h-24 bg-gradient-to-b from-mint/60 to-mint-dark/60 rounded-full -rotate-12" />
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-mint/20 blur-3xl rounded-full animate-glow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
