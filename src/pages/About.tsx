import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home, Sun, MapPin, ShieldCheck, Target, Zap, Shield, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Home, label: 'Denver-Area Homes Tinted', value: '1,000s' },
  { icon: Sun, label: 'UV Blocked by Quality Film', value: '99%' },
  { icon: MapPin, label: 'Denver-Metro Service Radius', value: '30 mi' },
  { icon: ShieldCheck, label: 'Manufacturer Film Warranty', value: 'Lifetime' }
];

const values = [
  { icon: Target, title: 'Right Film, Right Window', desc: 'We recommend a film per window and check your glass against the manufacturer chart before we quote.' },
  { icon: Zap, title: 'Clean, One-Day Installs', desc: 'Dust-controlled prep, floors and furniture protected, and finished edges on every pane.' },
  { icon: Shield, title: 'One Honest Number', desc: 'No hidden fees and no surprise add-ons at the end of the job.' },
  { icon: Heart, title: 'No Pressure', desc: 'A free in-home estimate and a clear quote — decide on your timeline, not ours.' }
];

export default function About() {
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
        title="About ikonic303 | Denver Residential Window Tinting"
        description="ikonic is a Wheat Ridge, CO window film company specializing in residential window tinting for the Denver metro — heat, glare, UV, privacy, and energy savings. Commercial storefront tint and graphics also available."
        canonical="/about"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">ABOUT IKONIC</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Denver&rsquo;s Residential<br />
            <span className="text-mint">Window Tinting Specialists</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            ikonic is a Wheat Ridge, Colorado window film company. Home window tinting is what we do
            most — heat, glare, UV, privacy, and energy savings for houses across the Denver metro.
            Commercial storefront tint and graphics are a supporting service.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            Our <span className="text-mint">Story</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              ikonic started with an obsession for making surfaces look flawless. Today that focus
              lives in residential window film: getting the right product on the right glass, and
              installing it so cleanly you forget it&rsquo;s there.
            </p>
            <p>
              A Denver home has west-facing rooms that overheat, floors fading in the sun, and
              windows that face a neighbor a little too closely. We&rsquo;ve solved those same
              problems in hundreds of houses — and we recommend a film per window rather than one
              film for the whole place.
            </p>
            <p>
              We serve the Denver metro: Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver.
              Most homes are installed in a single visit. We also tint and brand commercial
              storefronts as a secondary service.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                Our <span className="text-mint">Standard</span>
              </h2>
              <p className="text-offwhite-dark mb-6">
                We only install film a manufacturer's compatibility chart says is safe for your
                glass. Single-pane, dual-pane, low-E, tempered, and laminated glass each behave
                differently, and the wrong film can crack a pane or void its seal warranty — so we
                check first, at the free in-home estimate.
              </p>
              <p className="text-offwhite-dark">
                Then a clean, dust-controlled install with your floors and furniture protected,
                finished edges on every pane, and a manufacturer warranty plus our workmanship
                guarantee behind it.
              </p>
            </div>
            <div className="bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4">
                What Makes Us Different
              </h3>
              <ul className="space-y-3">
                {[
                  'Residential window tinting is our specialty',
                  'A film recommended per window, not one for the whole house',
                  'Glass checked against the film chart before quoting',
                  'Free in-home estimate — one written quote, no add-ons',
                  'Clean, one-day install with your home protected'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-offwhite">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Our <span className="text-mint">Values</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            The rules we don't bend, on every job.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{value.title}</h3>
                <p className="text-offwhite-dark text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            By the <span className="text-mint">Numbers</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            What the work adds up to.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
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

      {/* CTA Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready for a Free Estimate?
          </h2>
          <p className="text-offwhite-dark mb-8">
            We visit your home, look at the actual windows, and send one clear written quote.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get a Free Home Tint Estimate
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
