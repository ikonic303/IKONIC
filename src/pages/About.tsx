import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Clock, TrendingUp, Headphones, Target, Zap, Shield, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Users, label: 'Leads Captured', value: '10K+' },
  { icon: Clock, label: 'Hours Saved', value: '5K+' },
  { icon: TrendingUp, label: 'Avg. ROI Increase', value: '340%' },
  { icon: Headphones, label: 'Support', value: '24/7' }
];

const values = [
  { icon: Target, title: 'Results-Driven', desc: 'We measure success by your growth, not vanity metrics.' },
  { icon: Zap, title: 'Fast Execution', desc: 'We move quickly to get your systems up and running.' },
  { icon: Shield, title: 'Transparent', desc: 'No hidden fees, no surprises. Just honest work.' },
  { icon: Heart, title: 'Client-First', desc: 'Your success is our success. We treat your business like our own.' }
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
        title="About ikonic303 | Denver Digital Marketing Agency"
        description="Meet the ikonic303 team. Denver-based digital marketing agency specializing in GoHighLevel automation, CRM setup, and lead generation for Colorado businesses."
        canonical="/about"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">ABOUT IKONIC</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            The Digital Agency That<br />
            <span className="text-mint">Works While You Sleep</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            We're a Colorado-based digital marketing agency specializing in automation, 
            CRM systems, and lead generation for local businesses. Our mission is to help 
            businesses grow smarter, not harder.
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
              ikonic was founded with a simple belief: local businesses deserve 
              access to the same powerful marketing tools and automation that big corporations use. 
              We saw too many small businesses struggling to keep up with the digital world, 
              juggling dozens of tools and still falling behind.
            </p>
            <p>
              That's why we built Ikonic—to be the partner that helps businesses scale with 
              smart automation, powerful CRM systems, and done-for-you marketing. We don't just 
              build websites and set up software. We build complete revenue systems that work 
              24/7, so you can focus on what you do best: running your business.
            </p>
            <p>
              Based in Colorado, we understand the unique challenges local businesses face. 
              From Denver to Boulder, Fort Collins to Colorado Springs, we've helped businesses 
              across the Front Range grow their customer base and increase revenue through 
              strategic digital marketing and automation.
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
                Our <span className="text-mint">Mission</span>
              </h2>
              <p className="text-offwhite-dark mb-6">
                We're here to skip the fluff and equip you with tools that actually drive impact. 
                No heavy platforms. No copy-paste setups. Just tailored systems built to capture 
                leads, nurture relationships, and scale your business.
              </p>
              <p className="text-offwhite-dark">
                Whether you're a local service business, a fast-moving startup, or a growing 
                online brand, our team builds everything inside GoHighLevel—clean, organized, 
                and designed to run effortlessly on autopilot.
              </p>
            </div>
            <div className="bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8">
              <h3 className="font-display text-xl font-bold text-offwhite mb-4">
                What Makes Us Different
              </h3>
              <ul className="space-y-3">
                {[
                  'We build AND manage your systems',
                  'No long-term contracts required',
                  'Transparent pricing with no hidden fees',
                  'Dedicated support from our Colorado team',
                  'Proven results with measurable ROI'
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
            These principles guide everything we do.
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
            Results That <span className="text-mint">Speak</span>
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Numbers don't lie. Here's what we've achieved for our clients.
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
            Ready to Work With Us?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Let's build something great together. Book your free consultation today.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get Started
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
