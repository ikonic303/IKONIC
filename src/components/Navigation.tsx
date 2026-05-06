import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsCalcOpen(false);
  }, [location.pathname]);

  const serviceLinks = [
    { label: 'Web Design & Funnels', href: '/services/web-design' },
    { label: 'CRM & Automations', href: '/services/crm-automation' },
    { label: 'Reputation Management', href: '/services/reputation' },
    { label: 'Speed to Lead', href: '/services/speed-to-lead' },
    { label: 'Marketing Systems', href: '/services/marketing' },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isScrolled 
            ? 'bg-charcoal/95 backdrop-blur-md py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="px-[6vw] flex items-center justify-between">
          {/* Logo - Home button with green hover */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <img 
              src="/logo-ikonic.webp"
              alt="Ikonic" 
              style={{ height: '64px', width: 'auto' }}
              className="transition-all duration-300 group-hover:brightness-0 group-hover:invert-[.8] group-hover:sepia group-hover:saturate-[500%] group-hover:hue-rotate-[100deg]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              Home
            </Link>
            
            <Link to="/about" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              About
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                onMouseEnter={() => setIsServicesOpen(true)}
                className="flex items-center gap-1 text-sm font-medium text-offwhite-dark hover:text-mint transition-colors"
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isServicesOpen && (
                <div 
                  onMouseLeave={() => setIsServicesOpen(false)}
                  className="absolute top-full left-0 mt-2 w-56 bg-charcoal border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  <Link
                    to="/services"
                    className="block px-4 py-3 text-sm font-semibold text-mint hover:bg-mint/10 transition-colors border-b border-white/10"
                  >
                    View All Services →
                  </Link>
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Calculators Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCalcOpen(!isCalcOpen)}
                onMouseEnter={() => setIsCalcOpen(true)}
                className="flex items-center gap-1 text-sm font-medium text-offwhite-dark hover:text-mint transition-colors"
              >
                Calculators
                <ChevronDown className={`w-4 h-4 transition-transform ${isCalcOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCalcOpen && (
                <div
                  onMouseLeave={() => setIsCalcOpen(false)}
                  className="absolute top-full left-0 mt-2 w-52 bg-charcoal border border-white/10 rounded-lg shadow-xl overflow-hidden"
                >
                  <Link
                    to="/wrap-calculator"
                    className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors"
                  >
                    Wrap Calculator
                  </Link>
                  <Link
                    to="/print-ship"
                    className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors border-t border-white/10"
                  >
                    Print &amp; Ship
                  </Link>
                  <Link
                    to="/lost-call-calculator"
                    className="block px-4 py-3 text-sm text-offwhite-dark hover:bg-mint/10 hover:text-mint transition-colors border-t border-white/10"
                  >
                    Lost Call Calculator
                  </Link>
                </div>
              )}
            </div>

            <Link to="/commercial-wraps" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              AI Commercial Wrap
            </Link>

            <Link to="/blogs" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              Blogs
            </Link>

            <Link to="/careers" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              Career
            </Link>

            <Link to="/sticker-builder" className="text-sm font-medium text-offwhite-dark hover:text-mint transition-colors">
              Sticker Builder
            </Link>

            <Link to="/branded-to-win" className="text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: '#F5A623', color: '#F5A623' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F5A62320'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              Book
            </Link>

            <Link to="/contact" className="btn-primary text-sm">
              Start Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-offwhite"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-charcoal z-[99] transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6 overflow-y-auto py-20">
          <Link to="/" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            About
          </Link>

          <div className="text-center">
            <p className="text-mint text-sm mb-3">Services</p>
            <Link 
              to="/services"
              className="block text-xl font-display font-bold text-mint hover:text-mint-light transition-colors py-2"
            >
              View All Services →
            </Link>
            {serviceLinks.map((link) => (
              <Link 
                key={link.label}
                to={link.href}
                className="block text-xl font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-mint text-sm mb-3">Calculators</p>
            <Link to="/wrap-calculator" className="block text-xl font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-2">
              Wrap Calculator
            </Link>
            <Link to="/print-ship" className="block text-xl font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-2">
              Print &amp; Ship
            </Link>
            <Link to="/lost-call-calculator" className="block text-xl font-display font-bold text-offwhite-dark hover:text-mint transition-colors py-2">
              Lost Call Calculator
            </Link>
          </div>

          <Link to="/commercial-wraps" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            AI Commercial Wrap
          </Link>

          <Link to="/blogs" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            Blogs
          </Link>
          <Link to="/careers" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            Career
          </Link>
          <Link to="/sticker-builder" className="text-2xl font-display font-bold text-offwhite hover:text-mint transition-colors">
            Sticker Builder
          </Link>
          <Link to="/branded-to-win" className="text-2xl font-display font-bold transition-colors" style={{ color: '#F5A623' }}>
            Book
          </Link>
          <Link to="/contact" className="btn-primary mt-4">
            Start Now
          </Link>
        </div>
      </div>
    </>
  );
}
