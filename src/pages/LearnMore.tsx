import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Check, Target, TrendingUp, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const howItWorks = [
  {
    step: '1',
    title: 'Free Consultation',
    description: 'We discuss your business goals, current challenges, and what success looks like for you.'
  },
  {
    step: '2',
    title: 'Custom Strategy',
    description: 'We design a tailored system that fits your business needs and budget.'
  },
  {
    step: '3',
    title: 'Build & Launch',
    description: 'Our team builds your complete system and trains you on how to use it.'
  },
  {
    step: '4',
    title: 'Ongoing Support',
    description: 'We monitor, optimize, and support your system as your business grows.'
  }
];

const benefits = [
  { icon: Clock, title: 'Save Time', desc: 'Automate repetitive tasks and free up 10+ hours per week.' },
  { icon: TrendingUp, title: 'Increase Revenue', desc: 'Convert more leads with faster response times and better follow-up.' },
  { icon: Target, title: 'Better Leads', desc: 'Attract higher-quality prospects who are ready to buy.' },
  { icon: Shield, title: 'Peace of Mind', desc: 'Your system runs 24/7, even when you are not working.' }
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
        title="How It Works | Marketing Automation for Denver Businesses | Ikonic"
        description="Learn how Ikonic Marketing builds automated lead generation systems for Denver businesses. Our proven 4-step process captures leads 24/7 while you focus on your business."
        canonical="/learn-more"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">ABOUT OUR APPROACH</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Marketing That<br />
            <span className="text-mint">Works While You Sleep</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Imagine a business where leads are captured automatically, follow-ups happen 
            instantly, and your pipeline stays full—without you lifting a finger. That's 
            what we build at Ikonic.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Free Consultation
            </a>
            <Link to="/services" className="btn-outline">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            The Problem With <span className="text-mint">Traditional Marketing</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Leads slip through the cracks due to slow follow-up',
              'Juggling multiple tools that do not talk to each other',
              'Spending hours on repetitive manual tasks',
              'No clear picture of what marketing is actually working',
              'Paying agencies that deliver reports but not results'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-charcoal rounded-lg">
                <div className="w-6 h-6 bg-red-500/20 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-sm">✕</span>
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
            The <span className="text-mint">Ikonic</span> Solution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Instant automated follow-up that never misses a lead',
              'One integrated platform that handles everything',
              'Systems that run on autopilot 24/7',
              'Real-time analytics showing exactly what works',
              'Done-for-you service with measurable ROI'
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
            Getting started is simple. We handle everything from strategy to execution.
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
            Benefits of Working With <span className="text-mint">Us</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Here's what you can expect when you partner with Ikonic.
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
            Who We <span className="text-mint">Help</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            We specialize in helping local service businesses across Colorado.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'Fitness Studios',
              'Dental Practices',
              'Contractors',
              'Law Firms',
              'Real Estate Agents',
              'Auto Shops',
              'Cleaning Companies',
              'Restaurants'
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
            Ready to Transform Your Business?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book your free 15-minute consultation. No commitment, just a clear plan to scale your business.
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
