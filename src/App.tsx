import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageSEO from './components/PageSEO';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MatrixBackground from './components/MatrixBackground';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import './App.css';

// Below-fold home sections — lazy loaded
const ServicesSection = lazy(() => import('./sections/ServicesSection'));
const AboutSection = lazy(() => import('./sections/AboutSection'));
const TestimonialsSection = lazy(() => import('./sections/TestimonialsSection'));
const ContactSection = lazy(() => import('./sections/ContactSection'));

// All route pages — lazy loaded
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AllServices = lazy(() => import('./pages/AllServices'));
const LearnMore = lazy(() => import('./pages/LearnMore'));
const CommercialWraps = lazy(() => import('./pages/CommercialWraps'));
const Careers = lazy(() => import('./pages/Careers'));
const Blogs = lazy(() => import('./pages/Blogs'));
const WebDesign = lazy(() => import('./pages/WebDesign'));
const CRMAutomation = lazy(() => import('./pages/CRMAutomation'));
const ReputationManagement = lazy(() => import('./pages/ReputationManagement'));
const SpeedToLead = lazy(() => import('./pages/SpeedToLead'));
const MarketingSystems = lazy(() => import('./pages/MarketingSystems'));
const WrapCalculator = lazy(() => import('./pages/WrapCalculator'));
const PrintAndShip = lazy(() => import('./pages/PrintAndShip'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const LostCallCalculator = lazy(() => import('./pages/LostCallCalculator'));
const ProofManager = lazy(() => import('./pages/ProofManager'));
const ProofClient = lazy(() => import('./pages/ProofClient'));
const BrandedToWin = lazy(() => import('./pages/BrandedToWin'));
const StickerBuilder = lazy(() => import('./pages/StickerBuilder'));
const ViralBot = lazy(() => import('./pages/ViralBot'));
const ViralBotAuth = lazy(() => import('./pages/ViralBotAuth'));
const ViralBotApp = lazy(() => import('./pages/ViralBotApp'));

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  return (
    <>
      <PageSEO
        title="Digital Marketing Agency Denver CO | Ikonic Marketing"
        description="Denver's #1 GoHighLevel agency. We build 24/7 lead capture systems — custom websites, CRM automation, sales funnels, and reputation management. Get more leads on autopilot."
        canonical="/"
      />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <Suspense fallback={null}>
          <ServicesSection />
          <AboutSection />
          <TestimonialsSection />
          <ContactSection />
        </Suspense>
      </main>
    </>
  );
}

function App() {
  useEffect(() => {
    ScrollTrigger.refresh();
    return () => { ScrollTrigger.getAll().forEach(st => st.kill()); };
  }, []);

  useEffect(() => {
    const scriptId = 'ghl-chat-widget-script';
    if (document.getElementById(scriptId)) return;
    const load = () => {
      if (document.getElementById(scriptId)) return;
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://widgets.leadconnectorhq.com/loader.js';
      script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
      script.setAttribute('data-widget-id', '69965105f3036706b875cf61');
      script.async = true;
      document.body.appendChild(script);
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(load, { timeout: 3000 });
    } else {
      const t = setTimeout(load, 3000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <Router>
      <div className="relative bg-charcoal min-h-screen">
        <MatrixBackground />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<AllServices />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/commercial-wraps" element={<CommercialWraps />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/services/web-design" element={<WebDesign />} />
            <Route path="/services/crm-automation" element={<CRMAutomation />} />
            <Route path="/services/reputation" element={<ReputationManagement />} />
            <Route path="/services/speed-to-lead" element={<SpeedToLead />} />
            <Route path="/services/marketing" element={<MarketingSystems />} />
            <Route path="/wrap-calculator" element={<WrapCalculator />} />
            <Route path="/print-ship" element={<PrintAndShip />} />
            <Route path="/lost-call-calculator" element={<LostCallCalculator />} />
            <Route path="/post/:slug" element={<BlogPost />} />
            <Route path="/proof-manager" element={<ProofManager />} />
            <Route path="/proof/:token" element={<ProofClient />} />
            <Route path="/branded-to-win" element={<BrandedToWin />} />
            <Route path="/sticker-builder" element={<StickerBuilder />} />
            <Route path="/viral-bot" element={<ViralBot />} />
            <Route path="/viral-bot/auth" element={<ViralBotAuth />} />
            <Route path="/viral-bot/app" element={<ViralBotApp />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
