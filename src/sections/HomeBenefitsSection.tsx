import {
  Sun,
  ShieldCheck,
  EyeOff,
  Thermometer,
  Zap,
  Sofa,
  Sparkles,
} from 'lucide-react';

const benefits = [
  {
    icon: Sun,
    title: 'Heat & Glare Reduction',
    body: 'Solar-control film rejects a large share of the heat and knocks down harsh afternoon glare, so west- and south-facing rooms stay usable all day.',
  },
  {
    icon: ShieldCheck,
    title: 'UV Protection',
    body: 'Blocks up to 99% of ultraviolet light — the leading cause of fading — while keeping your view and natural daylight.',
  },
  {
    icon: EyeOff,
    title: 'Increased Privacy',
    body: 'Daytime privacy film and frosted options keep street- and neighbor-facing windows private without living behind closed blinds.',
  },
  {
    icon: Thermometer,
    title: 'Improved Comfort',
    body: 'Fewer hot spots and cold spots means a more even temperature from room to room at the same thermostat setting.',
  },
  {
    icon: Zap,
    title: 'Energy Savings',
    body: 'Less solar heat gain lowers the load on your AC in summer, and low-E films help hold warmth in during Colorado winters.',
  },
  {
    icon: Sofa,
    title: 'Protects Floors, Furniture & Art',
    body: 'Slows the sun damage that fades hardwood, carpet, upholstery, cabinetry, and artwork near the glass.',
  },
  {
    icon: Sparkles,
    title: 'Decorative & Security Options',
    body: 'Frosted, etched, and patterned films for style and privacy — plus tear-resistant safety film that holds broken glass together.',
  },
];

export default function HomeBenefitsSection() {
  return (
    <section id="benefits" className="relative z-20 bg-charcoal/90 backdrop-blur-sm py-20 lg:py-28">
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-micro text-mint mb-4">WHY HOMEOWNERS CHOOSE WINDOW FILM</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
            The Benefits of Home Window Tinting
          </h2>
          <p className="text-offwhite-dark">
            Professionally installed residential window film makes a Denver home more comfortable,
            more private, and cheaper to run — without changing how it looks from the street.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-white/10 bg-charcoal-light/70 p-6 hover:border-mint/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center mb-4">
                <b.icon className="w-6 h-6 text-mint" />
              </div>
              <h3 className="font-display text-lg font-bold text-offwhite mb-2">{b.title}</h3>
              <p className="text-sm text-offwhite-dark leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
