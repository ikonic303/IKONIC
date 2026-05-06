import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageSEO from './components/PageSEO';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MatrixBackground from './components/MatrixBackground';
import Navigation from './components/Navigation';
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import AboutSection from './sections/AboutSection';
import TestimonialsSection from './sections/TestimonialsSection';
import ContactSection from './sections/ContactSection';
import About from './pages/About';
import Contact from './pages/Contact';
import AllServices from './pages/AllServices';
import LearnMore from './pages/LearnMore';
import CommercialWraps from './pages/CommercialWraps';
import Careers from './pages/Careers';
import Blogs from './pages/Blogs';
import WebDesign from './pages/WebDesign';
import CRMAutomation from './pages/CRMAutomation';
import ReputationManagement from './pages/ReputationManagement';
import SpeedToLead from './pages/SpeedToLead';
import MarketingSystems from './pages/MarketingSystems';
import WrapCalculator from './pages/WrapCalculator';
import PrintAndShip from './pages/PrintAndShip';
import BlogPost from './pages/BlogPost';
import LostCallCalculator from './pages/LostCallCalculator';
import ProofManager from './pages/ProofManager';
import ProofClient from './pages/ProofClient';
import BrandedToWin from './pages/BrandedToWin';
import StickerBuilder from './pages/StickerBuilder';
import ViralBot from './pages/ViralBot';
import ViralBotAuth from './pages/ViralBotAuth';
import ViralBotApp from './pages/ViralBotApp';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// Home page component
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
        <ServicesSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
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
      </div>
    </Router>
  );
}

export default App;
