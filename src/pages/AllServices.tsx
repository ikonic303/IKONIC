import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Settings, Star, Zap, TrendingUp, ArrowRight, Phone, Check, Shield, Sun, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    icon: Globe,
    title: 'Web Design & Funnels',
    description: 'Custom websites and high-converting sales funnels built in GoHighLevel.',
    features: ['Landing pages', 'Sales funnels', 'GHL integration', 'Mobile responsive'],
    link: '/services/web-design'
  },
  {
    icon: Settings,
    title: 'CRM & Automations',
    description: 'Complete GoHighLevel setup with automated workflows that nurture leads.',
    features: ['CRM setup', 'Workflow automation', 'Lead tracking', 'AI integrations'],
    link: '/services/crm-automation'
  },
  {
    icon: Star,
    title: 'Reputation Management',
    description: 'Build your 5-star reputation with Google Business optimization.',
    features: ['Google Business Profile', 'Review automation', 'Local SEO', 'Reputation monitoring'],
    link: '/services/reputation'
  },
  {
    icon: Zap,
    title: 'Speed to Lead',
    description: 'Respond to leads in under 60 seconds with automated follow-up.',
    features: ['Instant SMS', 'Email sequences', 'Missed call text-back', 'Smart routing'],
    link: '/services/speed-to-lead'
  },
  {
    icon: TrendingUp,
    title: 'Marketing Systems',
    description: 'Full-service digital marketing that keeps your pipeline full 24/7.',
    features: ['Campaign management', 'Social media', 'Paid ads', 'Analytics dashboard'],
    link: '/services/marketing'
  },
  {
    icon: Shield,
    title: 'Paint Protection Film (PPF)',
    description: 'Self-healing, invisible film that shields your paint from rock chips and scratches.',
    features: ['Rock-chip defense', 'Self-healing finish', 'Gloss or stealth', 'Up to 10yr warranty'],
    link: '/services/paint-protection-film',
    external: true
  },
  {
    icon: Sun,
    title: 'Window Tint',
    description: 'Ceramic and carbon tint that blocks UV, rejects heat, and cuts glare.',
    features: ['99% UV blocking', 'Heat rejection', 'Colorado-legal', 'Lifetime warranty'],
    link: '/services/window-tint',
    external: true
  },
  {
    icon: Sparkles,
    title: 'Ceramic Coating',
    description: 'Multi-year SiO2 protection with deep gloss and an easy-clean hydrophobic finish.',
    features: ['Mirror gloss', 'Hydrophobic', 'UV & stain resistant', '5yr+ protection'],
    link: '/services/ceramic-coating',
    external: true
  }
];

export default function AllServices() {
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
        title="Digital Marketing Services Denver CO | Ikonic Marketing"
        description="Full-service digital marketing for Denver businesses — web design, GoHighLevel CRM automation, reputation management, speed-to-lead, and marketing systems. All under one roof."
        canonical="/services"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR SERVICES</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Everything You Need to<br />
            <span className="text-mint">Grow Your Business</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            From websites and CRM to automation and marketing, we provide complete 
            digital solutions for Colorado businesses. All integrated, all optimized, 
            all working together.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Get Free Consultation
          </a>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={index}
                className="bg-charcoal border border-white/10 rounded-xl p-8 hover:border-mint/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-mint/10 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-7 h-7 text-mint" />
                </div>
                
                <h3 className="font-display text-xl font-bold text-offwhite mb-3">
                  {service.title}
                </h3>
                
                <p className="text-offwhite-dark text-sm mb-6">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-offwhite-dark">
                      <Check className="w-4 h-4 text-mint" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {service.external ? (
                  <a
                    href={service.link}
                    className="inline-flex items-center gap-2 text-mint text-sm font-medium hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to={service.link}
                    className="inline-flex items-center gap-2 text-mint text-sm font-medium hover:gap-3 transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Why Choose <span className="text-mint">Ikonic</span>?
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            We're not just another agency. We're your growth partner.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'All-in-One Platform', desc: 'Everything integrated in GoHighLevel—no juggling multiple tools.' },
              { title: 'Done-for-You Service', desc: 'We build AND manage your systems so you can focus on your business.' },
              { title: 'Proven Results', desc: 'Data-driven strategies with measurable ROI for every campaign.' }
            ].map((item, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 text-center">
                <h3 className="font-display text-lg font-bold text-offwhite mb-3">{item.title}</h3>
                <p className="text-offwhite-dark text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book your free consultation and let's discuss which services are right for your business.
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
