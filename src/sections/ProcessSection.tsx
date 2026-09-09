const steps = [
  {
    n: '1',
    title: 'Free In-Home Estimate',
    body: 'We visit your home, look at the actual glass and the rooms you want treated, and talk through your goals — heat, glare, privacy, fading, or a decorative look.',
  },
  {
    n: '2',
    title: 'Glass Check & Film Selection',
    body: 'We identify your glass type and match it to the film manufacturer’s compatibility chart, then recommend the right film per window. You get one clear written quote.',
  },
  {
    n: '3',
    title: 'Professional Installation',
    body: 'A clean, dust-controlled install by our own team — most homes are finished in a single visit, with a tidy work area and finished edges on every pane.',
  },
  {
    n: '4',
    title: 'Warranty & Care',
    body: 'Your film is backed by a manufacturer warranty plus our workmanship guarantee. We leave simple care instructions and are a call away if anything needs attention.',
  },
];

export default function ProcessSection() {
  return (
    <section id="process" className="relative z-20 bg-charcoal/90 backdrop-blur-sm py-20 lg:py-28">
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-micro text-mint mb-4">HOW IT WORKS</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-4">
            A Simple, Four-Step Installation
          </h2>
          <p className="text-offwhite-dark">
            Clear communication, an honest quote, and a clean install — that&rsquo;s the whole
            process.
          </p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-white/10 bg-charcoal-light/70 p-6 pt-8"
            >
              <span className="absolute -top-4 left-6 w-9 h-9 rounded-full bg-mint text-charcoal font-display font-bold flex items-center justify-center">
                {s.n}
              </span>
              <h3 className="font-display text-lg font-bold text-offwhite mb-2">{s.title}</h3>
              <p className="text-sm text-offwhite-dark leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
