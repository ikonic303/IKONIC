import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sun, Home } from 'lucide-react';

// Residential-first hero. Static — no GSAP / scroll-pin (kept fast to paint).
export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative z-10 flex items-center min-h-[92svh] bg-charcoal/80 backdrop-blur-sm py-24 lg:py-16"
    >
      <div className="relative z-20 w-full px-[6vw] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        {/* Left — copy */}
        <div className="min-w-0 max-w-2xl">
          <p className="text-micro text-mint mb-4">RESIDENTIAL WINDOW TINTING · DENVER, CO</p>

          <h1 className="font-display font-bold text-offwhite leading-[1.08] text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-6xl mb-5 text-balance">
            Professional Residential Window Tinting in{' '}
            <span className="text-mint">Denver</span>
          </h1>

          <p className="text-lg md:text-xl text-offwhite-dark leading-relaxed mb-8 max-w-xl">
            Improve your home&rsquo;s comfort, privacy, and energy efficiency with professionally
            installed window film.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link to="/contact" className="btn-primary flex items-center gap-2">
              Get a Free Home Tint Estimate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#commercial" className="btn-outline">
              Explore Commercial Solutions
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-offwhite-dark">
            <li className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-mint" /> Heat &amp; glare control
            </li>
            <li className="flex items-center gap-2">
              <Home className="w-4 h-4 text-mint" /> 99% UV protection
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-mint" /> Lifetime film warranty
            </li>
          </ul>
        </div>

        {/* Right — home window with solar film illustration */}
        <div className="hidden lg:flex min-w-0 justify-center items-center">
          <div className="relative w-full max-w-[22rem] xl:max-w-[26rem] aspect-square">
            <div className="absolute inset-8 bg-mint/12 blur-3xl rounded-full" />
            <svg
              viewBox="0 0 400 400"
              className="relative w-full h-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              role="img"
              aria-label="Living-room window with solar control film reducing afternoon sun"
            >
              <defs>
                <linearGradient id="roomWarm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff3dd" stopOpacity="0.20" />
                  <stop offset="1" stopColor="#fff3dd" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="filmTint" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#00FF9D" stopOpacity="0.18" />
                  <stop offset="0.55" stopColor="#0b6e4c" stopOpacity="0.36" />
                  <stop offset="1" stopColor="#0A1428" stopOpacity="0.66" />
                </linearGradient>
                <radialGradient id="afternoonSun" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.45" stopColor="#ffedcf" />
                  <stop offset="1" stopColor="#ffedcf" stopOpacity="0" />
                </radialGradient>
                <clipPath id="lower">
                  <polygon points="0,170 400,80 400,400 0,400" />
                </clipPath>
              </defs>

              {/* low afternoon sun outside the glass */}
              <circle cx="96" cy="86" r="72" fill="url(#afternoonSun)" opacity="0.9" />

              {/* window frame */}
              <rect x="52" y="40" width="296" height="320" rx="16" fill="#0A1428"
                stroke="#00FF9D" strokeOpacity="0.5" strokeWidth="3" />
              <rect x="66" y="54" width="268" height="292" rx="10" fill="#122038"
                stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" />

              {/* two tall sashes */}
              {[0, 1].map((col) => {
                const x = 78 + col * 132;
                return (
                  <g key={col}>
                    <rect x={x} y="66" width="122" height="268" rx="4" fill="url(#roomWarm)" />
                    <rect x={x} y="66" width="122" height="268" rx="4" fill="url(#filmTint)"
                      clipPath="url(#lower)" />
                    <rect x={x} y="66" width="122" height="268" rx="4" fill="none"
                      stroke="#00FF9D" strokeOpacity="0.24" strokeWidth="1.5" />
                    <line x1={x} y1="200" x2={x + 122} y2="200" stroke="#0A1428" strokeOpacity="0.35" strokeWidth="6" />
                  </g>
                );
              })}

              {/* interior sill + a plant, hinting "home" */}
              <rect x="52" y="356" width="296" height="14" rx="4" fill="#1C3055" />
              <path d="M196 356c0-16 6-26 14-30-2 12 0 22 6 30z" fill="#00FF9D" opacity="0.5" />
              <path d="M204 356c0-14 8-22 18-24-4 10-4 18 0 24z" fill="#00D484" opacity="0.5" />

              {/* the film line where solar tint begins */}
              <line x1="66" y1="170" x2="334" y2="80" stroke="#00FF9D" strokeOpacity="0.85" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
