import { useState, useMemo } from 'react';
import { PhoneCall, TrendingDown } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

function fmt(amount: number): string {
  if (amount >= 1_000_000) return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  if (amount >= 10_000)    return '$' + (amount / 1_000).toFixed(0) + 'K';
  if (amount >= 1_000)     return '$' + (amount / 1_000).toFixed(1) + 'K';
  return '$' + Math.round(amount).toLocaleString();
}

export default function LostCallCalculator() {
  const [missedCalls, setMissedCalls] = useState('');
  const [avgTicket,   setAvgTicket]   = useState('');
  const [closeRate,   setCloseRate]   = useState('');

  const calc = useMemo(() => {
    const mc = parseFloat(missedCalls) || 0;
    const at = parseFloat(avgTicket)   || 0;
    const cr = (parseFloat(closeRate)  || 0) / 100;
    const weekly  = mc * at * cr;
    const monthly = weekly * 4.33;
    const annual  = weekly * 52;
    return { weekly, monthly, annual };
  }, [missedCalls, avgTicket, closeRate]);

  const hasValues = calc.annual > 0;

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Missed Call Revenue Calculator | How Much Are Lost Calls Costing You? | ikonic303"
        description="Find out how much revenue your business loses from missed calls. Use our free calculator and see how missed call text-back automation can recover that revenue instantly."
        canonical="/lost-call-calculator"
      />
      <MatrixBackground />
      <Navigation />

      <main className="relative z-10 pt-28 pb-20 px-[6vw]">
        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-micro text-mint mb-4">REVENUE RECOVERY TOOL</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-4">
            Lost Call <span className="text-mint">Calculator</span>
          </h1>
          <p className="text-offwhite-dark text-lg">
            See exactly how much money unanswered calls are costing your business every week, month, and year.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-charcoal-light border border-white/10 rounded-2xl p-8 shadow-2xl">

            {/* Inputs */}
            <div className="flex flex-col gap-6 mb-8">

              {/* Missed Calls */}
              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">
                  Missed Calls Per Week
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  value={missedCalls}
                  onChange={e => setMissedCalls(e.target.value)}
                  className="w-full bg-charcoal border border-white/10 rounded-xl px-4 py-4 text-xl font-bold text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                />
              </div>

              {/* Avg Ticket */}
              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">
                  Average Job Value
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-offwhite-dark/60 pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500"
                    value={avgTicket}
                    onChange={e => setAvgTicket(e.target.value)}
                    className="w-full bg-charcoal border border-white/10 rounded-xl pl-8 pr-4 py-4 text-xl font-bold text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                  />
                </div>
              </div>

              {/* Close Rate */}
              <div>
                <label className="block text-xs font-semibold text-offwhite-dark uppercase tracking-widest mb-2">
                  Close Rate on Answered Calls
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g. 30"
                    value={closeRate}
                    onChange={e => setCloseRate(e.target.value)}
                    className="w-full bg-charcoal border border-white/10 rounded-xl px-4 pr-10 py-4 text-xl font-bold text-offwhite placeholder-offwhite-dark/40 focus:outline-none focus:border-mint transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-offwhite-dark/60 pointer-events-none">%</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/10 mb-8" />

            {/* Results */}
            <div className="bg-charcoal rounded-xl border border-white/10 p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-widest">You're Losing</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-wider mb-2">Weekly</p>
                  <p className={`text-2xl font-bold transition-colors ${hasValues ? 'text-red-400' : 'text-offwhite-dark/40'}`}>
                    {fmt(calc.weekly)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-wider mb-2">Monthly</p>
                  <p className={`text-2xl font-bold transition-colors ${hasValues ? 'text-red-400' : 'text-offwhite-dark/40'}`}>
                    {fmt(calc.monthly)}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 text-center">
                <p className="text-xs font-semibold text-offwhite-dark uppercase tracking-wider mb-2">Annual Loss</p>
                <p className={`text-5xl font-display font-bold transition-colors ${hasValues ? 'text-red-400' : 'text-offwhite-dark/40'}`}>
                  {fmt(calc.annual)}
                </p>
                {hasValues && (
                  <p className="text-offwhite-dark text-sm mt-2">walking out the door every year</p>
                )}
              </div>
            </div>

            {/* CTA */}
            <a
              href="tel:7206791230"
              className="flex items-center justify-center gap-3 w-full bg-mint hover:bg-mint-dark text-charcoal font-bold text-lg py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-mint/30"
            >
              <PhoneCall className="w-5 h-5" />
              <div className="text-left">
                <div>Stop Losing Money — Call Now</div>
                <div className="text-sm font-medium opacity-80">720.679.1230</div>
              </div>
            </a>

            <p className="text-center text-xs text-offwhite-dark/50 mt-4">
              Powered by{' '}
              <a href="https://ikonicmarketing303.com" className="text-mint hover:underline">
                ikonic 303
              </a>
            </p>
          </div>

          {/* Info box */}
          {hasValues && (
            <div className="mt-6 bg-gradient-to-r from-mint/10 to-transparent border border-mint/20 rounded-xl p-5">
              <p className="text-offwhite font-semibold mb-1">What could you do with {fmt(calc.annual)} back?</p>
              <p className="text-offwhite-dark text-sm">
                Ikonic's missed call text-back system responds to every lead in under 60 seconds — 24/7, even when you're on the job.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
