import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, Check, Phone, MessageSquare, Bell, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const features = [
  'Instant SMS follow-up on new leads',
  'Automated email sequences',
  'Missed call text-back system',
  'Action-based reminders and tasks',
  'Smart lead routing and assignment',
  'Real-time notifications to your team'
];

const responseTimes = [
  { time: 'Within 5 minutes', conversion: '391% higher', color: 'text-mint' },
  { time: 'Within 30 minutes', conversion: '191% higher', color: 'text-offwhite' },
  { time: 'After 1 hour', conversion: 'Significant drop', color: 'text-offwhite-dark' }
];

export default function SpeedToLead() {
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
        title="Speed to Lead Automation Denver CO | Ikonic Marketing"
        description="Respond to leads in under 60 seconds with automated SMS and email follow-up. Never lose a lead again. Speed-to-lead automation for Colorado businesses."
        canonical="/services/speed-to-lead"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'Services', href: '/services' }, { name: 'Speed to Lead', href: '/services/speed-to-lead' }]} />
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">SPEED TO LEAD</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Respond to Leads in<br />
            <span className="text-mint">Under 60 Seconds</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            Our speed-to-lead automation ensures you never miss an opportunity. Instant SMS, 
            email, and call follow-ups help Colorado businesses convert 3x more leads by 
            responding faster than competitors.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Get Started
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
          <h2 className="font-display text-2xl font-bold text-offwhite mb-8 text-center">
            Response Time <span className="text-mint">Matters</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {responseTimes.map((item, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center">
                <p className="text-offwhite-dark text-sm mb-2">{item.time}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.conversion}</p>
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
                Never Miss a <span className="text-mint">Lead Again</span>
              </h2>
              <p className="text-offwhite-dark mb-8">
                Our speed-to-lead system automates your entire follow-up process. When a lead 
                comes in, they receive an instant response—no matter what time it is. Your team 
                gets notified immediately so they can take action.
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
              <Zap className="w-16 h-16 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                The 5-Minute Rule
              </h3>
              <p className="text-offwhite-dark mb-6">
                Studies show that responding to leads within 5 minutes increases conversion 
                rates by 391%. After 30 minutes, your odds drop by 21x. Speed is everything.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-charcoal rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-mint" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-mint">&lt; 60s</p>
                  <p className="text-offwhite-dark text-sm">Average response time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            How <span className="text-mint">Speed to Lead</span> Works
          </h2>
          <p className="text-offwhite-dark text-center mb-12 max-w-2xl mx-auto">
            Our automated system responds to leads instantly, 24/7.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: 'Lead Arrives', desc: 'A prospect fills out a form, calls, or sends a message' },
              { icon: Zap, title: 'Instant Response', desc: 'Automated SMS/email sends within seconds' },
              { icon: MessageSquare, title: 'Team Notified', desc: 'Your team gets alerted to follow up' }
            ].map((step, index) => (
              <div key={index} className="bg-charcoal border border-white/10 rounded-xl p-6 text-center relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-mint rounded-full flex items-center justify-center text-charcoal font-bold">
                  {index + 1}
                </div>
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{step.title}</h3>
                <p className="text-offwhite-dark text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Speed to Lead in <span className="text-mint">Colorado</span>
          </h2>
          <div className="space-y-6 text-offwhite-dark">
            <p>
              In today's fast-paced business environment, speed matters more than ever. When a 
              potential customer reaches out, they're actively looking for a solution—and they're 
              likely reaching out to your competitors too. The business that responds first often 
              wins the deal.
            </p>
            <p>
              Our speed-to-lead automation system ensures you never miss an opportunity. Whether 
              it's 2 PM or 2 AM, every lead gets an instant response. This keeps prospects engaged 
              while your team prepares for the follow-up conversation.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              What is Speed to Lead?
            </h3>
            <p>
              Speed to lead is the time it takes for your business to respond to a new inquiry. 
              The faster you respond, the higher your chances of converting that lead into a customer. 
              Our automation systems reduce this time to under 60 seconds.
            </p>
            <h3 className="font-display text-xl font-bold text-offwhite mt-8 mb-4">
              Why It Matters
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Responding in 5 minutes vs 30 minutes increases conversions by 391%</li>
              <li>78% of customers buy from the first company to respond</li>
              <li>After 1 hour, lead qualification drops by 10x</li>
              <li>24/7 automated responses keep prospects engaged</li>
              <li>Your team can focus on closing, not chasing</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Ready to Respond Faster?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Book your free consultation and see how speed-to-lead automation can transform your business.
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
