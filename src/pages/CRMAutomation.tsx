import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Settings, Check, Phone, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Complete GoHighLevel CRM setup and configuration',
  'Automated lead nurturing workflows',
  'Pipeline management and tracking',
  'AI-powered chatbot and voice agent integration',
  'Email and SMS automation sequences',
  'Task automation and reminders'
];

const workflows = [
  {
    title: 'Lead Capture Automation',
    description: 'Automatically capture leads from forms, calls, and ads into your CRM with instant follow-up.'
  },
  {
    title: 'Nurture Sequences',
    description: 'Send targeted emails and SMS messages based on lead behavior and engagement.'
  },
  {
    title: 'Sales Pipeline Automation',
    description: 'Move leads through your pipeline automatically based on actions and responses.'
  },
  {
    title: 'Appointment Booking',
    description: 'Let prospects book directly on your calendar with automated confirmations and reminders.'
  }
];

export default function CRMAutomation() {
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
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }, { name: 'CRM Automation', href: '/services/crm-automation' }]} />
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">CRM & AUTOMATIONS</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            GoHighLevel CRM &<br />
            <span className="text-mint">Business Automation</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Transform your business with GoHighLevel CRM automation. We build custom workflows 
            that capture leads, nurture prospects, and close deals on autopilot. Save time and 
            scale your Colorado business with intelligent automation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Free Audit
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
                Complete <span className="text-mint">CRM Setup</span>
              </h2>
              <p className="text-offwhite-dark mb-8">
                Our GoHighLevel experts configure your entire CRM system from scratch. 
                We set up pipelines, automation workflows, and integrations so your 
                business runs smoothly 24/7.
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
              <Settings className="w-16 h-16 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                Why GoHighLevel?
              </h3>
              <p className="text-offwhite-dark mb-6">
                GoHighLevel is the all-in-one platform for agencies and local businesses. 
                It combines CRM, marketing automation, and sales tools in one powerful system.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">10+</p>
                  <p className="text-offwhite-dark text-sm">Hours/Week Saved</p>
                </div>
                <div className="text-center p-4 bg-charcoal rounded-lg">
                  <p className="text-3xl font-bold text-mint">3x</p>
                  <p className="text-offwhite-dark text-sm">Faster Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflows Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Automation <span className="text-mint">Workflows</span> We Build
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            These are just a few examples of the powerful automations we can create 
            for your business.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, index) => (
              <div key={index} className="bg-charcoal-light border border-white/10 rounded-xl p-6 hover:border-mint/30 transition-colors">
                <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">
                  {workflow.title}
                </h3>
                <p className="text-offwhite-dark text-sm">{workflow.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            CRM Automation Services in <span className="text-mint">Colorado</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              Are you tired of manually tracking leads and following up with prospects? 
              Our CRM automation services help Colorado businesses streamline their sales 
              process and close more deals with less effort.
            </p>
            <p>
              We specialize in GoHighLevel (GHL) CRM setup and automation. GoHighLevel is 
              the leading platform for agencies and local businesses, offering powerful tools 
              for lead management, marketing automation, and customer relationship management.
            </p>
            <p>
              Our automation experts will analyze your current sales process and design 
              custom workflows that match your business needs. From lead capture to deal 
              closure, every step can be automated to save you time and increase efficiency.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              What is CRM Automation?
            </h3>
            <p>
              CRM automation uses technology to automate repetitive tasks in your customer 
              relationship management process. This includes lead scoring, follow-up emails, 
              task reminders, and pipeline management. With proper automation, your team can 
              focus on high-value activities while the system handles routine tasks.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              Benefits of CRM Automation
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Save 10+ hours per week on manual tasks</li>
              <li>Respond to leads 3x faster than competitors</li>
              <li>Never miss a follow-up with automated reminders</li>
              <li>Track every interaction with detailed analytics</li>
              <li>Scale your business without adding headcount</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Automate Your Business?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book your free 15-minute CRM audit and discover how automation can transform your business.
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
