import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ChevronDown, ChevronUp, Star, BookOpen, Download, Package } from 'lucide-react';

const GOLD = '#F5A623';

const chapters = [
  {
    title: 'Part I: The Invisible Tax',
    chapters: [
      { label: 'Intro', desc: "The author's origin story and the book's premise: your brand is either making or costing you money daily." },
      { label: 'Ch. 1 – The Trust Tax', desc: 'Quantifies what invisibility costs — pricing gap, lost leads, close rate, and referrals.' },
      { label: 'Ch. 2 – From Polishing Paint to Building Empires', desc: "Joshua's personal journey from detailer to brand strategist." },
      { label: 'Ch. 3 – The Psychology of "I\'ll Call You Back"', desc: 'The neuroscience behind trust — 50-millisecond judgments, mere exposure effect, authority heuristics.' },
      { label: 'Ch. 3.5 – The Invisible Competitor', desc: 'The customer who never called because they never noticed you.' },
    ],
  },
  {
    title: 'Part II: The Brand Equation',
    chapters: [
      { label: 'Ch. 4 – The Brand Equation', desc: 'Revenue = Visibility × Professionalism × Consistency ÷ Friction.' },
      { label: 'Ch. 5 – Your Fleet Is a Goldmine', desc: 'Impression math, cost-per-thousand comparisons, and strategic parking.' },
      { label: 'Ch. 6 – The Seven Touchpoints System', desc: 'Fleet, crew, digital, paperwork, job site, experience, and community.' },
      { label: 'Ch. 7 – The Math That Changes Everything', desc: 'Full financial model showing a 21:1 ROI.' },
      { label: 'Ch. 7.5 – The Objection Killer', desc: 'Rebuttals to every common excuse for not investing in your brand.' },
    ],
  },
  {
    title: 'Part III: The Transformation',
    chapters: [
      { label: 'Ch. 8 – Proof: Five Case Studies', desc: 'HVAC, landscaping, plumbing, cleaning, and roofing transformations with real numbers.' },
      { label: 'Ch. 9 – The Pricing Power of Brand', desc: 'Three pricing levers — base rate premium, upsell acceptance, price objection elimination.' },
      { label: 'Ch. 10 – The Mindset Shift: From Technician to CEO', desc: 'Identity work and the internal shift required to lead a brand-first business.' },
      { label: 'Ch. 11 – Building a Brand-Led Team', desc: 'Brand as a hiring, retention, and culture tool.' },
    ],
  },
  {
    title: 'Part IV: The Playbook',
    chapters: [
      { label: 'Ch. 12 – The Ikonic Brand Audit', desc: '7-dimension, 70-point self-scoring framework.' },
      { label: 'Ch. 13 – The 90-Day Brand Transformation', desc: 'Phase-by-phase implementation plan with costs.' },
      { label: 'Ch. 14 – Designing Wraps That Print Money', desc: 'The 3-second rule, information hierarchy, and the 5-point checklist.' },
      { label: 'Ch. 15 – From One Truck to Market Domination', desc: 'Fleet scaling strategy, tipping points, and hiring advantages.' },
    ],
  },
  {
    title: 'Part V: The Compound Effect',
    chapters: [
      { label: 'Ch. 16 – Digital Meets Physical', desc: 'Omnichannel alignment and closing the cognitive dissonance gap.' },
      { label: 'Ch. 17 – The 17 Brand Killers', desc: 'Common mistakes that sabotage brand investment.' },
      { label: 'Ch. 18 – The Compound Effect of Brand Equity', desc: 'Brand as an appreciating asset vs. advertising as a recurring expense.' },
      { label: 'Ch. 19 – Your Move', desc: 'The fork-in-the-road close.' },
      { label: 'Ch. 20 – Social Media That Actually Works', desc: 'The Four Pillars framework and 30-minute weekly system.' },
      { label: 'Ch. 21 – The Review Engine', desc: 'Systematizing reviews as a compounding sales asset.' },
      { label: 'Ch. 22 – Strategic Partnerships', desc: 'The Partnership Triangle and the real estate agent goldmine.' },
      { label: 'Ch. 23 – The Franchise Effect', desc: 'Replicating national brand perception for $11K–$25K vs. $350K+ in franchise fees.' },
      { label: 'Ch. 24 – Beyond the Truck', desc: 'Yard signs, door hangers, trailers, job site banners, wearables — every surface as a billboard.' },
      { label: 'Ch. 25 – What to Do Monday Morning', desc: 'Five concrete actions totaling ~2.5 hours.' },
      { label: 'Ch. 26 – A Letter to the Skeptic', desc: 'A direct address to readers still on the fence.' },
    ],
  },
];

const benefits = [
  { icon: '🏆', title: 'Build Instant Trust',       desc: 'Learn the branding signals that instantly communicate reliability and quality to potential customers in your area.' },
  { icon: '💰', title: 'Command Premium Prices',    desc: 'Discover how a strong brand allows you to charge what you\'re worth and attract clients who value quality over the lowest bid.' },
  { icon: '📍', title: 'Dominate Local Marketing',  desc: 'Use Joshua\'s frameworks to position yourself on every platform so local businesses always choose you over the competition.' },
];

const faqs = [
  { q: 'Who is this book specifically for?',               a: 'Local service business owners — plumbers, roofers, wrap shops, landscapers, detailers, and anyone who relies on their local reputation to win jobs.' },
  { q: 'Do I need a marketing background to understand it?', a: 'Not at all. The book is written in plain language with practical step-by-step guidance. No marketing degree required.' },
  { q: 'What formats are included in the Digital Edition?',  a: 'PDF, ePub, and Mobi — readable on any device, Kindle, iPad, or computer.' },
  { q: 'Is there a money-back guarantee?',                  a: 'Yes. The Complete Bundle comes with a 30-day money-back guarantee. If you don\'t find value, you get a full refund.' },
  { q: 'How quickly can I expect to see results?',          a: 'Most readers implement their first changes within a week. Visible reputation improvements typically show within 30–90 days.' },
];

export default function BrandedToWin() {
  const [openFaq, setOpenFaq]         = useState<number | null>(null);
  const [openChapter, setOpenChapter] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ position: 'relative', zIndex: 10 }}>
      {/* Dark overlay — dims matrix without fully hiding it */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(8,10,8,0.88)', zIndex: -1 }} />
      <Navigation />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-[6vw]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
              The Essential Guide for Service Businesses
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              Branded <span style={{ color: GOLD }}>to Win.</span>
            </h1>
            <p className="text-xl text-white/80 mb-2 font-medium">
              How Local Service Businesses Turn Image Into Income
            </p>
            <p className="text-white/50 mb-8 max-w-lg">
              Stop competing on price. Learn the proven branding strategies that top local service businesses use to dominate their markets and increase profits.
            </p>
            <div className="flex items-center gap-3 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: GOLD }} />
              ))}
              <span className="text-white/60 text-sm">Joined by 10,000+ readers</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#pricing"
                className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg text-lg"
                style={{ background: GOLD }}>
                <Package className="w-5 h-5" /> Get the Book Now
              </a>
              <a href="#free-chapter"
                className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl border text-white transition-all hover:bg-white/10 text-lg"
                style={{ borderColor: GOLD, color: GOLD }}>
                <BookOpen className="w-5 h-5" /> Read a Free Chapter
              </a>
            </div>
          </div>

          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-40" style={{ background: GOLD }} />
              <img
                src="/branded.jpg"
                alt="Branded to Win by Joshua Soderblom"
                className="relative w-72 rounded-2xl shadow-2xl border border-white/10"
                style={{ boxShadow: `0 25px 60px rgba(245,166,35,0.35)` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── What You'll Discover ──────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]/80">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Inside the Book
          </p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">
            What You'll Discover Inside
          </h2>
          <p className="text-white/50 text-center max-w-2xl mx-auto mb-14">
            This isn't just theory. It's a practical, step-by-step manual designed to fundamentally change how your local service business operates and grows.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map(b => (
              <div key={b.title} className="bg-[#1a1a1a]/80 border border-white/10 rounded-2xl p-8 hover:border-[#F5A623]/30 transition-all">
                <div className="text-4xl mb-4">{b.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{b.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chapter Breakdown ─────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Chapter Breakdown</h2>
          <p className="text-white/50 text-center mb-12">
            Nearly 200 pages of dense, actionable insights. No fluff, just the exact frameworks you need to build a winning brand.
          </p>
          <div className="flex flex-col gap-3">
            {chapters.map((part, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden hover:border-[#F5A623]/30 transition-all">
                <button
                  onClick={() => setOpenChapter(openChapter === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-bold text-white" style={{ color: openChapter === i ? GOLD : undefined }}>{part.title}</span>
                  {openChapter === i
                    ? <ChevronUp className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
                </button>
                {openChapter === i && (
                  <div className="px-6 pb-5 flex flex-col gap-4 border-t border-white/10 pt-4">
                    {part.chapters.map((ch, j) => (
                      <div key={j}>
                        <p className="text-sm font-semibold text-white/90 mb-0.5">{ch.label}</p>
                        <p className="text-white/45 text-sm leading-relaxed">{ch.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Chapter Form ────────────────────────────────────────────────── */}
      <section id="free-chapter" className="py-20 px-[6vw] bg-[#111111]/80">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>
            Free Download
          </p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Read a Free Chapter</h2>
          <p className="text-white/50 text-center mb-10">
            Get an instant preview of the book — no credit card required.
          </p>
          <div style={{ height: '518px' }}>
            <iframe
              src="https://crm.ikonic303.com/widget/form/AiVNk0UN8mRga7Aw9ek2"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              id="inline-AiVNk0UN8mRga7Aw9ek2"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Free Chapter Download"
              data-height="518"
              data-layout-iframe-id="inline-AiVNk0UN8mRga7Aw9ek2"
              data-form-id="AiVNk0UN8mRga7Aw9ek2"
              title="Free Chapter Download"
            />
          </div>
        </div>
      </section>

      {/* ── About Joshua ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]/80">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>The Author</p>
          <h2 className="font-display text-4xl font-bold text-white mb-8">Meet Joshua Soderblom</h2>
          <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl border-2"
            style={{ background: `${GOLD}15`, borderColor: GOLD }}>
            JS
          </div>
          <p className="text-white/70 leading-relaxed mb-6 max-w-3xl mx-auto">
            Joshua Soderblom didn't start behind a desk. He started with a pressure washer, a polishing machine, and an obsession with making things look flawless. In 2020, Josh launched Ikonic as a premium vehicle detailing and protection company in Denver, Colorado — earning every certification he could get his hands on.
          </p>
          <p className="text-white/70 leading-relaxed mb-10 max-w-3xl mx-auto">
            But somewhere along the way, he had a realization that changed everything — the brand is the business. Today, he helps hundreds of local service business owners build brands so strong that customers choose them on sight. The result: businesses that charge more, win more, and grow on autopilot.
          </p>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: GOLD }}>100s</p>
              <p className="text-white/50 text-sm">Businesses Transformed</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: GOLD }}>5-Star</p>
              <p className="text-white/50 text-sm">Rated Framework</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-[6vw]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: GOLD }}>Pricing</p>
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Choose Your Package</h2>
          <p className="text-white/50 text-center mb-14">
            Get instant access to the digital materials and start transforming your business today.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Digital */}
            <div className="bg-[#1a1a1a]/80 border border-white/10 rounded-2xl p-8 flex flex-col">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-2">Digital Edition</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display text-5xl font-bold text-white">$9.50</span>
                <span className="text-white/40 mb-2">/one-time</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {['Branded to Win eBook (PDF, ePub, Mobi)', 'Lifetime updates to digital editions'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/60 text-sm">
                    <span style={{ color: GOLD }} className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="https://crm.ikonic303.com/payment-link/69e2b311557558e89e520b78" target="_blank" rel="noopener noreferrer"
                className="w-full text-center font-bold py-3 rounded-xl border transition-all hover:bg-white/5 text-white"
                style={{ borderColor: `${GOLD}50` }}>
                Get Digital Edition
              </a>
            </div>

            {/* Complete Bundle */}
            <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden border-2"
              style={{ background: 'linear-gradient(135deg, #1a1400 0%, #0a0a0a 100%)', borderColor: GOLD }}>
              <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-black"
                style={{ background: GOLD }}>
                MOST POPULAR
              </div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: GOLD }}>The Complete Bundle</p>
              <p className="text-white/50 text-xs mb-3">Designed for the serious owner ready to dominate their local market</p>
              <div className="flex items-end gap-1 mb-6">
                <span className="font-display text-5xl font-bold text-white">$24.50</span>
                <span className="text-white/40 mb-2">/one-time</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {[
                  'Branded to Win eBook (All formats)',
                  'Actionable Audiobook (MP3)',
                  'Printable Branding Worksheets & Templates',
                  'Bonus: 30-Day Implementation Guide',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/80 text-sm">
                    <span style={{ color: GOLD }} className="mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="https://crm.ikonic303.com/payment-link/69e2b301557558e89e520b77" target="_blank" rel="noopener noreferrer"
                className="w-full text-center font-bold py-3 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: GOLD }}>
                Get the Complete Bundle
              </a>
              <p className="text-center text-white/30 text-xs mt-3">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw] bg-[#111111]/80">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-white/50 text-center mb-12">
            Everything you need to know about the book, the frameworks, and how it can transform your service business.
          </p>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden hover:border-[#F5A623]/30 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-[6vw]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: GOLD }}>
            Insights for the Driven
          </p>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Ready to Build a Brand That Wins?
          </h2>
          <p className="text-white/50 mb-8">
            Join thousands of local service business owners receiving weekly tips on building a brand that commands premium prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://brandedtowin.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: GOLD }}>
              <Download className="w-5 h-5" /> Get the Book — $24.50
            </a>
            <Link to="/contact"
              className="flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-xl border text-white transition-all hover:bg-white/5"
              style={{ borderColor: `${GOLD}50` }}>
              Work With Ikonic
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
