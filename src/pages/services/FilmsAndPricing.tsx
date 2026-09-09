import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, AlertTriangle, Ban, Phone, ArrowRight, Info } from 'lucide-react';
import Navigation from '../../components/Navigation';
import MatrixBackground from '../../components/MatrixBackground';
import Footer from '../../components/Footer';
import JsonLd from '../../components/JsonLd';
import { serviceSchema, faqSchema } from '../../lib/schema';
import {
  evaluateSelection,
  primaryRateRows,
  securityRateRows,
  RATE_CONDITIONS,
  BLACKOUT_WARNING,
  MANUFACTURER_RESTRICTIONS,
  ON_SITE_ONLY_CONDITIONS,
  CONDITION_OPTIONS,
  PANE_OPTIONS,
  COATING_OPTIONS,
  SUBSTRATE_OPTIONS,
  data,
  type ConditionValue,
  type PaneValue,
  type CoatingValue,
  type SubstrateValue,
  type Ruling,
  type FilmResult,
  type FilterOption,
} from '../../lib/filmCompatibility';

// Exact SEO strings from the brief — rendered verbatim (PageSEO would append a
// second brand suffix, so this page sets its own head tags).
const SEO_TITLE = 'Window Film Pricing & Glass Compatibility | ikonic — Denver';
const SEO_DESCRIPTION =
  'See the exact window films we install, what each one costs per square foot, and which films are approved on your glass. We verify your glass before we quote.';
const CANONICAL = 'https://ikonic303.com/window-tint/films-and-pricing';
const PATH = '/window-tint/films-and-pricing';

const FAQS = [
  {
    q: 'Do these prices include everything?',
    a: `Film is priced per square foot at the rates shown. On top of that: a $${data.job_minimum} job minimum, edge sealing on exterior, X-Series, and security films, and — only where it applies — separately-quoted work for glass that can't be reached from the floor or travel outside the Denver metro. Every line is itemized in your written quote. This page is a rate card, not a quote.`,
  },
  {
    q: 'Why do two films that cost the same have different compatibility results?',
    a: 'Price is set per film group. The manufacturer’s safety ruling is set per exact film, by visible-light level. Ultra View 5 and Ultra View 25 both cost $11/sq ft, but on some glass one is approved and the other is not — so results are always shown per exact film, never merged.',
  },
  {
    q: 'What if I don’t know what kind of glass I have?',
    a: 'That is the normal answer. Pick “I don’t know” on any question and the tool stops instead of guessing. We identify your glass on site, free, before we quote — pane count, coatings, and whether it’s annealed, laminated, or tempered.',
  },
  {
    q: 'Can I get blackout film on my windows?',
    a: 'Only if they are tempered single-pane. Blackout is approved on tempered single-pane glass and nothing else, and it is not a substitute for Frost or Whiteout. We confirm the glass is tempered before quoting it.',
  },
  {
    q: 'Do you check the glass before installing?',
    a: 'Always. Every film we propose is checked against Edge’s published film-to-glass chart for your specific glass. If a film isn’t safe on your windows, we tell you and name one that is.',
  },
];

function Question<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: FilterOption<T>[];
  value: T | '';
  onChange: (v: T) => void;
}) {
  const groupId = useId();
  return (
    <fieldset className="border border-white/10 rounded-xl p-5 bg-charcoal">
      <legend className="font-display text-base font-semibold text-offwhite px-2">{legend}</legend>
      <div className="mt-3 space-y-2">
        {options.map((opt) => {
          const id = `${groupId}-${opt.value}`;
          const hintId = opt.hint ? `${id}-hint` : undefined;
          return (
            <div key={opt.value}>
              <label
                htmlFor={id}
                className="flex items-start gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/5"
              >
                <input
                  type="radio"
                  id={id}
                  name={name}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  aria-describedby={hintId}
                  className="mt-1 h-4 w-4 flex-shrink-0 accent-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                />
                <span className="text-sm text-offwhite">
                  {opt.label}
                  {opt.hint && (
                    <span id={hintId} className="block text-xs text-offwhite-dark mt-0.5">
                      {opt.hint}
                    </span>
                  )}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

const RULING_META: Record<Ruling, { label: string; Icon: typeof Check; cls: string }> = {
  G: { label: 'Safe', Icon: Check, cls: 'text-mint' },
  A: { label: 'Use caution', Icon: AlertTriangle, cls: 'text-offwhite' },
  R: { label: 'Not safe', Icon: Ban, cls: 'text-offwhite-dark' },
};

function ResultRow({ r }: { r: FilmResult }) {
  const meta = RULING_META[r.ruling];
  return (
    <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
      <div className="flex items-start gap-2.5 min-w-0">
        <meta.Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.cls}`} aria-hidden="true" />
        <div className="min-w-0">
          <span className="text-sm font-medium text-offwhite">{r.film}</span>{' '}
          <span className={`text-xs font-semibold ${meta.cls}`}>&mdash; {meta.label}</span>
          {r.sealantNote && (
            <span className="block text-xs text-offwhite-dark mt-0.5">{r.sealantNote}</span>
          )}
          {r.note && <span className="block text-xs text-offwhite-dark mt-0.5">{r.note}</span>}
          {r.safetyBlock && (
            <span className="block text-xs text-offwhite-dark mt-0.5">{r.safetyBlock}</span>
          )}
        </div>
      </div>
      <span className="text-sm text-offwhite-dark whitespace-nowrap sm:pl-4">{r.priceLabel}</span>
    </li>
  );
}

function ResultGroup({ title, rows }: { title: string; rows: FilmResult[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-6 first:mt-0">
      <h4 className="text-micro text-mint mb-1">
        {title} ({rows.length})
      </h4>
      <ul className="divide-y divide-white/10">
        {rows.map((r) => (
          <ResultRow key={r.film} r={r} />
        ))}
      </ul>
    </div>
  );
}

export default function FilmsAndPricing() {
  const [conditions, setConditions] = useState<ConditionValue[]>([]);
  const [pane, setPane] = useState<PaneValue | ''>('');
  const [coating, setCoating] = useState<CoatingValue | ''>('');
  const [substrate, setSubstrate] = useState<SubstrateValue | ''>('');

  const answered = conditions.length > 0 && pane !== '' && coating !== '' && substrate !== '';

  const result = useMemo(() => {
    if (pane === '' || coating === '' || substrate === '' || conditions.length === 0) return null;
    return evaluateSelection({ conditions, pane, coating, substrate });
  }, [conditions, pane, coating, substrate]);

  function toggleCondition(v: ConditionValue) {
    setConditions((prev) => {
      if (v === 'none') return prev.length === 1 && prev[0] === 'none' ? [] : ['none'];
      const withoutNone = prev.filter((c) => c !== 'none' && c !== v);
      return prev.includes(v) ? withoutNone : [...withoutNone, v];
    });
  }

  function reset() {
    setConditions([]);
    setPane('');
    setCoating('');
    setSubstrate('');
  }

  const primaryRows = [...primaryRateRows()].sort(
    (a, b) => a.pricePerSqft - b.pricePerSqft || a.priceGroup.localeCompare(b.priceGroup),
  );
  const securityRows = securityRateRows();

  return (
    <div className="relative bg-charcoal min-h-screen">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
      </Helmet>
      <JsonLd
        data={serviceSchema(
          'Architectural Window Film Installation',
          'Window Film Pricing & Glass Compatibility',
          SEO_DESCRIPTION,
        )}
      />
      <JsonLd data={faqSchema(FAQS)} />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-14 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto">
          <p className="text-micro text-mint mb-4">FILMS · PRICING · GLASS COMPATIBILITY</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight text-balance">
            Our Films, Your Glass, and What It Costs
          </h1>
          <p className="text-lg text-offwhite-dark leading-relaxed">
            This page is a rate card and a glass-compatibility check &mdash; not a quote. It shows
            the exact films we install, the published price per square foot for each, and, once you
            describe your glass, which of those films the manufacturer approves on it. We verify your
            glass in person before any quote.
          </p>
        </div>
      </section>

      {/* Section 1 — the films */}
      <section className="py-14 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-mint mb-3">We install Edge Window Films.</h2>
          <div className="space-y-4 text-offwhite-dark leading-relaxed">
            <p>
              Edge is an architectural flat-glass film line &mdash; film made for the windows in
              homes and buildings, not vehicles. Every film we propose is checked against the
              manufacturer&rsquo;s published film-to-glass compatibility chart for your specific
              glass before it goes in a quote.
            </p>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-offwhite">Solar &amp; heat-control film</dt>
                <dd>
                  Silver, Ultra View, Cool Alloy, Bronze, and Nature &mdash; interior films that cut
                  solar heat and glare while keeping the view. Priced from $10&ndash;$14 per square
                  foot.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-offwhite">Ceramic film</dt>
                <dd>
                  Pristine Ceramic (30, 40, 50, 70, 80) &mdash; a non-metal solar film that stays
                  neutral and doesn&rsquo;t interfere with signals. Pristine is a ceramic solar film,
                  not a security film.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-offwhite">Exterior film</dt>
                <dd>
                  X-Series (Ext Silver, Ext Cool Alloy), Ext Pristine, and Zen SSX 55 &mdash;
                  installed on the outside face of the glass for units that can&rsquo;t take an
                  interior film. Exterior films are safer for turf below reflective windows. Ext
                  Pristine 70/80 carries 9% exterior reflectance; Zen SSX 55 carries 10% exterior
                  reflectance. Exterior and X-Series films require edge sealing.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-offwhite">Decorative &amp; privacy film</dt>
                <dd>
                  Frost and Whiteout for daytime privacy that still passes light; Blackout for a
                  solid block-out. Cut vinyl and custom designs are quoted separately.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-offwhite">Anti-graffiti film</dt>
                <dd>
                  Clear Defense 4mil and 6mil &mdash; an optically clear sacrificial layer over
                  ground-floor glass that takes the scratch or etch instead of the pane.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-offwhite">Security film</dt>
                <dd>
                  Guardian (4mil Clear, 8mil Clear, 8mil Silver, 12mil) &mdash; the only security-film
                  line we carry. Thick, tear-resistant film that holds a shattered pane in its frame.
                  Security film requires edge sealing.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Section 2 — the rate card */}
      <section className="py-14 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-2">Published rates</h2>
          <p className="text-offwhite-dark mb-6 text-sm">
            Per square foot of glass. A film group shares one rate; compatibility is still decided
            per exact film further down.
          </p>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <caption className="sr-only">Window film rates per square foot</caption>
              <thead>
                <tr className="bg-charcoal-light text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite">Film</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite whitespace-nowrap">
                    Rate&nbsp;/&nbsp;sq&nbsp;ft
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {primaryRows.map((row) => (
                  <tr key={row.priceGroup} className="align-top">
                    <td className="px-4 py-3 text-offwhite">{row.priceGroup}</td>
                    <td className="px-4 py-3 text-offwhite-dark whitespace-nowrap">${row.pricePerSqft}</td>
                    <td className="px-4 py-3 text-offwhite-dark">
                      {row.exterior && 'Exterior film — edge sealing $2 / lineal ft. '}
                      {row.note}
                      {row.safetyBlock && (
                        <span className="text-offwhite">{row.note ? ' ' : ''}{row.safetyBlock}</span>
                      )}
                      {!row.exterior && !row.note && !row.safetyBlock && '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-display text-lg font-semibold text-offwhite mt-8 mb-2">
            Security film (Guardian)
          </h3>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <caption className="sr-only">Guardian security film rates</caption>
              <thead>
                <tr className="bg-charcoal-light text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite">Film</th>
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite whitespace-nowrap">
                    Rate&nbsp;/&nbsp;sq&nbsp;ft
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-offwhite">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {securityRows.map((row) => (
                  <tr key={row.priceGroup} className="align-top">
                    <td className="px-4 py-3 text-offwhite">{row.priceGroup}</td>
                    <td className="px-4 py-3 text-offwhite-dark whitespace-nowrap">${row.pricePerSqft}</td>
                    <td className="px-4 py-3 text-offwhite-dark">Edge sealing $4 / lineal ft.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Prominent conditions — not footnotes */}
          <div className="mt-8 rounded-xl border border-mint/30 bg-mint/5 p-5">
            <h3 className="font-display text-base font-semibold text-offwhite mb-3">
              How the rates are applied
            </h3>
            <ul className="space-y-2">
              {RATE_CONDITIONS.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-offwhite">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-mint" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-charcoal-light p-5">
            <p className="flex items-start gap-2.5 text-sm text-offwhite">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-offwhite" aria-hidden="true" />
              <span>
                <span className="font-semibold">Blackout: </span>
                {BLACKOUT_WARNING}
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — the compatibility filter */}
      <section className="py-14 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-mint mb-3">
            Not every film belongs on every window.
          </h2>
          <p className="text-offwhite-dark leading-relaxed mb-4">
            The manufacturer&rsquo;s chart contains 972 film-and-glass combinations. Of those,
            326&mdash;approximately one in three&mdash;are rated Not Safe. That is why we identify
            your glass before we quote.
          </p>
          <p className="text-offwhite-dark text-sm leading-relaxed mb-8">
            Answer what you can below. Every question has an &ldquo;I don&rsquo;t know&rdquo; &mdash;
            choosing it anywhere is normal, and it means we&rsquo;ll check on site rather than guess.
          </p>

          <div className="space-y-5">
            {/* Window condition (multi-select) */}
            <fieldset className="border border-white/10 rounded-xl p-5 bg-charcoal">
              <legend className="font-display text-base font-semibold text-offwhite px-2">
                First &mdash; is any of this true of the glass?
              </legend>
              <div className="mt-3 space-y-2">
                {CONDITION_OPTIONS.map((opt) => {
                  const hintId = opt.hint ? `cond-${opt.value}-hint` : undefined;
                  return (
                    <label
                      key={opt.value}
                      htmlFor={`cond-${opt.value}`}
                      className="flex items-start gap-3 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        id={`cond-${opt.value}`}
                        checked={conditions.includes(opt.value)}
                        onChange={() => toggleCondition(opt.value)}
                        aria-describedby={hintId}
                        className="mt-1 h-4 w-4 flex-shrink-0 accent-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                      />
                      <span className="text-sm text-offwhite">
                        {opt.label}
                        {opt.hint && (
                          <span id={hintId} className="block text-xs text-offwhite-dark mt-0.5">
                            {opt.hint}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <Question
              legend="How many panes of glass?"
              name="pane"
              options={PANE_OPTIONS}
              value={pane}
              onChange={setPane}
            />
            <Question
              legend="Any Low-E coating, or factory tint in the glass?"
              name="coating"
              options={COATING_OPTIONS}
              value={coating}
              onChange={setCoating}
            />
            <Question
              legend="What type of glass is it?"
              name="substrate"
              options={SUBSTRATE_OPTIONS}
              value={substrate}
              onChange={setSubstrate}
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={reset}
              className="text-sm text-offwhite-dark underline hover:text-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint rounded"
            >
              Start over
            </button>
          </div>

          {/* Results — announced to assistive tech */}
          <div role="status" aria-live="polite" className="mt-8">
            {!answered && (
              <p className="text-sm text-offwhite-dark">
                Answer the questions above to see which films are approved on your glass.
              </p>
            )}

            {result && result.kind === 'unknown' && (
              <div className="rounded-xl border border-mint/30 bg-mint/5 p-6">
                <h3 className="font-display text-lg font-semibold text-offwhite mb-2">
                  {result.headline}
                </h3>
                <p className="text-sm text-offwhite-dark leading-relaxed mb-4">{result.message}</p>
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  Book a free glass check
                </Link>
              </div>
            )}

            {result && result.kind === 'list' && (
              <div className="rounded-xl border border-white/10 bg-charcoal p-6">
                <p className="text-sm text-offwhite-dark mb-1">
                  For <span className="text-offwhite font-medium">{result.glassColumn}</span>,{' '}
                  <span className="text-offwhite font-medium">{result.substrate.toLowerCase()}</span>{' '}
                  glass:
                </p>
                <p className="text-xs text-offwhite-dark mb-5">
                  Every film is listed by its exact name and visible-light number. Films that share a
                  price can still land in different columns.
                </p>

                <ResultGroup title="Safe" rows={result.safe} />
                <ResultGroup title="Use caution" rows={result.caution} />
                <ResultGroup title="Not safe" rows={result.notSafe} />

                {result.restrictions.length > 0 && (
                  <div className="mt-6 border-t border-white/10 pt-4">
                    <h4 className="text-micro text-mint mb-2">Also applies to this glass</h4>
                    <ul className="space-y-1.5">
                      {result.restrictions.map((r) => (
                        <li key={r.text} className="text-xs text-offwhite-dark flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-mint" aria-hidden="true" />
                          <span>
                            {r.text}
                            {r.source === 'ikonic' && (
                              <span className="text-offwhite-dark"> (ikonic in-house rule)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-offwhite-dark mt-5">
                  These results only get more restrictive in person, never less &mdash; final film
                  selection is confirmed at the on-site glass check.
                </p>
              </div>
            )}
          </div>

          {/* Conditions that always route to an on-site check */}
          <div className="mt-8">
            <h3 className="text-micro text-mint mb-2">Always an on-site check, never an online list</h3>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {ON_SITE_ONLY_CONDITIONS.map((c) => (
                <li key={c} className="text-xs text-offwhite-dark flex items-start gap-2">
                  <span aria-hidden="true" className="text-mint mt-0.5">
                    &bull;
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Manufacturer restrictions */}
          <div className="mt-8 rounded-xl border border-white/10 bg-charcoal p-5">
            <h3 className="font-display text-base font-semibold text-offwhite mb-3">
              Manufacturer restrictions
            </h3>
            <ul className="space-y-2">
              {MANUFACTURER_RESTRICTIONS.map((r) => (
                <li key={r.text} className="text-sm text-offwhite-dark flex items-start gap-2.5">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-mint" aria-hidden="true" />
                  <span>
                    {r.text}
                    {r.source === 'ikonic' && (
                      <span className="text-offwhite-dark"> (ikonic in-house rule, not the manufacturer&rsquo;s)</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-offwhite-dark mt-3">
              These can only make a result more restrictive. They never turn a &ldquo;Not
              safe&rdquo; or &ldquo;Use caution&rdquo; into an approval.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-8 text-center">
            Frequently Asked <span className="text-mint">Questions</span>
          </h2>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {FAQS.map((f) => (
              <div key={f.q} className="py-5">
                <h3 className="font-display text-lg font-semibold text-offwhite mb-2">{f.q}</h3>
                <p className="text-offwhite-dark text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — CTA + existing contact form */}
      <section className="py-16 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4">Get a written quote</h2>
          <p className="text-offwhite-dark mb-8 leading-relaxed">
            We identify your glass first, confirm the film is approved on it, then price it. If a
            film isn&rsquo;t safe on your windows, we&rsquo;ll tell you and specify one that is.
          </p>
          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Get a written quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="tel:+17206791230" className="btn-outline inline-flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Call (720) 679-1230
            </a>
          </div>

          <div className="bg-charcoal border border-white/10 rounded-2xl p-6 lg:p-8">
            <h3 className="font-display text-xl font-bold text-offwhite mb-5">Request your estimate</h3>
            <iframe
              src="https://crm.ikonic303.com/widget/form/YoKGheZ0aVCEaSOJQFxY"
              className="w-full h-[1199px] border-0 rounded-[3px] bg-charcoal"
              title="Window film estimate request"
              loading="lazy"
            />
          </div>

          {/* Keep the related links + intent consistent with the other service pages. */}
          <div className="mt-10 flex flex-wrap gap-3">
            {[
              { label: 'Residential Window Tinting', to: '/window-tint' },
              { label: 'Security & Safety Film', to: '/window-tint/security-film' },
              { label: 'Decorative & Frosted Film', to: '/window-tint/decorative-privacy' },
              { label: 'All Services', to: '/services' },
            ].map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="text-sm px-4 py-2 rounded-lg bg-charcoal border border-white/10 text-offwhite-dark hover:border-mint/40 hover:text-mint transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Path is referenced by App.tsx's route and scripts/prerender-routes.mjs.
export { PATH };
