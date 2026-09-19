import { Link } from 'react-router-dom';
import { Sun, ShieldCheck, EyeOff, Palette, Lock, ArrowRight } from 'lucide-react';

const options = [
  {
    icon: Sun,
    name: 'Solar & Heat-Rejection Film',
    body: 'Spectrally-selective film that turns down heat and glare while staying nearly clear — the most popular choice for living rooms, sunrooms, and west-facing glass.',
    to: '/window-tint/solar-heat',
  },
  {
    icon: ShieldCheck,
    name: 'UV & Fade Protection',
    body: 'Near-invisible film focused on stopping up to 99% of UV to protect flooring, furniture, and artwork from fading.',
    to: '/window-tint/uv-protection',
  },
  {
    icon: EyeOff,
    name: 'Privacy Window Film',
    body: 'Daytime one-way and reflective films for street- and neighbor-facing windows — privacy without giving up daylight or the view out.',
    to: '/window-tint/privacy',
  },
  {
    icon: Palette,
    name: 'Decorative & Frosted Film',
    body: 'Frosted, etched-glass, gradient, and patterned films for bathrooms, sidelights, and glass doors — style and privacy in one.',
    to: '/window-tint/decorative-privacy',
  },
  {
    icon: Lock,
    name: 'Security & Safety Film',
    body: 'Thick, tear-resistant film that holds shattered glass in the frame, slowing break-ins and containing storm and accident damage.',
    to: '/window-tint/security-film',
  },
];

export default function FilmOptionsSection() {
  return (
    <section id="film-options" className="relative z-20 py-20 lg:py-28">
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-micro text-mint mb-4">RESIDENTIAL FILM OPTIONS</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
            Choose the Right Film for Each Window
          </h2>
          <p className="text-offwhite-dark">
            Every room has a different problem to solve. We match the film to your glass and your
            goal — and confirm compatibility before you commit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {options.map((o) => (
            <Link
              key={o.name}
              to={o.to}
              className="group rounded-2xl border border-white/10 bg-charcoal-light/70 p-6 flex flex-col hover:border-mint/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-mint/10 flex items-center justify-center mb-4 group-hover:bg-mint/20 transition-colors">
                <o.icon className="w-6 h-6 text-mint" />
              </div>
              <h3 className="font-display text-lg font-bold text-offwhite mb-2">{o.name}</h3>
              <p className="text-sm text-offwhite-dark leading-relaxed flex-1">{o.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-mint text-sm font-medium group-hover:gap-2.5 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
          <Link
            to="/window-tint"
            className="rounded-2xl border border-mint/30 bg-mint/5 p-6 flex flex-col justify-center hover:bg-mint/10 transition-colors"
          >
            <p className="font-display text-lg font-bold text-offwhite mb-2">
              Not sure which you need?
            </p>
            <p className="text-sm text-offwhite-dark mb-4">
              See the full residential window tinting guide, or book a free in-home estimate.
            </p>
            <span className="inline-flex items-center gap-2 text-mint text-sm font-medium">
              Residential window tinting <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
