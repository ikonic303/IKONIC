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

const whatYoullDo = [
  'Install residential window film — solar, UV, privacy, decorative, and security',
  'Run in-home estimates and glass compatibility checks before installs',
  'Prep and finish glass — clean edges, no bubbles, no rushed jobs',
  'Protect the customer’s floors and furniture and leave a tidy work area',
  'Some commercial storefront tint and window-graphics work',
  'Help keep the Wheat Ridge shop and install vehicles stocked and organized'
];

const whoWereLookingFor = [
  'Careful hands and pride in a clean finished edge',
  'Comfortable on ladders and working in customers’ homes',
  'Reliable, on time, and courteous with homeowners on-site',
  'Coachable — we train the window-film technique',
  'Window-film or vinyl experience a plus, not required',
  'Valid driver’s license'
];

const whyJoin = [
  {
    icon: Clock,
    title: 'Real Craft',
    description: 'Learn residential window film from people who care about the finish. Every job is something you can point at.'
  },
  {
    icon: TrendingUp,
    title: 'Steady Work',
    description: 'A full pipeline of home tinting jobs across the Denver metro, year-round, plus some commercial storefront work.'
  },
  {
    icon: DollarSign,
    title: 'Grow Your Rate',
    description: 'Pay that moves up with skill. Take on in-home estimating or lead-installer as you master the work.'
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
        title="Careers at ikonic303 | Window Tint Installers — Denver, CO"
        description="Join the ikonic303 crew in Wheat Ridge, CO. We're hiring residential window film / tint installers. Craft-focused, steady year-round work across the Denver metro. Training provided."
        canonical="/careers"
      />
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">CAREERS AT IKONIC</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Join <span className="text-mint">ikonic</span><br />
            Install Residential Window Film
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-8">
            We're growing our Wheat Ridge crew — residential window film / tint installers who take
            pride in a clean finish and treat a customer's home like their own.
          </p>
          <div className="flex items-center justify-center gap-2 text-offwhite-dark mb-10">
            <MapPin className="w-4 h-4 text-mint" />
            <span>Wheat Ridge, CO • Installs across the Denver metro</span>
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
            A Local Crew Focused on <span className="text-mint">the Finish</span>
          </h2>
          <p className="text-offwhite-dark text-center max-w-2xl mx-auto mb-6">
            ikonic is Denver&rsquo;s residential window tinting specialist — home window film for
            heat, glare, UV, privacy, and energy savings, with some commercial storefront work.
          </p>
          <p className="text-offwhite-dark text-center max-w-2xl mx-auto">
            When you finish a job, it&rsquo;s your work on that glass — and we build the crew
            around that standard.
          </p>
        </div>
      </section>

      {/* What You'll Sell Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
                What You'll Be Doing
              </h2>
              <p className="text-offwhite-dark mb-8">
                Hands-on install and production work — real craft, not a desk. We'll train the
                film and vinyl technique; you bring care and consistency.
              </p>
              <h3 className="font-display text-xl font-bold text-mint mb-4">
                The Work
              </h3>
              <ul className="space-y-3">
                {whatYoullDo.map((item, index) => (
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
                Pay &amp; Schedule
              </h3>
              <p className="text-mint font-medium mb-4">
                Hourly, With Room to Move Up
              </p>
              <p className="text-offwhite-dark text-sm mb-6">
                Full-time, based out of the Wheat Ridge shop, with home installs across the Denver
                metro. Mostly regular daytime hours.
              </p>
              <ul className="space-y-2 text-sm text-offwhite-dark">
                <li>• Competitive hourly rate, based on experience</li>
                <li>• Raises tied to skill with window film and vinyl</li>
                <li>• Paths to in-home estimator or lead installer</li>
                <li>• Paid training on materials and technique</li>
                <li>• Company vehicle and tools for install crews</li>
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
            You don't need years in the trade — you need steady hands, reliability, and pride
            in work you can point at.
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
            Learn a real trade with a shop that cares about the finish
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
              Ready to Join the Crew?
            </h2>
            <p className="text-offwhite-dark">
              Send us your info and a bit about any hands-on work you've done. We'll be in touch.
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
              data-form-name="Apply to Join the Ikonic Crew"
              data-height="1994"
              data-layout-iframe-id="inline-dd8OOBPO2eKjd0XxtMZu"
              data-form-id="dd8OOBPO2eKjd0XxtMZu"
              title="Apply to Join the Ikonic Crew"
            />
            <script src="https://crm.ikonic303.com/js/form_embed.js"></script>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
