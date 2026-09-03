import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Check, Minus, EyeOff, Sun, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const howItWorks = [
  {
    step: '1',
    title: 'Free In-Home Estimate',
    description: 'We visit, look at the actual glass and rooms, and talk through your goals — heat, glare, privacy, fading, or a decorative look.'
  },
  {
    step: '2',
    title: 'Glass Check & Written Quote',
    description: 'We match your glass to the film manufacturer’s compatibility chart, then send one clear number with the right film spec’d per window.'
  },
  {
    step: '3',
    title: 'Clean Installation',
    description: 'Dust-controlled prep with floors and furniture protected, finished edges on every pane — most homes done in a single visit.'
  },
  {
    step: '4',
    title: 'Warranty & Care',
    description: 'Manufacturer film warranty plus our workmanship guarantee, with simple care instructions. We come back if anything isn’t right.'
  }
];

const benefits = [
  { icon: Sun, title: 'Heat & Glare Control', desc: 'Solar film cuts the load on west- and south-facing glass so hot rooms stay usable all day.' },
  { icon: Shield, title: 'Fade Protection', desc: 'Up to 99% UV blocking slows fading on hardwood, carpet, furniture, and artwork.' },
  { icon: EyeOff, title: 'Privacy & Comfort', desc: 'Daytime privacy film and a more even temperature room to room, without losing daylight.' },
  { icon: Clock, title: 'Energy Savings', desc: 'Less solar heat gain lowers the AC load in summer; low-E options help hold heat in winter.' }
];

export default function LearnMore() {
  const heroRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="How Home Window Tinting Works | ikonic303 Denver"
        description="How ikonic scopes and installs residential window film in the Denver metro: free in-home estimate, glass compatibility check, one written quote, a clean one-day install, and a manufacturer-backed warranty."
        canonical="/learn-more"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">HOW HOME WINDOW TINTING WORKS</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Checked First,<br />
            <span className="text-mint">Installed Clean</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            The wrong film on the wrong glass can crack a pane or void its warranty. So every
            ikonic home job starts with a free in-home look at your actual windows — then one
            written quote, a clean one-day install, and a warranty behind it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get a Free Home Tint Estimate
            </a>
            <Link to="/window-tint" className="btn-outline">
              Residential Window Tinting
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            The Problem With <span className="text-mint">Quoting Blind</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Film applied to incompatible glass can crack the pane or fail the seal',
              'A phone quote misses orientation, glass type, and access',
              'Cheap film hazes, purples, or peels within a couple of Colorado summers',
              'One film for the whole house instead of the right film per window',
              'Surprise add-ons after the crew is already at your door'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-charcoal rounded-lg">
                <div className="w-6 h-6 bg-white/5 border border-white/10 rounded flex items-center justify-center flex-shrink-0">
                  <Minus className="w-3.5 h-3.5 text-offwhite-dark" />
                </div>
                <span className="text-offwhite-dark">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            The <span className="text-mint">Ikonic</span> Way
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'A free in-home estimate — we see the actual glass before quoting',
              'Every window checked against the film manufacturer’s compatibility chart',
              'The right film recommended per window, not one film for the whole house',
              'One written quote — the number you see is the number you pay',
              'Dust-controlled prep, home protected, finished edges on every pane'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-charcoal-light rounded-lg border border-mint/30">
                <div className="w-6 h-6 bg-mint/20 rounded flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-mint" />
                </div>
                <span className="text-offwhite">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            How It <span className="text-mint">Works</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Four steps from first call to warranty.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-mint rounded-full flex items-center justify-center text-charcoal font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-3 mt-4">{step.title}</h3>
                <p className="text-offwhite-dark text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            What Home Window Film <span className="text-mint">Does</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            The difference the right film makes in a Denver house.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{benefit.title}</h3>
                <p className="text-offwhite-dark text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Rooms We Tint <span className="text-mint">Most</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            The parts of a Denver home where film earns its keep first.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'West-Facing Living Rooms',
              'Upstairs Bedrooms',
              'Sunrooms',
              'Home Offices',
              'Kitchens & Nooks',
              'Bathrooms',
              'Entry & Sidelights',
              'Patio & Sliding Doors'
            ].map((business, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-lg p-4 text-center">
                <span className="text-offwhite">{business}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready for a Free In-Home Estimate?
          </h2>
          <p className="text-offwhite-dark mb-8">
            No commitment — we check your windows and send one clear written quote.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Phone className="w-5 h-5" />
            Call (720) 679-1230
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
