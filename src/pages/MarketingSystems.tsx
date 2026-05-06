import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Check, Phone, BarChart3, Target, Megaphone } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Complete marketing campaign management',
  'Social media strategy and scheduling',
  'Paid advertising (Google Ads, Facebook)',
  'Email marketing automation',
  'Analytics dashboard and reporting',
  'A/B testing and optimization'
];

const channels = [
  { title: 'Social Media', desc: 'Strategic posting across Facebook, Instagram, LinkedIn, and TikTok' },
  { title: 'Paid Ads', desc: 'Targeted campaigns on Google, Facebook, and Instagram' },
  { title: 'Email Marketing', desc: 'Automated sequences that nurture and convert' },
  { title: 'Content Strategy', desc: 'Blog posts, videos, and content that drives traffic' }
];

export default function MarketingSystems() {
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
        title="Digital Marketing Systems & Automation Denver CO | Ikonic Marketing"
        description="Full-service digital marketing for Colorado businesses — social media, paid ads (Google & Facebook), email automation, and analytics dashboards. Fill your pipeline on autopilot."
        canonical="/services/marketing"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }, { name: 'Marketing Systems', href: '/services/marketing' }]} />
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">MARKETING SYSTEMS</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Complete Marketing<br />
            <span className="text-mint">Automation Systems</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Full-service digital marketing for Colorado businesses. We manage your social media, 
            paid ads, email campaigns, and analytics—so you can focus on running your business 
            while we fill your pipeline with qualified leads.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Free Strategy
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
                Everything Under <span className="text-mint">One Roof</span>
              </h2>
              <p className="text-offwhite-dark mb-8">
                Stop juggling multiple agencies and tools. Our integrated marketing system 
                handles everything from social media to paid ads, all working together to 
                maximize your ROI.
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
              <TrendingUp className="w-16 h-16 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                Data-Driven Results
              </h3>
              <p className="text-offwhite-dark mb-6">
                Every campaign is tracked, measured, and optimized. You'll always know 
                exactly what's working and what your ROI looks like.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">3.5x</p>
                  <p className="text-offwhite-dark text-sm">Average ROI</p>
                </div>
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">40%</p>
                  <p className="text-offwhite-dark text-sm">Lower CAC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Channels Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Marketing <span className="text-mint">Channels</span> We Manage
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Multi-channel marketing that reaches your audience wherever they are.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {channels.map((channel, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 flex items-start gap-4">
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {index === 0 && <Megaphone className="w-6 h-6 text-mint" />}
                  {index === 1 && <Target className="w-6 h-6 text-mint" />}
                  {index === 2 && <BarChart3 className="w-6 h-6 text-mint" />}
                  {index === 3 && <TrendingUp className="w-6 h-6 text-mint" />}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-offwhite mb-2">{channel.title}</h3>
                  <p className="text-offwhite-dark text-sm">{channel.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <BarChart3 className="w-16 h-16 text-mint mb-6" />
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                Real-Time <span className="text-mint">Analytics</span>
              </h2>
              <p className="text-offwhite-dark mb-6">
                Know exactly how your marketing is performing with our comprehensive analytics 
                dashboard. Track leads, conversions, ROI, and more—all in real time.
              </p>
              <ul className="space-y-3">
                {[
                  'Lead source tracking',
                  'Conversion rate analysis',
                  'Cost per acquisition metrics',
                  'Campaign performance reports',
                  'Monthly strategy reviews'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-offwhite">
                    <div className="w-1.5 h-1.5 bg-mint rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-charcoal border border-white/10 rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-offwhite text-sm">Lead Conversion</span>
                    <span className="text-mint font-bold">24.5%</span>
                  </div>
                  <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                    <div className="h-full w-[24.5%] bg-mint rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-offwhite text-sm">Email Open Rate</span>
                    <span className="text-mint font-bold">42.3%</span>
                  </div>
                  <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                    <div className="h-full w-[42.3%] bg-mint rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-offwhite text-sm">Ad Click-Through</span>
                    <span className="text-mint font-bold">8.7%</span>
                  </div>
                  <div className="h-2 bg-charcoal-light rounded-full overflow-hidden">
                    <div className="h-full w-[8.7%] bg-mint rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Digital Marketing in <span className="text-mint">Colorado</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              Digital marketing is essential for any business looking to grow in today's 
              competitive landscape. Our comprehensive marketing systems help Colorado businesses 
              reach more customers, generate more leads, and increase revenue through strategic 
              online campaigns.
            </p>
            <p>
              We take a data-driven approach to marketing, using analytics to inform every 
              decision. From social media management to paid advertising, every channel is 
              optimized for maximum ROI. Our integrated systems ensure all your marketing 
              efforts work together seamlessly.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              What is a Marketing System?
            </h3>
            <p>
              A marketing system is an integrated set of tools, processes, and strategies 
              that work together to attract, engage, and convert customers. Unlike one-off 
              campaigns, a marketing system runs continuously, constantly optimizing for better 
              results.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              Benefits of Integrated Marketing
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Consistent messaging across all channels</li>
              <li>Better attribution and ROI tracking</li>
              <li>Reduced cost per acquisition</li>
              <li>Scalable growth without adding headcount</li>
              <li>Data-driven decision making</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Scale Your Marketing?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book your free marketing strategy session and discover how we can grow your business.
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
