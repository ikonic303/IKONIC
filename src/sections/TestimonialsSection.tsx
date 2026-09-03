import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Quote } from 'lucide-react';

interface GoogleReview {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  time: string;
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    name: 'Sarah Mitchell',
    title: 'Homeowner, Arvada',
    quote: 'Our west-facing living room was unusable by 3pm every summer. ikonic put heat-rejection film on it and now we actually use that room in the afternoon. Clean install, no bubbles, and they protected the floors while they worked.',
    rating: 5
  },
  {
    name: 'Marcus Chen',
    title: 'Homeowner, Wheat Ridge',
    quote: 'We wanted privacy on the bedroom and bathroom windows that face the neighbor without living behind blinds. The frosted film they recommended is exactly right — private during the day, still bright inside.',
    rating: 5
  },
  {
    name: 'Jake Rodriguez',
    title: 'Homeowner, Lakewood',
    quote: 'The hardwood by the back windows was fading in one obvious stripe. They did near-invisible UV film on the whole back of the house. You can’t tell it’s there and the fading stopped.',
    rating: 5
  },
  {
    name: 'Amanda Foster',
    title: 'Homeowner, Golden',
    quote: 'Estimate was on time, the quote was clear, and the crew was in and out in a day. Our upstairs is noticeably more even temperature now — fewer hot rooms.',
    rating: 5
  },
  {
    name: 'David Park',
    title: 'Property Manager, Denver',
    quote: 'Used ikonic for solar film on a duplex and then for our storefront office. Same clean work both times, fair quote, no add-ons at the end.',
    rating: 5
  },
  {
    name: 'Lisa Thompson',
    title: 'Business Owner, Denver',
    quote: 'They tinted our storefront glass for heat and glare and added privacy film on the back office. Scheduled around our hours so we never closed.',
    rating: 5
  }
];

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [googleTotal, setGoogleTotal] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/google-reviews')
      .then(r => r.json())
      .then(data => {
        if (data.reviews) {
          setGoogleReviews(data.reviews);
          setGoogleRating(data.rating);
          setGoogleTotal(data.total);
        }
      })
      .catch(() => {});
  }, []);

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
      const cards = cardsRef.current?.querySelectorAll('.testimonial-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
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
      className="relative bg-charcoal/90 backdrop-blur-sm py-24 lg:py-32 z-20"
    >
      <div className="px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className="text-micro text-mint mb-4">CUSTOMER REVIEWS</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6">
            What Denver Homeowners <span className="text-mint">Say</span>
          </h2>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            Families across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver trust ikonic
            for residential window tinting that&rsquo;s installed clean and holds up.
          </p>
        </div>

        {/* Google Reviews Banner */}
        {googleReviews.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <GoogleIcon />
              <span className="text-offwhite font-semibold">Google Reviews</span>
              {googleRating && (
                <span className="text-mint font-bold">{googleRating.toFixed(1)}</span>
              )}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${googleRating && i < Math.round(googleRating) ? 'fill-mint text-mint' : 'text-white/20'}`} />
                ))}
              </div>
              {googleTotal && (
                <span className="text-offwhite-dark text-sm">({googleTotal} reviews)</span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {googleReviews.map((review, i) => (
                <div key={i} className="testimonial-card bg-charcoal-light border border-white/10 rounded-xl p-6 hover:border-mint/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-mint to-mint-dark rounded-full flex items-center justify-center">
                          <span className="text-charcoal font-bold">{review.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-offwhite font-medium text-sm">{review.name}</p>
                        <p className="text-offwhite-dark text-xs">{review.time}</p>
                      </div>
                    </div>
                    <GoogleIcon />
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-mint text-mint" />
                    ))}
                  </div>
                  <p className="text-offwhite-dark text-sm leading-relaxed line-clamp-4">"{review.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="testimonial-card bg-charcoal-light border border-white/10 rounded-xl p-8 hover:border-mint/30 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-mint/40 mb-4" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-mint text-mint" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-offwhite-dark leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-mint to-mint-dark rounded-full flex items-center justify-center">
                  <span className="text-charcoal font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-offwhite font-medium">{testimonial.name}</p>
                  <p className="text-offwhite-dark text-sm">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured home project */}
        <div className="mt-16 bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-micro text-mint mb-2">FEATURED HOME PROJECT</p>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-offwhite mb-4">
                Arvada Two-Story: Hot Rooms &amp; Fading, Fixed in a Day
              </h3>
              <p className="text-offwhite-dark mb-6">
                A west-facing living room overheated every afternoon and the hardwood near the back
                windows was fading. We checked the dual-pane glass, spec&rsquo;d a spectrally-selective
                solar film, and installed the whole main floor in one visit.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Glass checked against the film compatibility chart before quoting',
                  'Spectrally-selective solar film on the west and south elevations',
                  'Near-invisible UV film on the fading rooms',
                  'One-day install with floors and furniture protected'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-offwhite-dark text-sm">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center lg:text-right">
              <div className="inline-block bg-charcoal rounded-xl p-8">
                <p className="text-5xl font-bold text-mint mb-2">99%</p>
                <p className="text-offwhite">UV Blocked</p>
                <p className="text-offwhite-dark text-sm mt-2">Living room comfortable all afternoon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
