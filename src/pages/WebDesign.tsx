import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Check, Phone, Zap, TrendingUp, Users } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Custom landing page design optimized for conversions',
  'Mobile-responsive layouts for all devices',
  'Sales funnel architecture and implementation',
  'GoHighLevel (GHL) integration and setup',
  'Website migration from any platform',
  'A/B testing and conversion optimization'
];

const benefits = [
  {
    icon: Zap,
    title: 'Faster Load Times',
    description: 'Optimized code and images ensure your site loads in under 3 seconds, reducing bounce rates.'
  },
  {
    icon: TrendingUp,
    title: 'Higher Conversions',
    description: 'Strategic placement of CTAs and forms increases lead capture by up to 40%.'
  },
  {
    icon: Users,
    title: 'Better User Experience',
    description: 'Intuitive navigation and clean design keeps visitors engaged longer.'
  }
];

export default function WebDesign() {
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
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }, { name: 'Web Design', href: '/services/web-design' }]} />
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">WEB DESIGN & FUNNELS</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Custom Websites &<br />
            <span className="text-mint">High-Converting Funnels</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Professional web design services in Colorado. We build custom landing pages, 
            sales funnels, and complete websites optimized for lead generation and conversions. 
            Our GoHighLevel experts create digital experiences that turn visitors into customers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Free Quote
            </a>
            <a href="/#services" className="btn-outline">
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                What We <span className="text-mint">Deliver</span>
              </h2>
              <p className="text-offwhite-dark mb-8">
                Our web design team specializes in creating conversion-focused websites 
                and sales funnels using GoHighLevel. From custom landing pages to complete 
                website migrations, we handle every aspect of your digital presence.
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
              <Globe className="w-16 h-16 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                Why Choose Our Web Design?
              </h3>
              <p className="text-offwhite-dark mb-6">
                Unlike generic website builders, we create custom solutions tailored to 
                your business goals. Every page is designed with conversion in mind.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">3x</p>
                  <p className="text-offwhite-dark text-sm">Faster Load</p>
                </div>
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">40%</p>
                  <p className="text-offwhite-dark text-sm">More Leads</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Benefits of Professional <span className="text-mint">Web Design</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            A well-designed website is your 24/7 salesperson. Here's how our web design 
            services help Colorado businesses grow.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-3">
                  {benefit.title}
                </h3>
                <p className="text-offwhite-dark text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Web Design Services in <span className="text-mint">Colorado</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              Looking for professional web design services in Colorado? Ikonic Marketing 
              specializes in creating custom websites and high-converting sales funnels for 
              local businesses. Our team of GoHighLevel experts builds digital experiences 
              that drive results.
            </p>
            <p>
              Whether you need a simple landing page, a complete website redesign, or a 
              sophisticated sales funnel, we have the expertise to deliver. Our web design 
              process starts with understanding your business goals and target audience, then 
              creating a custom solution that converts visitors into leads.
            </p>
            <p>
              We specialize in GoHighLevel (GHL) website design, offering seamless integration 
              with CRM, automation, and marketing tools. This means your website isn't just a 
              pretty face—it's a powerful lead generation machine that works 24/7.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              Our Web Design Process
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li><strong className="text-offwhite">Discovery:</strong> We learn about your business, goals, and target audience.</li>
              <li><strong className="text-offwhite">Design:</strong> We create custom wireframes and mockups for your approval.</li>
              <li><strong className="text-offwhite">Development:</strong> We build your site with clean, optimized code.</li>
              <li><strong className="text-offwhite">Testing:</strong> We test across all devices and browsers.</li>
              <li><strong className="text-offwhite">Launch:</strong> We deploy your site and provide training.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready for a Website That Converts?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Get a free consultation and quote for your web design project.
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
