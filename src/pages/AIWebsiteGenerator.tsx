import { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Wand2, Layout, Palette, LayoutTemplate, ArrowRight, Check, Loader2,
  MessageSquare, Cpu, Eye, Rocket, Type, MousePointerClick, Users, PhoneCall,
  Building2, Star, AlertCircle,
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
  budgetInterest: string;
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
const BUDGET_OPTIONS = [
  'Website Design & Build — starting at $500',
  'Full CRM + AI Agent + Marketing System — $2,000 setup + $1,500/month',
  'Not sure yet — recommend for me',
];

const STEPS = [
  { icon: MessageSquare, title: 'Tell us about your business', desc: 'Answer a few quick guided questions about your goals, services, and style.' },
  { icon: Cpu, title: 'AI generates your concept', desc: 'Our AI builds a custom website design concept tailored to your business.' },
  { icon: Eye, title: 'Review your custom design', desc: 'See your recommended layout, copy, and content direction instantly.' },
  { icon: Rocket, title: 'Let Ikonic build it for you', desc: 'One click to turn the concept into a real, high-converting website.' },
];

// ── Small styled field primitives (brand dark theme) ──────────────────────────
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [concept, setConcept] = useState<WebsiteConcept | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Deposit flow: the form posts to /api/create-generator-deposit, which returns a
  // Square checkout URL. Square sends the customer back to
  // /ai-website-generator?token=… . We then ask OUR server to confirm with Square that
  // the order is genuinely paid before generating. The token in the URL is only a
  // pointer — the browser never gets to assert "paid".
  //
  // If the server is running in free lead-magnet mode (GENERATOR_REQUIRE_DEPOSIT=0)
  // /api/generate-website simply accepts the request without a token, so the same code
  // path works for both models with no front-end change.
  const generate = async (payload: FormState, token?: string) => {
    const res = await fetch('/api/generate-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token ? { ...payload, token } : payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Something went wrong generating your design.');
    setConcept(data.concept as WebsiteConcept);
    (window as any).fbq?.('track', 'Lead', { content_name: 'AI Website Generator' });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  // Returning from Square — verify, then generate using the details we saved before
  // sending them to checkout (the form state is gone after the redirect).
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) return;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/verify-generator-deposit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Could not verify your deposit.');
        if (!data.paid) {
          setError('We have not received your payment yet. If you just paid, refresh in a moment.');
          return;
        }
        const saved = sessionStorage.getItem('ikonic:generator-form');
        const payload: FormState = saved ? { ...EMPTY_FORM, ...JSON.parse(saved) } : EMPTY_FORM;
        if (!payload.businessName) {
          setError('Deposit confirmed, but your details were lost. Please re-enter them below.');
          return;
        }
        await generate(payload, token);
        sessionStorage.removeItem('ikonic:generator-form');
        window.history.replaceState({}, '', '/ai-website-generator');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please call (720) 679-1230.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.businessName.trim() || !form.businessType.trim()) {
      setError('Please add your business name and business type so the AI can build your concept.');
      return;
    }
    setLoading(true);
    setConcept(null);
    try {
      // Survive the round trip to Square.
      sessionStorage.setItem('ikonic:generator-form', JSON.stringify(form));

      const res = await fetch('/api/create-generator-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          businessType: form.businessType,
          email: form.email,
        }),
      });
      const data = await res.json();

      // 404 => deposits aren't deployed; 402-free mode => generate directly. Either
      // way, fall back to generating so a config gap never dead-ends a real lead.
      if (res.status === 404) {
        await generate(form);
        return;
      }
      if (!res.ok) throw new Error(data?.error || 'Could not start checkout.');

      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="AI Website Generator | Free Custom Website Design Concept | ikonic303"
        description="Answer a few questions and let Ikonic's AI create a custom website design concept for your business — layout, copy, sections, colors, and a design direction ready to build."
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
          <p className="text-lg md:text-xl text-offwhite-dark max-w-2xl mx-auto mb-8">
            Answer a few questions and get a custom website design concept built around your
            business, services, and goals.
          </p>
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
              From idea to design in <span className="text-mint">four steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="relative bg-charcoal-light border border-white/10 rounded-2xl p-6 hover:border-mint/40 transition-colors">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-mint text-charcoal font-bold text-sm flex items-center justify-center shadow-mint">
                  {i + 1}
                </div>
                <div className="w-12 h-12 bg-mint/10 rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-mint" />
                </div>
                <h3 className="font-display text-lg font-bold text-offwhite mb-2">{step.title}</h3>
                <p className="text-offwhite-dark text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <section ref={formRef} className="py-16 px-[6vw] relative z-10 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-micro text-mint mb-3">BUILD YOUR CONCEPT</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-3">
              Tell us about your business
            </h2>
            <p className="text-offwhite-dark">The more detail you share, the sharper your AI website concept.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-charcoal-light/80 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-10 space-y-8">
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
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setForm(p => ({ ...p, hasBranding: opt }))}
                      className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                        form.hasBranding === opt
                          ? 'border-mint bg-mint/10 text-mint'
                          : 'border-white/10 text-offwhite-dark hover:border-white/30'
                      }`}
                    >
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
              <Field label="Budget Interest">
                <div className="space-y-3">
                  {BUDGET_OPTIONS.map(opt => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setForm(p => ({ ...p, budgetInterest: opt }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-start gap-3 ${
                        form.budgetInterest === opt
                          ? 'border-mint bg-mint/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <span className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${form.budgetInterest === opt ? 'border-mint bg-mint' : 'border-white/30'}`}>
                        {form.budgetInterest === opt && <Check className="w-3 h-3 text-charcoal" />}
                      </span>
                      <span className={form.budgetInterest === opt ? 'text-offwhite' : 'text-offwhite-dark'}>{opt}</span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Contact */}
            <div className="space-y-5 pt-2">
              <h3 className="font-display text-lg font-bold text-mint flex items-center gap-2">
                <Users className="w-5 h-5" /> Where to send your concept
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Field label="Name">
                  <input className={inputClass} value={form.name} onChange={set('name')} placeholder="Your name" />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputClass} value={form.email} onChange={set('email')} placeholder="you@business.com" />
                </Field>
                <Field label="Phone Number">
                  <input type="tel" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="(720) 000-0000" />
                </Field>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full inline-flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generating your design concept…</>
              ) : (
                <><Wand2 className="w-5 h-5" /> Generate My Website Design</>
              )}
            </button>
            <p className="text-center text-xs text-offwhite-dark">
              Takes about 15 seconds. No credit card. No commitment.
            </p>
          </form>
        </div>
      </section>

      {/* ── AI Result ────────────────────────────────────────────────────── */}
      {(loading || concept) && (
        <section ref={resultRef} className="py-16 px-[6vw] relative z-10 scroll-mt-24">
          <div className="max-w-5xl mx-auto">
            {loading && !concept ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 text-mint animate-spin mx-auto mb-6" />
                <h3 className="font-display text-2xl font-bold text-offwhite mb-2">Designing your concept…</h3>
                <p className="text-offwhite-dark">Our AI is mapping out your layout, copy, and color direction.</p>
              </div>
            ) : concept ? (
              <ConceptResult concept={concept} />
            ) : null}
          </div>
        </section>
      )}

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-charcoal-light/60 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-micro text-mint mb-3">PRICING</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite">
              Ready when you are
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website Design & Build */}
            <div className="bg-charcoal border border-white/10 rounded-3xl p-8 flex flex-col">
              <h3 className="font-display text-xl font-bold text-offwhite mb-1">Website Design & Build</h3>
              <p className="text-offwhite-dark text-sm mb-5">Everything you need to launch a professional, converting site.</p>
              <div className="mb-6">
                <span className="text-offwhite-dark text-sm">Starting at</span>
                <div className="font-display text-4xl font-bold text-mint">$500</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Custom website design concept', 'Mobile-friendly layout', 'Service sections', 'Contact form', 'Professional website build'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-offwhite">
                    <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="/contact" className="btn-outline text-center">Start Your Website</a>
            </div>

            {/* Full Business Growth System */}
            <div className="relative bg-gradient-to-br from-mint/15 to-mint/5 border border-mint/40 rounded-3xl p-8 flex flex-col">
              <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-mint text-charcoal text-xs font-bold">MOST POPULAR</div>
              <h3 className="font-display text-xl font-bold text-offwhite mb-1">Full Business Growth System</h3>
              <p className="text-offwhite-dark text-sm mb-5">Your website plus a 24/7 lead machine that follows up for you.</p>
              <div className="mb-6">
                <div className="font-display text-4xl font-bold text-mint">$2,000</div>
                <span className="text-offwhite-dark text-sm">setup + $1,500/month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Website Design', 'CRM setup', 'AI agent', 'Lead capture', 'Automation & follow-ups', 'Marketing support'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-offwhite">
                    <Check className="w-5 h-5 text-mint flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <a href="/contact" className="btn-primary text-center">Get the Growth System</a>
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
          <p className="text-offwhite-dark text-lg mb-8">
            Generate a free concept now — then let Ikonic build it for you.
          </p>
          <button onClick={scrollToForm} className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            <Wand2 className="w-5 h-5" />
            Generate My Website Design
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Result renderer ───────────────────────────────────────────────────────────
function ConceptResult({ concept }: { concept: WebsiteConcept }) {
  const c = concept;
  const palette = c.colorDirection?.palette || [];
  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mint/30 bg-mint/5 text-mint text-micro mb-4">
          <Sparkles className="w-3.5 h-3.5" /> YOUR AI WEBSITE CONCEPT
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite">{c.conceptTitle}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: structured concept */}
        <div className="lg:col-span-3 space-y-6">
          <Card icon={Layout} title="Recommended Layout">
            <p className="text-offwhite-dark">{c.layout}</p>
          </Card>

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
                  <div>
                    <p className="text-offwhite font-medium">{s.title}</p>
                    <p className="text-offwhite-dark text-sm">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card icon={Users} title="About Section Direction">
              <p className="text-offwhite-dark text-sm">{c.aboutDirection}</p>
            </Card>
            <Card icon={PhoneCall} title="Contact / Booking Direction">
              <p className="text-offwhite-dark text-sm">{c.contactDirection}</p>
            </Card>
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
                  <li key={i} className="flex items-start gap-3 text-offwhite-dark text-sm">
                    <ArrowRight className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right: design direction + UI preview */}
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

          {/* Wireframe preview */}
          <Card icon={Eye} title="Website Concept Preview">
            <WireframePreview concept={c} />
          </Card>

          {/* Sections list */}
          <Card icon={LayoutTemplate} title="Suggested Sections">
            <ol className="space-y-2">
              {(c.sections || []).map((s, i) => (
                <li key={i} className="flex items-center gap-3 text-offwhite text-sm">
                  <span className="w-6 h-6 rounded bg-mint/10 text-mint text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {/* Next step CTA */}
      <div className="mt-10 bg-gradient-to-br from-mint/15 to-mint/5 border border-mint/40 rounded-3xl p-8 md:p-10 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-bold text-offwhite mb-3">
          Love this concept? Let's make it real.
        </h3>
        <p className="text-offwhite-dark mb-6 max-w-xl mx-auto">
          Ikonic will turn this AI concept into a fully built, high-converting website — plus CRM,
          AI agent, and automation if you want the full growth system.
        </p>
        <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
          <Rocket className="w-5 h-5" />
          Build This Website With Ikonic
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

// Simple browser-mockup wireframe built from the concept
function WireframePreview({ concept }: { concept: WebsiteConcept }) {
  const accent = concept.colorDirection?.palette?.[1]?.hex || concept.colorDirection?.palette?.[0]?.hex || '#00FF9D';
  const primary = concept.colorDirection?.palette?.[0]?.hex || '#0B0D10';
  const nav = (concept.pageStructure || []).slice(0, 4);
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-charcoal">
      {/* browser bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border-b border-white/10">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
      </div>
      {/* mock page */}
      <div className="p-3 space-y-3" style={{ background: '#0f1114' }}>
        {/* nav row */}
        <div className="flex items-center justify-between">
          <div className="h-3 w-12 rounded" style={{ background: accent }} />
          <div className="flex gap-2">
            {nav.map((_, i) => <div key={i} className="h-2 w-8 rounded bg-white/20" />)}
          </div>
        </div>
        {/* hero */}
        <div className="rounded-lg p-4 text-center" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}18)` }}>
          <div className="h-3 w-3/4 mx-auto rounded bg-white/70 mb-2" />
          <div className="h-2 w-1/2 mx-auto rounded bg-white/30 mb-3" />
          <div className="h-5 w-24 mx-auto rounded" style={{ background: accent }} />
        </div>
        {/* service cards */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-md p-2 bg-white/5 border border-white/10">
              <div className="h-4 w-4 rounded mb-1.5" style={{ background: accent }} />
              <div className="h-1.5 w-full rounded bg-white/25 mb-1" />
              <div className="h-1.5 w-2/3 rounded bg-white/15" />
            </div>
          ))}
        </div>
        {/* footer band */}
        <div className="h-6 rounded" style={{ background: `${primary}` , border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
    </div>
  );
}
