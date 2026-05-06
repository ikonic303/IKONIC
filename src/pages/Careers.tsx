import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  MapPin, 
  Check
} from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const whatYoullSell = [
  'Professional Business Websites',
  'CRM & Automation Systems',
  'SEO & Google Ranking Services',
  'Lead Follow-Up Automation',
  'AI Voice & Chat Systems',
  'Done-for-you campaign templates'
];

const whoWereLookingFor = [
  'Self-motivated individuals who can manage their own pipeline',
  'Strong communication skills (phone, Zoom, and in-person)',
  'Comfortable with cold outreach and follow-up',
  'Coachable, competitive, and driven to improve',
  'Sales experience preferred but not required'
];

const whyJoin = [
  {
    icon: Clock,
    title: 'Flexible & Remote',
    description: 'Flexible schedule built around your life. Remote-friendly opportunity. Meet local businesses in person when it makes sense.'
  },
  {
    icon: TrendingUp,
    title: 'Proven Sales Engine',
    description: 'Proven sales system already built. Marketing materials and decks provided. Scripts, follow-up sequences, and automation ready to use.'
  },
  {
    icon: DollarSign,
    title: 'High-Demand Offers',
    description: 'High-demand services local businesses already look for. Easy-to-understand offers with clear ROI. Support from a team that knows digital marketing.'
  }
];

export default function Careers() {
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

  const scrollToApply = () => {
    const applySection = document.getElementById('apply');
    if (applySection) {
      applySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Careers at Ikonic Marketing | Join Our Denver Marketing Team"
        description="Join the Ikonic Marketing team in Denver, CO. We're hiring driven marketers, GoHighLevel specialists, and automation experts. Build your career in digital marketing."
        canonical="/careers"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">CAREERS AT IKONIC MARKETING</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Join <span className="text-mint">Ikonic Marketing</span><br />
            Build a High Income Sales Career
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            We're expanding our Colorado sales team and looking for driven, self-motivated 
            closers ready to earn based on performance.
          </p>
          <div className="flex items-center justify-center gap-2 text-offwhite-dark mb-10">
            <MapPin className="w-4 h-4 text-mint" />
            <span>Located in Colorado • Serving local businesses across the Front Range</span>
          </div>
          <button 
            onClick={scrollToApply}
            className="btn-primary inline-flex items-center gap-2"
          >
            Apply Now
          </button>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-micro text-mint mb-4 text-center">WHO WE ARE</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-6 text-center">
            A Local Team Focused on <span className="text-mint">Real Results</span>
          </h2>
          <p className="text-offwhite-dark text-center max-w-2xl mx-auto mb-6">
            Ikonic Marketing helps local businesses in Colorado grow using websites, CRM 
            automation, SEO, and lead follow-up systems.
          </p>
          <p className="text-offwhite-dark text-center max-w-2xl mx-auto">
            We don't just build websites — we build revenue systems. When you close a deal, 
            you're helping a real business owner turn clicks into customers.
          </p>
        </div>
      </section>

      {/* What You'll Sell Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                What You'll Be Selling
              </h2>
              <p className="text-offwhite-dark mb-8">
                You'll be offering solutions that businesses actually need — not gimmicks. 
                Every offer is built to help Colorado businesses get more leads, calls, and customers.
              </p>
              <h3 className="font-display text-xl font-bold text-mint mb-4">
                Core Digital Services
              </h3>
              <ul className="space-y-3">
                {whatYoullSell.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-offwhite-dark">
                    <Check className="w-5 h-5 text-mint flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8">
              <DollarSign className="w-12 h-12 text-mint mb-6" />
              <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                Compensation
              </h3>
              <p className="text-mint font-medium mb-4">
                Earn Based on Performance, Without a Ceiling
              </p>
              <p className="text-offwhite-dark text-sm mb-6">
                This is a commission-based opportunity designed for closers who want to 
                control their income and get rewarded for results.
              </p>
              <ul className="space-y-2 text-sm text-offwhite-dark">
                <li>• Commission-based role with high payouts per closed deal</li>
                <li>• Unlimited earning potential — no cap on commissions</li>
                <li>• Performance bonuses and incentives</li>
                <li>• Typical structure: 15%–25% commission per deal</li>
                <li>• Opportunities for recurring commission on select services</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Who We're Looking For Section */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6 text-center">
            Who We're Looking For
          </h2>
          <p className="text-offwhite-dark text-center mb-10">
            Sales Athletes Who Want to Grow. You don't need decades of experience — 
            you need drive, coachability, and a willingness to put in the work.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whoWereLookingFor.map((item, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 bg-charcoal border border-white/10 rounded-lg"
              >
                <Users className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                <p className="text-offwhite text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4 text-center">
            Why Join Ikonic?
          </h2>
          <p className="text-offwhite-dark text-center mb-12">
            Plug Into a Proven System — Then Scale Your Income
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyJoin.map((item, index) => (
              <div 
                key={index}
                className="bg-charcoal-light border border-white/10 rounded-xl p-6"
              >
                <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-3">
                  {item.title}
                </h3>
                <p className="text-offwhite-dark text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-offwhite mb-4">
              Ready to Take Control of Your Income?
            </h2>
            <p className="text-offwhite-dark">
              Apply now and let's build something big for Colorado businesses — and for your career.
            </p>
          </div>
          
          <div className="bg-charcoal border border-white/10 rounded-2xl p-3 md:p-4">
            <iframe
              src="https://crm.ikonic303.com/widget/form/dd8OOBPO2eKjd0XxtMZu"
              style={{width:'100%', height:'1994px', border:'none', borderRadius:'3px'}}
              id="inline-dd8OOBPO2eKjd0XxtMZu"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Apply to Join Ikonic Sales Team"
              data-height="1994"
              data-layout-iframe-id="inline-dd8OOBPO2eKjd0XxtMZu"
              data-form-id="dd8OOBPO2eKjd0XxtMZu"
              title="Apply to Join Ikonic Sales Team"
            />
            <script src="https://crm.ikonic303.com/js/form_embed.js"></script>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
