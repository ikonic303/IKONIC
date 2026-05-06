import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, Check, Phone, MapPin, TrendingUp, Shield } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Google Business Profile optimization',
  'Automated 5-star review collection',
  'Review response management',
  'Local SEO strategy and implementation',
  'Reputation monitoring and alerts',
  'Negative review mitigation'
];

const stats = [
  { value: '94%', label: 'Consumers read reviews before buying' },
  { value: '4.5+', label: 'Star rating needed for trust' },
  { value: '3x', label: 'More visibility with optimization' }
];

export default function ReputationManagement() {
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
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }, { name: 'Reputation Management', href: '/services/reputation' }]} />
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">REPUTATION MANAGEMENT</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Build Your <span className="text-mint">5-Star Reputation</span><br />
            & Dominate Local Search
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Professional reputation management services for Colorado businesses. We optimize 
            your Google Business Profile, automate review collection, and boost your local SEO 
            rankings. Turn satisfied customers into online advocates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Free Analysis
            </a>
            <a href="/#services" className="btn-outline">
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6">
                <p className="text-4xl font-bold text-mint mb-2">{stat.value}</p>
                <p className="text-offwhite-dark">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                What Our <span className="text-mint">Reputation Service</span> Includes
              </h2>
              <p className="text-offwhite-dark mb-8">
                We handle every aspect of your online reputation, from Google Business Profile 
                optimization to automated review collection. Our proven system helps Colorado 
                businesses build trust and attract more customers.
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-mint/10 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-mint" />
                    </div>
                    <span className="text-offwhite">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8">
              <Star className="w-16 h-16 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                Why Reviews Matter
              </h3>
              <p className="text-offwhite-dark mb-6">
                Your online reputation directly impacts your bottom line. Businesses with 
                4.5+ star ratings get 3x more clicks and convert 70% more leads than those 
                with lower ratings.
              </p>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 fill-mint text-mint" />
                ))}
              </div>
              <p className="text-offwhite text-sm">Average client rating after 90 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Local SEO Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Local SEO <span className="text-mint">Optimization</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            We optimize your Google Business Profile to help you rank higher in local search 
            results and Google Maps.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Google Maps Ranking', desc: 'Appear in the top 3 local pack results' },
              { icon: TrendingUp, title: 'Search Visibility', desc: 'Rank higher for local keywords' },
              { icon: Star, title: 'Review Generation', desc: 'Automated system to collect more reviews' },
              { icon: Shield, title: 'Reputation Protection', desc: 'Monitor and respond to all reviews' }
            ].map((item, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{item.title}</h3>
                <p className="text-offwhite-dark text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Reputation Management in <span className="text-mint">Colorado</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              Your online reputation can make or break your business. In today's digital world, 
              potential customers research businesses online before making a purchase decision. 
              Our reputation management services help Colorado businesses build and maintain 
              a stellar online presence.
            </p>
            <p>
              We specialize in Google Business Profile optimization, review management, and 
              local SEO. Our automated systems make it easy to collect positive reviews from 
              satisfied customers while addressing negative feedback professionally.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              What is Reputation Management?
            </h3>
            <p>
              Reputation management is the practice of monitoring, influencing, and improving 
              how your business is perceived online. This includes managing reviews, optimizing 
              your Google Business Profile, and ensuring accurate business information across 
              all platforms.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              Why Your Business Needs It
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>94% of consumers read online reviews before making a purchase</li>
              <li>Businesses with 4+ stars get significantly more clicks</li>
              <li>Local SEO helps you appear in Google Maps searches</li>
              <li>Positive reviews build trust and credibility</li>
              <li>Responding to reviews shows you care about customers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Build Your 5-Star Reputation?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Get a free reputation analysis and see how we can improve your online presence.
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
