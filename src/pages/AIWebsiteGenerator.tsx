import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Wand2, Layout, Palette, LayoutTemplate, ArrowRight, Check, Loader2,
  MessageSquare, Cpu, Eye, Rocket, Type, MousePointerClick, Users, PhoneCall,
  Building2, Star, AlertCircle, ShieldCheck, FileSignature, CalendarClock, Lock,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import Breadcrumb from '../components/Breadcrumb';
import PageSEO from '../components/PageSEO';

// ── Types matching the /api/generate-website JSON contract ────────────────────
interface WebsiteConcept {
  conceptTitle: string;
  layout: string;
  pageStructure: string[];
  sections: string[];
  hero: { headline: string; subheadline: string };
  ctaButtons: string[];
  serviceIdeas: { title: string; description: string }[];
  aboutDirection: string;
  contactDirection: string;
  designStyle: string;
  colorDirection: { description: string; palette: { name: string; hex: string }[] };
  conversionTips: string[];
}

interface FormState {
  businessName: string;
  businessType: string;
  services: string;
  targetCustomers: string;
  websiteGoal: string;
  existingUrl: string;
  pagesNeeded: string;
  preferredStyle: string;
  preferredColors: string;
  hasBranding: string;
  inspiration: string;
  uniqueSellingPoint: string;
  needsSystems: string;
  budgetInterest: string; // tier id: 'website-build' | 'growth-system' | 'not-sure'
  name: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: FormState = {
  businessName: '', businessType: '', services: '', targetCustomers: '', websiteGoal: '',
  existingUrl: '', pagesNeeded: '', preferredStyle: '', preferredColors: '', hasBranding: '',
  inspiration: '', uniqueSellingPoint: '', needsSystems: '', budgetInterest: '',
  name: '', email: '', phone: '',
};

const STYLE_OPTIONS = ['Modern & Minimal', 'Bold & High-Energy', 'Luxury & Premium', 'Clean & Corporate', 'Playful & Friendly', 'Dark & Techy'];

// Tiers are described WITHOUT prices before checkout (dollar amounts only appear
// at the deposit/checkout step). Ids must match the server QUALIFIED_TIERS set.
const BUDGET_TIERS: { id: string; label: string; desc: string; unqualified?: boolean }[] = [
  { id: 'website-build', label: 'Website Design & Build', desc: 'A custom, mobile-friendly website built to convert.' },
  { id: 'growth-system', label: 'Full Business Growth System', desc: 'Website plus CRM, AI agent, automation, and marketing support.' },
  { id: 'not-sure', label: 'Not sure yet / just exploring', desc: "We'll help you find the right fit on a quick call.", unqualified: true },
];

// TODO: swap for the real GHL booking calendar link when available.
const BOOKING_URL = '/contact';

// Cloudflare Turnstile public site key (safe to expose). Widget renders only when set.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

// Persist the intake answers across the Stripe redirect round-trip.
const STORAGE_KEY = 'ikonic_ai_website_intake';

const HUMAN_STEP_COPY = 'Our AI drafts your concept — then our team hand-perfects the design and UX before build.';
const DEPOSIT_COPY = 'A $250 deposit starts your project — it goes straight toward your website build. It’s the first dollar of your project, not a fee.';

const STEPS = [
  { icon: MessageSquare, title: 'Tell us about your business', desc: 'Answer a few guided questions about your goals, services, and style.' },
  { icon: CalendarClock, title: 'Start your project', desc: 'Qualified projects begin with a small deposit that goes toward your build.' },
  { icon: Cpu, title: 'AI drafts your concept', desc: 'Our AI builds a custom website design concept tailored to your business.' },
  { icon: Rocket, title: 'We hand-perfect & build', desc: 'Our team refines the design and UX, then builds the real site for you.' },
];

type Step = 'intake' | 'deposit' | 'bookcall' | 'agreement' | 'result';

// ── Cloudflare Turnstile widget (no external npm dependency) ───────────────────
function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let widgetId: string | undefined;
    const SCRIPT_ID = 'cf-turnstile-script';

    const render = () => {
      const ts = (window as any).turnstile;
      if (!ts || !ref.current) return;
      widgetId = ts.render(ref.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => onToken(token),
        'error-callback': () => onToken(''),
        'expired-callback': () => onToken(''),
      });
    };

    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement('script');
      s.id = SCRIPT_ID;
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      render();
    }

    return () => {
      const ts = (window as any).turnstile;
      if (ts && widgetId) try { ts.remove(widgetId); } catch { /* noop */ }
    };
  }, [onToken]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="flex justify-center" />;
}

// ── Field primitive ───────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-offwhite mb-1.5">
        {label}{required && <span className="text-mint"> *</span>}
        {hint && <span className="text-offwhite-dark font-normal"> — {hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-offwhite placeholder:text-offwhite-dark/60 ' +
  'focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-colors';

export default function AIWebsiteGenerator() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [step, setStep] = useState<Step>('intake');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [concept, setConcept] = useState<WebsiteConcept | null>(null);
  const [depositSessionId, setDepositSessionId] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // must stay empty for humans

  const formRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToFlow = () => setTimeout(() => flowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);

  // On return from Stripe, restore the intake answers and move to the agreement step.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const deposit = params.get('deposit');
    const sessionId = params.get('session_id');
    if (deposit === 'success' && sessionId) {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.form) setForm(parsed.form);
          if (typeof parsed.smsConsent === 'boolean') setSmsConsent(parsed.smsConsent);
        }
      } catch { /* ignore */ }
      setDepositSessionId(sessionId);
      setStep('agreement');
      window.history.replaceState({}, '', '/ai-website-generator');
      scrollToFlow();
    } else if (deposit === 'cancelled') {
      setError('Checkout was cancelled. Your answers are safe — you can start again when ready.');
      window.history.replaceState({}, '', '/ai-website-generator');
    }
  }, []);

  const validateIntake = (): string => {
    if (!form.businessName.trim() || !form.businessType.trim()) return 'Please add your business name and industry.';
    if (!form.name.trim() || !form.email.trim()) return 'Please add your name and email so we can send your concept.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Please enter a valid email address.';
    if (!form.budgetInterest) return 'Please choose a budget option to continue.';
    return '';
  };

  // Intake submit → decide route (book-a-call vs paid deposit).
  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (honeypot.trim()) return; // bot
    const v = validateIntake();
    if (v) { setError(v); return; }

    const tier = BUDGET_TIERS.find(t => t.id === form.budgetInterest);
    if (tier?.unqualified) {
      // "Not sure / just exploring" → book-a-call only. No checkout, no generation.
      setStep('bookcall');
      scrollToFlow();
      return;
    }
    // Qualified → show the deposit/checkout step (where the $250 is introduced).
    setStep('deposit');
    scrollToFlow();
  };

  // Deposit step → create Stripe session and redirect to secure checkout.
  const handleStartCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      // Preserve the intake answers across the Stripe round-trip.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form, smsConsent }));
      const res = await fetch('/api/create-deposit-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgetTier: form.budgetInterest, email: form.email, honeypot, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data?.error || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  // Agreement step → run the (gated) generation.
  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    setConcept(null);
    try {
      const res = await fetch('/api/generate-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSessionId: depositSessionId, turnstileToken, honeypot, smsConsent, form }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) throw new Error('We could not confirm your deposit yet. If you just paid, wait a moment and try again.');
        if (res.status === 409) throw new Error('This deposit has already been used to generate a concept. Contact us and we’ll pick up where you left off.');
        if (data?.code === 'agreement_required') throw new Error('Please sign the service agreement above before generating.');
        throw new Error(data?.error || 'Something went wrong generating your design.');
      }
      setConcept(data.concept as WebsiteConcept);
      sessionStorage.removeItem(STORAGE_KEY);
      (window as any).fbq?.('track', 'Lead', { content_name: 'AI Website Generator' });
      setStep('result');
      scrollToFlow();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="AI Website Generator | Custom Website Design Concept | Ikonic"
        description="Answer a few questions and let Ikonic's AI create a custom website design concept for your business — then our team hand-perfects the design and builds it for you."
        canonical="/ai-website-generator"
      />
      <MatrixBackground />
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-[6vw] relative z-10">
        <Breadcrumb crumbs={[{ name: 'Home', href: '/' }, { name: 'AI Website Generator', href: '/ai-website-generator' }]} />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mint/30 bg-mint/5 text-mint text-micro mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED WEBSITE PLANNING
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-offwhite mb-6 leading-[1.05]">
            AI Website <span className="text-mint">Generator</span>
          </h1>
          <p className="text-lg md:text-xl text-offwhite-dark max-w-2xl mx-auto mb-4">
            Answer a few questions and get a custom website design concept built around your
            business, services, and goals.
          </p>
          <p className="text-sm text-mint/90 max-w-2xl mx-auto mb-8">{HUMAN_STEP_COPY}</p>
          <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Wand2 className="w-5 h-5" />
            Generate My Website Design
          </button>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-16 px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-micro text-mint mb-3">HOW IT WORKS</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite">
              From idea to built site in <span className="text-mint">four steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-charcoal-light border border-white/10 rounded-2xl p-6 hover:border-mint/40 transition-colors">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-mint text-charcoal font-bold text-sm flex items-center justify-center shadow-mint">
                  {i + 1}
                </div>
                <div className="w-12 h-12 bg-mint/10 rounded-xl flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{s.title}</h3>
                <p className="text-offwhite-dark text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Intake form ──────────────────────────────────────────────────── */}
      {step === 'intake' && (
        <section ref={formRef} className="py-16 px-[6vw] relative z-10 scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-micro text-mint mb-3">BUILD YOUR CONCEPT</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-3">
                Tell us about your business
              </h2>
              <p className="text-offwhite-dark">The more detail you share, the sharper your AI website concept.</p>
            </div>

            <form onSubmit={handleIntakeSubmit} className="bg-charcoal-light/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10 space-y-8">
              {/* Honeypot — visually hidden; real users never fill this in */}
              <div aria-hidden="true" className="absolute w-px h-px overflow-hidden -m-px p-0 border-0" style={{ clip: 'rect(0 0 0 0)' }}>
                <label>Company URL<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} /></label>
              </div>

              {/* Business basics */}
              <div className="space-y-5">
                <h3 className="font-display text-lg font-bold text-mint flex items-center gap-2">
                  <Building2 className="w-5 h-5" /> Your Business
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Business Name" required>
                    <input className={inputClass} value={form.businessName} onChange={set('businessName')} placeholder="e.g. Summit Plumbing Co." />
                  </Field>
                  <Field label="Business Type / Industry" required>
                    <input className={inputClass} value={form.businessType} onChange={set('businessType')} placeholder="e.g. Plumbing, Med Spa, Auto Detailing" />
                  </Field>
                </div>
                <Field label="Services Offered">
                  <textarea className={inputClass} rows={2} value={form.services} onChange={set('services')} placeholder="List your main services, separated by commas" />
                </Field>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Target Customers">
                    <input className={inputClass} value={form.targetCustomers} onChange={set('targetCustomers')} placeholder="Who do you serve?" />
                  </Field>
                  <Field label="Main Website Goal">
                    <input className={inputClass} value={form.websiteGoal} onChange={set('websiteGoal')} placeholder="e.g. Book more calls, get quote requests" />
                  </Field>
                </div>
              </div>

              {/* Design preferences */}
              <div className="space-y-5 pt-2">
                <h3 className="font-display text-lg font-bold text-mint flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Design & Content
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Existing Website URL" hint="optional">
                    <input className={inputClass} value={form.existingUrl} onChange={set('existingUrl')} placeholder="https://" />
                  </Field>
                  <Field label="Pages Needed">
                    <input className={inputClass} value={form.pagesNeeded} onChange={set('pagesNeeded')} placeholder="e.g. Home, Services, About, Contact" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Preferred Website Style">
                    <select className={inputClass} value={form.preferredStyle} onChange={set('preferredStyle')}>
                      <option value="">Select a style…</option>
                      {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Preferred Colors">
                    <input className={inputClass} value={form.preferredColors} onChange={set('preferredColors')} placeholder="e.g. Navy & gold, or brand colors" />
                  </Field>
                </div>
                <Field label="Do you have a logo / brand assets available?">
                  <div className="flex gap-3">
                    {['Yes', 'No'].map(opt => (
                      <button type="button" key={opt} onClick={() => setForm(p => ({ ...p, hasBranding: opt }))}
                        className={`flex-1 py-3 rounded-lg border font-medium transition-all ${form.hasBranding === opt ? 'border-mint bg-mint/10 text-mint' : 'border-white/10 text-offwhite-dark hover:border-white/30'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Inspiration Websites" hint="optional">
                  <input className={inputClass} value={form.inspiration} onChange={set('inspiration')} placeholder="Any sites you love the look of?" />
                </Field>
                <Field label="What makes your business different?">
                  <textarea className={inputClass} rows={2} value={form.uniqueSellingPoint} onChange={set('uniqueSellingPoint')} placeholder="Your edge, guarantees, awards, story…" />
                </Field>
                <Field label="Do you need CRM, automation, AI agent, or marketing support?">
                  <input className={inputClass} value={form.needsSystems} onChange={set('needsSystems')} placeholder="e.g. Yes — CRM + AI agent for missed calls" />
                </Field>
              </div>

              {/* Budget — REQUIRED. Described without prices. */}
              <div className="space-y-5 pt-2">
                <h3 className="font-display text-lg font-bold text-mint flex items-center gap-2">
                  <Star className="w-5 h-5" /> Which best describes your project? <span className="text-mint">*</span>
                </h3>
                <div className="space-y-3">
                  {BUDGET_TIERS.map(tier => (
                    <button type="button" key={tier.id} onClick={() => setForm(p => ({ ...p, budgetInterest: tier.id }))}
                      className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-start gap-3 ${form.budgetInterest === tier.id ? 'border-mint bg-mint/10' : 'border-white/10 hover:border-white/30'}`}>
                      <span className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${form.budgetInterest === tier.id ? 'border-mint bg-mint' : 'border-white/30'}`}>
                        {form.budgetInterest === tier.id && <Check className="w-3 h-3 text-charcoal" />}
                      </span>
                      <span>
                        <span className={`block font-medium ${form.budgetInterest === tier.id ? 'text-offwhite' : 'text-offwhite'}`}>{tier.label}</span>
                        <span className="block text-sm text-offwhite-dark">{tier.desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-5 pt-2">
                <h3 className="font-display text-lg font-bold text-mint flex items-center gap-2">
                  <Users className="w-5 h-5" /> Where to send your concept
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <Field label="Name" required>
                    <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Your name" />
                  </Field>
                  <Field label="Email" required>
                    <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="you@business.com" />
                  </Field>
                  <Field label="Phone Number">
                    <input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="(720) 000-0000" />
                  </Field>
                </div>
                {/* TCPA consent — never assumed; only tagged when checked */}
                <label className="flex items-start gap-3 text-sm text-offwhite-dark cursor-pointer">
                  <input type="checkbox" checked={smsConsent} onChange={e => setSmsConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-mint flex-shrink-0" />
                  <span>
                    By providing your phone number, you agree to receive SMS updates about your project from Ikonic.
                    Msg &amp; data rates may apply. Consent is not a condition of purchase. Reply STOP to opt out.
                  </span>
                </label>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2 text-lg py-4">
                <ArrowRight className="w-5 h-5" /> Continue
              </button>
            </form>
          </div>
        </section>
      )}

      {/* ── Flow steps (deposit / bookcall / agreement / result) ─────────── */}
      {step !== 'intake' && (
        <section ref={flowRef} className="py-16 px-[6vw] relative z-10 scroll-mt-24">
          <div className="max-w-3xl mx-auto">
            {step === 'deposit' && (
              <DepositStep
                loading={loading}
                error={error}
                onTurnstile={setTurnstileToken}
                onStart={handleStartCheckout}
                onBack={() => { setStep('intake'); setError(''); }}
              />
            )}
            {step === 'bookcall' && (
              <BookCallStep onBack={() => { setStep('intake'); setError(''); }} />
            )}
            {step === 'agreement' && (
              <AgreementStep
                confirmed={agreementConfirmed}
                onConfirm={setAgreementConfirmed}
                onTurnstile={setTurnstileToken}
                onGenerate={handleGenerate}
                loading={loading}
                error={error}
              />
            )}
            {step === 'result' && concept && <ConceptResult concept={concept} />}
          </div>
        </section>
      )}

      {/* ── Pricing (NO dollar amounts — tiers described by value) ────────── */}
      <section className="py-20 px-[6vw] bg-charcoal-light/60 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-micro text-mint mb-3">WHAT YOU CAN BUILD</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite">Two ways to grow with Ikonic</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-charcoal border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="font-display text-xl font-bold text-offwhite mb-1">Website Design & Build</h3>
              <p className="text-offwhite-dark text-sm mb-6">Everything you need to launch a professional, converting site.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Custom website design concept', 'Mobile-friendly layout', 'Service sections', 'Contact form', 'Professional website build'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-offwhite"><Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button onClick={scrollToForm} className="btn-outline text-center">Start Your Website</button>
            </div>
            <div className="relative bg-gradient-to-br from-mint/15 to-mint/5 border border-mint/40 rounded-3xl p-8 flex flex-col">
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-mint text-charcoal text-xs font-bold">MOST POPULAR</div>
              <h3 className="font-display text-xl font-bold text-offwhite mb-1">Full Business Growth System</h3>
              <p className="text-offwhite-dark text-sm mb-6">Your website plus a 24/7 lead machine that follows up for you.</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Website Design', 'CRM setup', 'AI agent', 'Lead capture', 'Automation & follow-ups', 'Marketing support'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-offwhite"><Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <button onClick={scrollToForm} className="btn-primary text-center">Build Your Growth System</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-offwhite mb-6">
            Ready to turn your idea into a <span className="text-mint">website?</span>
          </h2>
          <p className="text-offwhite-dark text-lg mb-8">{HUMAN_STEP_COPY}</p>
          <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Wand2 className="w-5 h-5" /> Generate My Website Design
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Deposit / checkout step — the ONLY place the $250 amount appears ───────────
function DepositStep({ loading, error, onTurnstile, onStart, onBack }: {
  loading: boolean; error: string; onTurnstile: (t: string) => void; onStart: () => void; onBack: () => void;
}) {
  return (
    <div className="bg-charcoal-light/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10 text-center">
      <div className="w-14 h-14 bg-mint/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Lock className="w-7 h-7 text-mint" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-4">Start your project</h2>
      <p className="text-offwhite-dark max-w-xl mx-auto mb-4">{DEPOSIT_COPY}</p>
      <p className="text-sm text-mint/90 max-w-xl mx-auto mb-8">{HUMAN_STEP_COPY}</p>

      <div className="flex items-center justify-center gap-2 text-offwhite-dark text-sm mb-6">
        <ShieldCheck className="w-4 h-4 text-mint" /> Secure checkout powered by Stripe
      </div>

      <div className="mb-6"><Turnstile onToken={onTurnstile} /></div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm mb-6 text-left">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      <button onClick={onStart} disabled={loading} className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-lg px-8 py-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Starting secure checkout…</>) : (<><Lock className="w-5 h-5" /> Continue to secure checkout</>)}
      </button>
      <div className="mt-5">
        <button onClick={onBack} className="text-offwhite-dark text-sm hover:text-mint transition-colors">← Back to my answers</button>
      </div>
    </div>
  );
}

// ── Book-a-call step (unqualified tier) — NO checkout, NO generation ──────────
function BookCallStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-charcoal-light/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10 text-center">
      <div className="w-14 h-14 bg-mint/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <CalendarClock className="w-7 h-7 text-mint" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-4">Let's find the right fit</h2>
      <p className="text-offwhite-dark max-w-xl mx-auto mb-8">
        Based on your answers, the best next step is a quick call. We'll learn about your goals and
        recommend the smartest path forward for your business — no pressure.
      </p>
      <a href={BOOKING_URL} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
        <PhoneCall className="w-5 h-5" /> Book a Call
      </a>
      <div className="mt-5">
        <button onClick={onBack} className="text-offwhite-dark text-sm hover:text-mint transition-colors">← Back to my answers</button>
      </div>
    </div>
  );
}

// ── Agreement step (paid → sign → generate) ───────────────────────────────────
function AgreementStep({ confirmed, onConfirm, onTurnstile, onGenerate, loading, error }: {
  confirmed: boolean; onConfirm: (v: boolean) => void; onTurnstile: (t: string) => void; onGenerate: () => void; loading: boolean; error: string;
}) {
  return (
    <div className="bg-charcoal-light/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10">
      <div className="flex items-center gap-2 text-mint text-sm font-medium mb-6">
        <Check className="w-5 h-5" /> Deposit received — your project is started.
      </div>

      <div className="w-14 h-14 bg-mint/10 rounded-2xl flex items-center justify-center mb-5">
        <FileSignature className="w-7 h-7 text-mint" />
      </div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-3">Sign your service agreement</h2>
      <p className="text-offwhite-dark mb-4">
        One last step before your AI concept: review and sign the website-build service agreement.
        Your concept generates as soon as it's signed.
      </p>
      <p className="text-sm text-mint/90 mb-6">{HUMAN_STEP_COPY}</p>

      {/*
        TODO: embed the Marvin/GHL Documents website-build template here
        (iframe or GHL Documents link). On signature, a GHL Documents webhook
        marks the session signed server-side (see api/_lib/ghl.ts).
        Until that is wired, the checkbox below lets Josh confirm the flow;
        the server still independently enforces the signed status.
      */}
      <a href={BOOKING_URL} className="btn-outline inline-flex items-center gap-2 mb-6">
        <FileSignature className="w-4 h-4" /> Open service agreement
      </a>

      <label className="flex items-start gap-3 text-sm text-offwhite mb-6 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={e => onConfirm(e.target.checked)} className="mt-0.5 w-4 h-4 accent-mint flex-shrink-0" />
        <span>I have reviewed and signed the website-build service agreement.</span>
      </label>

      <div className="mb-6"><Turnstile onToken={onTurnstile} /></div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /><span>{error}</span>
        </div>
      )}

      <button onClick={onGenerate} disabled={loading || !confirmed} className="btn-primary w-full inline-flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Generating your design concept…</>) : (<><Wand2 className="w-5 h-5" /> Generate My Website Design</>)}
      </button>
    </div>
  );
}

// ── Result renderer ───────────────────────────────────────────────────────────
function ConceptResult({ concept }: { concept: WebsiteConcept }) {
  const c = concept;
  const palette = c.colorDirection?.palette || [];
  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mint/30 bg-mint/5 text-mint text-micro mb-4">
          <Sparkles className="w-3.5 h-3.5" /> YOUR AI WEBSITE CONCEPT
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite">{c.conceptTitle}</h2>
      </div>

      <div className="max-w-2xl mx-auto mb-10 text-center p-4 rounded-xl border border-mint/20 bg-mint/5 text-mint text-sm">
        {HUMAN_STEP_COPY}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card icon={Layout} title="Recommended Layout"><p className="text-offwhite-dark">{c.layout}</p></Card>
          <Card icon={LayoutTemplate} title="Recommended Page Structure">
            <div className="flex flex-wrap gap-2">
              {(c.pageStructure || []).map((p, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-mint/10 text-mint text-sm font-medium border border-mint/20">{p}</span>
              ))}
            </div>
          </Card>
          <Card icon={Type} title="Hero Section Copy">
            <p className="font-display text-2xl font-bold text-offwhite mb-2 leading-tight">{c.hero?.headline}</p>
            <p className="text-offwhite-dark">{c.hero?.subheadline}</p>
          </Card>
          <Card icon={Star} title="Service Section Ideas">
            <div className="space-y-3">
              {(c.serviceIdeas || []).map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />
                  <div><p className="text-offwhite font-medium">{s.title}</p><p className="text-offwhite-dark text-sm">{s.description}</p></div>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card icon={Users} title="About Section Direction"><p className="text-offwhite-dark text-sm">{c.aboutDirection}</p></Card>
            <Card icon={PhoneCall} title="Contact / Booking Direction"><p className="text-offwhite-dark text-sm">{c.contactDirection}</p></Card>
          </div>
          <Card icon={MousePointerClick} title="Call-to-Action Buttons">
            <div className="flex flex-wrap gap-3">
              {(c.ctaButtons || []).map((cta, i) => (
                <span key={i} className={i === 0 ? 'btn-primary text-sm' : 'btn-outline text-sm'}>{cta}</span>
              ))}
            </div>
          </Card>
          {c.conversionTips?.length > 0 && (
            <Card icon={Sparkles} title="Conversion Recommendations">
              <ul className="space-y-2">
                {c.conversionTips.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-offwhite-dark text-sm"><ArrowRight className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card icon={Palette} title="Design Style">
            <p className="text-offwhite-dark text-sm mb-4">{c.designStyle}</p>
            <p className="text-offwhite-dark text-sm mb-3">{c.colorDirection?.description}</p>
            <div className="flex flex-wrap gap-2">
              {palette.map((col, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-lg border border-white/10" style={{ background: col.hex }} />
                  <p className="text-[10px] text-offwhite-dark mt-1">{col.name}</p>
                  <p className="text-[10px] text-offwhite-dark font-mono">{col.hex}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card icon={Eye} title="Website Concept Preview"><WireframePreview concept={c} /></Card>
          <Card icon={LayoutTemplate} title="Suggested Sections">
            <ol className="space-y-2">
              {(c.sections || []).map((s, i) => (
                <li key={i} className="flex items-center gap-3 text-offwhite text-sm">
                  <span className="w-6 h-6 rounded bg-mint/10 text-mint text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <div className="mt-10 bg-gradient-to-br from-mint/15 to-mint/5 border border-mint/40 rounded-3xl p-8 md:p-10 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-3">Your concept is on its way to our team.</h3>
        <p className="text-offwhite-dark mb-6 max-w-xl mx-auto">
          Our designers will hand-perfect this concept's design and UX, then build your real,
          high-converting website. We'll be in touch to kick things off.
        </p>
        <a href={BOOKING_URL} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
          <Rocket className="w-5 h-5" /> Talk to Ikonic About Your Build
        </a>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-charcoal-light border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 bg-mint/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-mint" />
        </div>
        <h3 className="font-display text-base font-bold text-offwhite">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function WireframePreview({ concept }: { concept: WebsiteConcept }) {
  const accent = concept.colorDirection?.palette?.[1]?.hex || concept.colorDirection?.palette?.[0]?.hex || '#00FF9D';
  const primary = concept.colorDirection?.palette?.[0]?.hex || '#0B0D10';
  const nav = (concept.pageStructure || []).slice(0, 4);
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-charcoal">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>
      <div className="p-3 space-y-3" style={{ background: '#0f1114' }}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 rounded" style={{ background: accent }} />
          <div className="flex gap-2">{nav.map((_, i) => <div key={i} className="h-2 w-8 rounded bg-white/20" />)}</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}18)` }}>
          <div className="h-3 w-3/4 mx-auto rounded bg-white/70 mb-2" />
          <div className="h-2 w-1/2 mx-auto rounded bg-white/30 mb-3" />
          <div className="h-5 w-24 mx-auto rounded" style={{ background: accent }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-md p-2 bg-white/5 border border-white/10">
              <div className="h-4 w-4 rounded mb-1.5" style={{ background: accent }} />
              <div className="h-1.5 w-full rounded bg-white/25 mb-1" />
              <div className="h-1.5 w-2/3 rounded bg-white/15" />
            </div>
          ))}
        </div>
        <div className="h-6 rounded" style={{ background: `${primary}`, border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
    </div>
  );
}
