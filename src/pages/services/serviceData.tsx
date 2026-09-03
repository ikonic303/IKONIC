import type { ServiceData } from './ServicePage';

/**
 * Service-page content. Residential-first (2026-09-04). All are React Router
 * routes (App.tsx) with prerender shells (scripts/prerender-routes.mjs):
 *   /window-tint                      → Residential Window Tinting  (PRIMARY / hub)
 *   /window-tint/solar-heat           → Solar & Heat-Rejection Film
 *   /window-tint/uv-protection        → UV & Fade Protection Film
 *   /window-tint/privacy              → Privacy Window Film
 *   /window-tint/decorative-privacy   → Frosted & Decorative Film
 *   /window-tint/security-film        → Security & Safety Film
 *   /window-tint/office               → Commercial Storefront Window Tint  (secondary)
 *   /window-tint/storefront           → Storefront Window Tinting  (secondary)
 *   /storefront-graphics              → Commercial Storefront Film & Window Graphics  (secondary)
 *
 * /window-tint/home 301s to /window-tint; /signage and /wayfinding 301 to
 * /storefront-graphics (vercel.json). The 3 window-tint/* static HTML pages were
 * archived to archived-pages/legacy-static/window-tint/. Keep leads/FAQ here
 * roughly in sync with prerender-routes.mjs.
 */

const residential: ServiceData = {
  path: '/window-tint',
  seoTitle: 'Residential Window Tinting Denver | Home Window Film | ikonic303',
  seoDescription:
    'Professional residential window tinting in Denver — heat and glare reduction, 99% UV protection, privacy window film, energy-efficient window tint, and fade protection for floors and furniture. Free in-home estimate.',
  schemaServiceType: 'Residential Window Tinting',
  schemaName: 'Residential Window Tinting & Home Window Film',
  schemaDescription:
    'Professional residential window tinting and home window film in the Denver metro — solar heat and glare control, up to 99% UV protection, privacy film, decorative and security film, and energy-efficient low-E film. Glass checked for compatibility; most homes installed in a single visit.',
  eyebrow: 'RESIDENTIAL WINDOW TINTING · DENVER',
  h1: (
    <>
      Professional Residential Window Tinting in{' '}
      <span className="text-mint">Denver</span>
    </>
  ),
  lead: "Home window film makes a Denver house more comfortable, more private, and cheaper to run — without changing how it looks from the street. ikonic installs solar, UV, privacy, decorative, and security film for homeowners across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver. We check your glass, recommend the right film per window, and finish most homes in a single visit.",
  sections: [
    {
      heading: 'What home window tinting does for your house',
      body: (
        <>
          <p>
            <strong>Heat &amp; glare reduction.</strong> Solar-control film rejects much of the
            heat and cuts harsh afternoon glare, so west- and south-facing rooms stay usable all
            day and screens stay readable.
          </p>
          <p>
            <strong>UV protection.</strong> Quality film blocks up to 99% of ultraviolet light —
            the leading cause of fading in hardwood, carpet, upholstery, cabinetry, and artwork
            near the glass.
          </p>
          <p>
            <strong>Privacy.</strong> Daytime privacy and reflective films keep street- and
            neighbor-facing windows private without living behind closed blinds.
          </p>
          <p>
            <strong>Comfort &amp; energy savings.</strong> Fewer hot and cold spots means a more
            even temperature room to room, a lighter load on your AC in summer, and — with low-E
            film — better warmth retention through Colorado winters.
          </p>
          <p>
            <strong>Decorative &amp; security options.</strong> Frosted, etched, and patterned
            films for style and privacy, plus tear-resistant safety film that holds broken glass
            together and slows forced entry.
          </p>
        </>
      ),
    },
    {
      heading: 'Residential film options',
      body: (
        <>
          <p>We recommend a film per window rather than one film for the whole house:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <a href="/window-tint/solar-heat" className="text-mint hover:underline">
                Solar &amp; heat-rejection film
              </a>{' '}
              — for living rooms, sunrooms, and west- and south-facing glass
            </li>
            <li>
              <a href="/window-tint/uv-protection" className="text-mint hover:underline">
                UV &amp; fade protection film
              </a>{' '}
              — near-invisible, focused on stopping fading of floors, furniture, and art
            </li>
            <li>
              <a href="/window-tint/privacy" className="text-mint hover:underline">
                Privacy window film
              </a>{' '}
              — daytime privacy for bedrooms, bathrooms, and street-facing windows
            </li>
            <li>
              <a href="/window-tint/decorative-privacy" className="text-mint hover:underline">
                Decorative &amp; frosted film
              </a>{' '}
              — frosted, etched, patterned, and branded looks for sidelights and glass doors
            </li>
            <li>
              <a href="/window-tint/security-film" className="text-mint hover:underline">
                Security &amp; safety film
              </a>{' '}
              — tear-resistant film for ground-floor windows and patio doors
            </li>
          </ul>
        </>
      ),
    },
    {
      heading: 'We check your glass before we quote',
      body: (
        <p>
          Single-pane, dual-pane, low-E, tempered, and laminated glass each handle absorbed heat
          differently. The wrong film on the wrong glass can cause thermal-stress cracks or void a
          window&rsquo;s seal warranty — so every quote starts with us identifying your glass and
          matching it to the film manufacturer&rsquo;s compatibility chart. If a window
          isn&rsquo;t a safe candidate, we tell you before you commit.
        </p>
      ),
    },
    {
      heading: 'How the installation works',
      body: (
        <p>
          <strong>1. Free in-home estimate.</strong> We visit, look at the actual glass and rooms,
          and talk through your goals. <strong>2. Glass check &amp; film selection.</strong> One
          clear written quote, with the right film spec&rsquo;d per window.{' '}
          <strong>3. Professional installation.</strong> A clean, dust-controlled install — most
          homes finished in a single visit, with floors and furniture protected.{' '}
          <strong>4. Warranty &amp; care.</strong> Manufacturer film warranty plus our workmanship
          guarantee, and simple care instructions.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Will home window film make my rooms dark?',
      a: "Not unless you want it to. Solar and UV films are built to cut heat, glare, and fading while staying close to clear; a darker or frosted look for a specific room is a separate choice.",
    },
    {
      q: 'Can window film protect my hardwood floors and furniture from fading?',
      a: 'Yes — UV is the biggest driver of fading, and quality film blocks up to 99% of it without changing how a room looks.',
    },
    {
      q: 'Does residential window tint really save energy?',
      a: 'It reduces solar heat gain, which lowers the load on your AC in summer, and low-E options help hold heat in during winter. Savings depend on your windows, orientation, and how much glass you have.',
    },
    {
      q: 'How long does a home installation take?',
      a: 'Most homes are done in a single visit. Larger houses or specialty films can take a second day — we confirm the timeline with your written quote.',
    },
    {
      q: 'Do you offer daytime privacy without making the house look mirrored?',
      a: 'Yes. There are lightly reflective and neutral privacy films that give strong daytime privacy with a subtle exterior look. At night, interior lights reduce privacy for any film — we cover that at the estimate.',
    },
    {
      q: 'Is there a warranty?',
      a: 'Yes — a manufacturer warranty on the film (often lifetime for residential) plus our workmanship guarantee on the installation.',
    },
  ],
  related: [
    { label: 'Solar & Heat-Rejection Film', to: '/window-tint/solar-heat' },
    { label: 'UV & Fade Protection Film', to: '/window-tint/uv-protection' },
    { label: 'Privacy Window Film', to: '/window-tint/privacy' },
    { label: 'Decorative & Frosted Film', to: '/window-tint/decorative-privacy' },
    { label: 'Security & Safety Film', to: '/window-tint/security-film' },
    { label: 'Commercial Storefront Window Tint', to: '/window-tint/office' },
  ],
  ctaTitle: 'Get a free in-home estimate',
  ctaBody:
    "Tell us which rooms and windows you want treated and what you're trying to fix. We check the glass, recommend a film per window, and send one clear written quote — usually within a business day.",
};

const commercialTint: ServiceData = {
  path: '/window-tint/office',
  seoTitle: 'Commercial Storefront Window Tint Denver | ikonic303',
  seoDescription:
    'Commercial storefront window tint in Denver — solar heat and glare control, energy savings, privacy and decorative film, and security film for retail, offices, and multi-tenant buildings. Scheduled around your hours.',
  schemaServiceType: 'Commercial Window Tinting',
  schemaName: 'Commercial Storefront Window Tint',
  schemaDescription:
    'Commercial storefront and office window film in the Denver metro — solar heat and glare control, energy savings, privacy and decorative film, and security film for retail, offices, clinics, and multi-tenant buildings. Scoped room by room and installed around business hours.',
  eyebrow: 'COMMERCIAL · SECONDARY SERVICE',
  h1: (
    <>
      Commercial Storefront Window Tint in{' '}
      <span className="text-mint">Denver</span>
    </>
  ),
  lead: 'Alongside our residential work, ikonic tints commercial storefronts and offices across Denver — cutting solar heat and glare, lowering cooling costs, and adding privacy or security where it&rsquo;s needed. Same crew and same clean install as our home jobs, scheduled around your business hours.',
  sections: [
    {
      heading: 'Storefront & office window tint',
      body: (
        <p>
          Solar-control film on retail and office glass cuts the afternoon heat that runs the HVAC
          hard and the glare that makes workstations and merchandise displays unusable at certain
          times of day. Most jobs are scoped window by window or room by room, so you can treat
          the problem glass first and roll out the rest as budget allows.
        </p>
      ),
    },
    {
      heading: 'Privacy, decorative & security film',
      body: (
        <p>
          Frosted and etched privacy film for conference rooms, clinics, and street-facing glass —
          privacy that looks intentional with daylight still coming through. Tear-resistant
          security film holds broken glass in the frame to slow smash-and-grab entry and contain
          storm damage. Anti-graffiti film is a clear sacrificial layer for ground-floor glass.
        </p>
      ),
    },
    {
      heading: 'We check your glass and work around your hours',
      body: (
        <p>
          Commercial glass varies — coated, low-E, tempered, laminated, single or dual-pane — and
          the wrong film can cause thermal stress or void a warranty, so we identify the glass and
          confirm the film against the manufacturer&rsquo;s chart before quoting. Installation is
          scheduled before or after hours so you never have to close.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Will storefront tint help with our cooling bill?',
      a: 'It reduces the solar heat load coming through the glass, which reduces what the HVAC has to fight — especially on west- and south-facing storefronts in the afternoon.',
    },
    {
      q: 'Can you tint just the problem windows, not the whole building?',
      a: 'Yes. Most commercial jobs are scoped window by window or room by room, so you can start with the worst glass and add the rest later.',
    },
    {
      q: 'Do you install outside business hours?',
      a: 'Yes — commercial installs are scheduled before opening or after closing so your business never has to shut down.',
    },
    {
      q: 'Do you also do window graphics and business branding?',
      a: 'Yes — see our commercial storefront film & window graphics page for custom window graphics, hours and logo vinyl, and promotional graphics.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Storefront Film & Window Graphics', to: '/storefront-graphics' },
    { label: 'Security & Safety Film', to: '/window-tint/security-film' },
    { label: 'Storefront Window Tint', to: '/window-tint/storefront' },
  ],
  ctaTitle: 'Scope your storefront glass',
  ctaBody:
    "Tell us the building, which windows, and whether it's heat, glare, privacy, or security. We scope the actual glass involved and send one written quote.",
};

const storefrontGraphics: ServiceData = {
  path: '/storefront-graphics',
  seoTitle: 'Commercial Storefront Film & Window Graphics Denver | ikonic303',
  seoDescription:
    'Commercial storefront window graphics, privacy and decorative film, security film, and business branding & promotional graphics — designed, printed, and installed on-site across the Denver metro.',
  schemaServiceType: 'Storefront Film and Window Graphics',
  schemaName: 'Commercial Storefront Film & Window Graphics',
  schemaDescription:
    'Design, print, and on-site installation of storefront window graphics, privacy and decorative window film, security film, custom window graphics, and business branding and promotional graphics for businesses across the Denver metro.',
  eyebrow: 'COMMERCIAL · SECONDARY SERVICE',
  h1: (
    <>
      Storefront Film &amp; Window Graphics That{' '}
      <span className="text-mint">Work for Your Brand</span>
    </>
  ),
  lead: "A supporting service to our residential window tinting: ikonic brands and protects commercial storefronts across Denver with custom window graphics, privacy and decorative film, security film, and promotional graphics — designed in-house and installed on-site.",
  sections: [
    {
      heading: 'Custom window graphics & business branding',
      body: (
        <p>
          Hours, logo, service lists, and full-window art. Perforated film reads as a solid
          graphic from the sidewalk while you still see out from inside. We design from your brand,
          proof it with you, and install it clean — the glass becomes your highest-traffic
          marketing surface.
        </p>
      ),
    },
    {
      heading: 'Privacy & decorative film',
      body: (
        <p>
          Frosted, etched-glass, and patterned films for conference rooms, clinics, and
          street-facing glass — privacy that looks designed, with daylight still passing through.
        </p>
      ),
    },
    {
      heading: 'Security film',
      body: (
        <p>
          Thick, tear-resistant film bonded to the glass holds a broken pane in its frame, slowing
          smash-and-grab entry and containing storm and accident damage on ground-floor storefront
          glass.
        </p>
      ),
    },
    {
      heading: 'Promotional graphics',
      body: (
        <p>
          Grand-opening takeovers, seasonal offers, and event graphics in removable vinyl — up for
          the promotion, off cleanly when it&rsquo;s over. We handle removal and replacement when
          the message changes.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'How long do storefront window graphics last?',
      a: 'Quality exterior vinyl typically serves for years; lifespan depends on sun exposure and material. We spec the right film for how long you need it, from a short promo to a long-term brand install.',
    },
    {
      q: 'Will graphics block the view out or the light?',
      a: 'Only where you want them to. Perforated films read as solid graphics from outside while you see out from inside; frosted films pass light while blocking the view.',
    },
    {
      q: 'Can you match our brand colors?',
      a: 'Yes — we print from your brand files and proof against them, and you approve the artwork before anything prints.',
    },
    {
      q: 'Do you also tint the storefront glass for heat and glare?',
      a: 'Yes — see our commercial storefront window tint page. Many businesses do film and graphics in one visit.',
    },
  ],
  related: [
    { label: 'Commercial Storefront Window Tint', to: '/window-tint/office' },
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Decorative & Privacy Film', to: '/window-tint/decorative-privacy' },
  ],
  ctaTitle: 'Walk us around your storefront',
  ctaBody:
    'Book a free walkthrough. We measure the glass, talk goals, and come back with a design proof and one written quote.',
};

const decorativePrivacy: ServiceData = {
  path: '/window-tint/decorative-privacy',
  seoTitle: 'Frosted & Decorative Window Film Denver | Privacy Film | ikonic303',
  seoDescription:
    'Frosted, etched, and decorative window film for Denver homes and businesses — daytime privacy for bathrooms, sidelights, and street-facing glass, plus branded and patterned looks, without blinds.',
  schemaServiceType: 'Decorative and Privacy Window Film',
  schemaName: 'Frosted & Decorative Window Film',
  schemaDescription:
    'Frosted, etched-glass, gradient, and patterned window film for residential and commercial glass in the Denver metro — daytime privacy for bathrooms, sidelights, and street-facing windows, plus custom cut patterns, bands, and logos.',
  eyebrow: 'RESIDENTIAL FILM OPTION · ALSO COMMERCIAL',
  h1: (
    <>
      Frosted &amp; Decorative <span className="text-mint">Window Film</span>
    </>
  ),
  lead: "A bathroom window that faces the neighbor's yard. A front-door sidelight you'd rather no one saw through. A conference room with a glass wall and no privacy. Frosted and decorative film solves all of them the same way — it changes what a window shows without closing it off, and it reads as an intentional design choice, not an obstruction.",
  sections: [
    {
      heading: 'Privacy without blinds or curtains',
      body: (
        <p>
          Frosted film passes daylight through while blocking a clear line of sight — a bathroom
          stays bright without anyone seeing in, a street-facing room keeps its privacy without
          living behind closed blinds, and a home office or conference room can go opaque for a
          meeting without permanent construction.
        </p>
      ),
    },
    {
      heading: 'Decorative & branded options',
      body: (
        <p>
          Decorative film isn't just a solid frost across the whole pane. It can be cut into a
          band, a pattern, a gradient, a logo, or an etched-glass-style design — for glass doors,
          sidelights, feature walls, and storefronts that want branding on the glass itself. Because
          it's a film, not sandblasted glass, it costs far less and is fully reversible if the look
          changes later.
        </p>
      ),
    },
    {
      heading: 'Choosing a pattern or finish',
      body: (
        <p>
          A bathroom or exam room usually wants full, even coverage; a glass door or storefront
          often wants a band across the middle or a logo cut into an otherwise clear pane, so the
          space still feels open while the sightline that matters gets blocked. Subtle gradients,
          dot and line patterns, rice-paper textures, and fully custom shapes are all options once
          the goal is clear.
        </p>
      ),
    },
    {
      heading: 'How it works',
      body: (
        <p>
          <strong>1.</strong> Tell us the goal — privacy, decoration, or branding — and which
          windows. <strong>2.</strong> Get a design and written quote before anything is cut.
          <strong> 3.</strong> Installation by appointment, usually finished in a single visit.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Does frosted film block all the light?',
      a: 'No — frosted film passes light through while blocking a clear view, so the room stays bright. Blackout is a separate product.',
    },
    {
      q: 'Can you cut it into our logo or a pattern?',
      a: 'Yes — decorative film can be cut into bands, patterns, gradients, lettering, or a custom logo shape. You approve the design before anything is cut.',
    },
    {
      q: 'Is it permanent?',
      a: "No — it's a film, not etched glass, so it can be removed and replaced cleanly if your needs or branding change.",
    },
    {
      q: 'Does it give privacy at night too?',
      a: 'Full frost gives privacy day and night. Lighter decorative patterns block the specific sightline they cover; with interior lights on at night, a patterned pane is less private than a fully frosted one.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Security & Safety Film', to: '/window-tint/security-film' },
    { label: 'Storefront Film & Window Graphics', to: '/storefront-graphics' },
  ],
  ctaTitle: 'Get a design and a quote',
  ctaBody:
    'Tell us which windows and the goal — privacy, decoration, or branding. We send a design and one written quote before anything is cut.',
};

const securityFilm: ServiceData = {
  path: '/window-tint/security-film',
  seoTitle: 'Security & Safety Window Film Denver | ikonic303',
  seoDescription:
    'Security and safety window film for Denver homes and businesses — tear-resistant film that holds shattered glass in the frame, slowing forced entry and containing storm and accident damage.',
  schemaServiceType: 'Security and Safety Window Film',
  schemaName: 'Security & Safety Window Film',
  schemaDescription:
    'Thick, tear-resistant safety and security window film for residential and commercial glass in the Denver metro — holds broken glass in the frame after an impact to slow forced entry and contain storm, accident, and smash-and-grab damage.',
  eyebrow: 'RESIDENTIAL FILM OPTION · ALSO COMMERCIAL',
  h1: (
    <>
      Security &amp; Safety <span className="text-mint">Window Film</span>
    </>
  ),
  lead: "A break-in through glass takes seconds. Security film doesn't make a pane unbreakable, but it changes what happens next: instead of the glass shattering and falling away, the film holds it together in the frame — buying time, slowing the attempt, and often ending it before anything is taken. On a home, it does the same for patio doors, ground-floor windows, and storm damage.",
  sections: [
    {
      heading: 'What security film actually does',
      body: (
        <p>
          Security film is a thicker, purpose-built film bonded to the interior side of a pane. It
          won't stop someone swinging something at the glass — nothing short of specialty glazing
          does — but it changes the failure mode: the pane stays intact in the frame instead of
          collapsing inward. For a break-in, that removes the fast, easy entry a smashed window
          normally provides. For accidental breakage — a ball, a cart, a fallen branch — it keeps
          the glass contained instead of scattering across a floor or patio.
        </p>
      ),
    },
    {
      heading: 'Where it matters most',
      body: (
        <p>
          At home: ground-floor windows, patio and sliding-glass doors, and door sidelights next
          to a lock. For businesses: street-level storefront glass, entry doors, and any large
          ground-floor pane that's a soft target simply because it's glass at street level.
          Security film is usually applied clear, so it doesn't change how the glass looks — and it
          can be layered with a solar or decorative film on the same pane.
        </p>
      ),
    },
    {
      heading: 'We check your glass before we quote',
      body: (
        <p>
          Pane size, thickness, and existing glass condition all affect what's safe to install. We
          identify the glass and confirm the right product for your specific panes before quoting,
          the same way we do for any film.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Does security film stop a break-in?',
      a: "It doesn't make glass unbreakable, but it holds shattered glass together in the frame instead of falling away, which slows a smash-and-grab significantly and often ends the attempt.",
    },
    {
      q: 'Is it the same as tinted or frosted film?',
      a: "No — it's a thicker film built for impact performance. It can be clear, or combined with a solar or decorative film on the same pane.",
    },
    {
      q: 'Can I add it to windows that already have film?',
      a: 'Often yes — existing solar or decorative film can usually keep a security layer added to the same panes without redoing the earlier work. We confirm at the estimate.',
    },
    {
      q: 'Does it help with severe weather?',
      a: 'Yes — by holding a broken pane in the frame it helps contain glass and slow water and debris entry after an impact.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Decorative & Privacy Film', to: '/window-tint/decorative-privacy' },
    { label: 'Commercial Storefront Window Tint', to: '/window-tint/office' },
  ],
  ctaTitle: 'Get a quote on safety & security film',
  ctaBody:
    'Tell us which glass you want protected — patio doors, ground-floor windows, or storefront panes. We check the glass and send one written quote.',
};

const storefrontTint: ServiceData = {
  path: '/window-tint/storefront',
  seoTitle: 'Storefront Window Tinting Denver | ikonic303',
  seoDescription:
    'Storefront window tinting in Denver — solar film that cuts heat, glare, and merchandise fade on retail glass while keeping the view from the sidewalk clear. Scheduled around your hours.',
  schemaServiceType: 'Storefront Window Tinting',
  schemaName: 'Storefront Window Tinting',
  schemaDescription:
    'Solar-control window film for retail storefront glass in the Denver metro — heat and glare reduction, UV and merchandise-fade protection, and comfort near the windows, with the storefront view kept clear. Installed around business hours.',
  eyebrow: 'COMMERCIAL · SECONDARY SERVICE',
  h1: (
    <>
      Storefront <span className="text-mint">Window Tinting</span>
    </>
  ),
  lead: "A display window fades a shade lighter every summer. Customers near the glass on a July afternoon don't linger. The register area bakes in direct sun. None of that requires losing the view that makes a storefront a storefront — solar film fixes it while the glass stays clear.",
  sections: [
    {
      heading: 'What storefront film protects',
      body: (
        <p>
          Retail glass takes full sun for most of the day, with merchandise and displays sitting
          right against it and customers who need to feel comfortable near the windows. Solar film
          cuts the heat and UV that cause fade and window-side discomfort while keeping visibility
          from the sidewalk intact.
        </p>
      ),
    },
    {
      heading: 'We check your glass before we quote',
      body: (
        <p>
          Storefront glass is often larger and older than residential glass, and large single
          panes carry their own thermal-stress risk. We identify the glass and confirm the film
          against the manufacturer's compatibility chart before quoting — if a pane's size or
          shading changes the safe options, we tell you first.
        </p>
      ),
    },
    {
      heading: 'Pairs with storefront graphics',
      body: (
        <p>
          Many storefronts combine solar film with window graphics in one visit — hours and logo
          on the door, an offer on one pane, solar film across the rest. See{' '}
          <a href="/storefront-graphics" className="text-mint hover:underline">
            storefront film &amp; window graphics
          </a>
          . Installation is scheduled around your hours.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Will tinting our storefront glass hide us from the street?',
      a: 'No — storefront solar films protect from heat and UV while staying close to clear from both sides. Darker or frosted looks are a separate, deliberate choice for a specific section.',
    },
    {
      q: 'Can film protect our window displays from fading?',
      a: 'Yes — UV and heat are the main drivers of merchandise and display fade, and quality solar film blocks the majority of both.',
    },
    {
      q: 'Do you install during business hours?',
      a: 'We schedule around your hours — before opening or after closing — so the storefront isn’t disrupted.',
    },
  ],
  related: [
    { label: 'Commercial Storefront Window Tint', to: '/window-tint/office' },
    { label: 'Storefront Film & Window Graphics', to: '/storefront-graphics' },
    { label: 'Residential Window Tinting', to: '/window-tint' },
  ],
  ctaTitle: 'Scope your storefront glass',
  ctaBody:
    "Tell us roughly how much glass and what's bothering customers or staff. We send a written quote within a business day.",
};

const solarHeat: ServiceData = {
  path: '/window-tint/solar-heat',
  seoTitle: 'Heat-Rejection Window Film Denver | Solar Window Tint for Homes | ikonic303',
  seoDescription:
    'Solar and heat-rejection window film for Denver homes — cuts a large share of solar heat and afternoon glare on west- and south-facing glass while staying nearly clear. Lower AC load, comfortable rooms. Free in-home estimate.',
  schemaServiceType: 'Solar Heat-Rejection Window Film',
  schemaName: 'Solar & Heat-Rejection Window Film',
  schemaDescription:
    'Spectrally-selective solar control window film for residential glass in the Denver metro — high total solar energy rejection and glare control with high visible-light transmission, reducing summer cooling load and making west- and south-facing rooms usable all day.',
  eyebrow: 'RESIDENTIAL WINDOW FILM',
  h1: (
    <>
      Solar &amp; Heat-Rejection <span className="text-mint">Window Film</span>
    </>
  ),
  lead: "The living room that's 8–10 degrees hotter than the rest of the house by 3pm. The kitchen where you can't see the TV or a laptop screen in the afternoon. The office chair you moved because the sun cooks it. Solar heat-rejection film fixes all of it by stopping the heat and glare at the glass — and modern film does it while staying close to clear, so you keep the view and the daylight.",
  sections: [
    {
      heading: 'How much heat it actually stops',
      body: (
        <p>
          Ordinary glass lets most of the sun's energy straight through. A good spectrally-selective
          film rejects a large share of that total solar energy (heat you feel) while still passing
          most of the visible light (daylight you want). The result on a west- or south-facing
          window is a room that stops spiking in temperature every afternoon, less strain on the
          AC, and fewer hot-and-cold spots between rooms. We'll give you the specific
          heat-rejection and light numbers for the film we recommend at the estimate.
        </p>
      ),
    },
    {
      heading: 'It won’t make your rooms dark',
      body: (
        <p>
          This is the most common worry and it's outdated. Older "limo" tint traded daylight for
          heat control. Spectrally-selective film is engineered to separate the two — you can cut a
          large amount of heat and still have a bright room with a clear view out. If you also want
          a darker or more private look for a specific window, that's a separate choice, not a
          requirement.
        </p>
      ),
    },
    {
      heading: 'Where it earns its keep in a Denver home',
      body: (
        <p>
          West- and south-facing living rooms, sunrooms and enclosed porches, upstairs bedrooms
          that bake in the afternoon, home offices with screen glare, and any wall of glass or
          large picture window. Colorado's high-altitude sun is intense — film that would be
          "nice to have" at sea level makes a real daily difference here.
        </p>
      ),
    },
    {
      heading: 'Interior film, or exterior for tough cases',
      body: (
        <p>
          Most homes get interior film — installed from inside, protected from weather, easy to
          maintain. For glass that can't take an interior film safely (some coated or
          heat-treated units) or for the highest heat rejection on a brutal west elevation, an
          exterior film is an option. We identify which is right for your specific glass before
          quoting.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'How much cooler will the room actually be?',
      a: 'It varies with the window, orientation, and how much glass the room has, but homeowners typically notice the afternoon temperature spike flatten out and the room become usable at times it wasn’t before. It reduces heat gain through the glass; it isn’t air conditioning.',
    },
    {
      q: 'Will it cut glare too?',
      a: 'Yes — glare reduction comes with the heat control. Screens and TVs stay readable through the afternoon on treated glass.',
    },
    {
      q: 'Does it help in winter?',
      a: 'Solar film still lets winter sun warm the room. If winter heat loss is your bigger concern, ask about low-E film, which also reflects interior heat back inside.',
    },
    {
      q: 'Will it change how my house looks from the street?',
      a: 'A clear or lightly tinted spectrally-selective film is barely noticeable from outside. Reflective and darker options have a more visible exterior look — we show you samples.',
    },
    {
      q: 'Is there a warranty?',
      a: 'Yes — a manufacturer warranty on the film (often lifetime for residential) plus our workmanship guarantee on the install.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'UV & Fade Protection Film', to: '/window-tint/uv-protection' },
    { label: 'Privacy Window Film', to: '/window-tint/privacy' },
  ],
  ctaTitle: 'Get a free in-home estimate',
  ctaBody:
    "Tell us which rooms overheat or glare up. We check the glass, recommend a heat-rejection film with the right specs, and send one written quote.",
};

const uvProtection: ServiceData = {
  path: '/window-tint/uv-protection',
  seoTitle: 'UV Protection Window Film Denver | Fade Protection for Homes | ikonic303',
  seoDescription:
    'Near-invisible UV-blocking window film for Denver homes — blocks up to 99% of ultraviolet light to slow fading of hardwood floors, rugs, furniture, artwork, and cabinetry. Clear film, no change to your view. Free in-home estimate.',
  schemaServiceType: 'UV Protection and Fade Control Window Film',
  schemaName: 'UV & Fade Protection Window Film',
  schemaDescription:
    'Optically clear, near-invisible UV-blocking window film for residential glass in the Denver metro — blocks up to 99% of UV to protect hardwood, textiles, artwork, cabinetry, and leather from fading, without changing the appearance or brightness of the room.',
  eyebrow: 'RESIDENTIAL WINDOW FILM',
  h1: (
    <>
      UV &amp; Fade Protection <span className="text-mint">Window Film</span>
    </>
  ),
  lead: "The stripe of lighter hardwood where the sun hits every afternoon. The rug that's two shades paler on one end. The family photos and the art you've had to move away from the windows. Ultraviolet light is the main driver of that damage, and a near-invisible film on the glass blocks up to 99% of it — without changing how the room looks or how bright it is.",
  sections: [
    {
      heading: 'What UV film protects',
      body: (
        <p>
          Hardwood and engineered floors, area rugs and carpet, upholstery and drapes, leather
          furniture, wood cabinetry and trim, artwork, photographs, and even some countertops.
          Anything that sits in a sun path is fading a little every day; the process is gradual and
          usually only obvious once you move a piece of furniture and see the line.
        </p>
      ),
    },
    {
      heading: 'Near-invisible, goes on almost any window',
      body: (
        <p>
          The films used specifically for fade control are optically clear — installed, you
          can't tell a window has it. There's no darkening, no color cast, no change to the view.
          That makes it the easy choice for windows where you don't want any visible film at all:
          street-facing rooms, formal spaces, and windows with a view you don't want to touch.
        </p>
      ),
    },
    {
      heading: 'UV is most of the story, but not all of it',
      body: (
        <p>
          UV causes the majority of fading, so blocking 99% of it dramatically slows the damage.
          Visible light and heat also contribute over time. If a room gets punishing direct sun,
          a spectrally-selective solar film gives you fade protection <em>plus</em> heat and glare
          control — see{' '}
          <a href="/window-tint/solar-heat" className="text-mint hover:underline">
            solar &amp; heat-rejection film
          </a>
          . For a room where you only care about protecting what's inside, clear UV film is the
          right tool.
        </p>
      ),
    },
    {
      heading: 'Skylights, sliding doors, and problem panes',
      body: (
        <p>
          Skylights and south-facing sliding doors are common fade culprits and are good
          candidates for clear UV film. We check each pane's glass type first — skylights in
          particular are often tempered or laminated units that need the right film — and confirm
          compatibility before quoting.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Can you actually see the film once it’s installed?',
      a: 'No — dedicated fade-protection film is optically clear. There’s no tint, no haze, and no change to how bright the room is.',
    },
    {
      q: 'Will it stop my floors and furniture fading completely?',
      a: 'It blocks up to 99% of UV, which is the largest single cause of fading, so it dramatically slows the damage. Heat and visible light still contribute over long periods; nothing short of blackout stops fading entirely.',
    },
    {
      q: 'Do I need this if I already want heat-rejection film?',
      a: 'No — a good solar heat-rejection film already blocks ~99% of UV. Clear UV film is for windows where you want fade protection but no visible tint at all.',
    },
    {
      q: 'Does it work on skylights?',
      a: 'Often, yes — skylights are a frequent fade source. We confirm the skylight’s glass type is a safe candidate for film first.',
    },
    {
      q: 'Is the fade protection warrantied?',
      a: 'The film carries a manufacturer warranty (often lifetime for residential). Some manufacturers also offer a limited furnishings-fade warranty on specific products — we’ll tell you what applies to the film we recommend.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Solar & Heat-Rejection Film', to: '/window-tint/solar-heat' },
    { label: 'Decorative & Frosted Film', to: '/window-tint/decorative-privacy' },
  ],
  ctaTitle: 'Protect what the sun is fading',
  ctaBody:
    "Tell us which rooms and windows are causing the fading. We check the glass, spec a clear UV film, and send one written quote.",
};

const privacyFilm: ServiceData = {
  path: '/window-tint/privacy',
  seoTitle: 'Privacy Window Film for Homes Denver | Daytime Privacy Tint | ikonic303',
  seoDescription:
    'Privacy window film for Denver homes — daytime one-way and frosted films for bedrooms, bathrooms, and street- or neighbor-facing glass. Privacy without blinds, daylight kept. Free in-home estimate.',
  schemaServiceType: 'Residential Privacy Window Film',
  schemaName: 'Privacy Window Film for Homes',
  schemaDescription:
    'Daytime one-way reflective and frosted privacy window film for residential glass in the Denver metro — privacy for bedrooms, bathrooms, and street- and neighbor-facing windows without blinds or curtains, while keeping daylight and, for reflective films, the view out.',
  eyebrow: 'RESIDENTIAL WINDOW FILM',
  h1: (
    <>
      Privacy Window Film <span className="text-mint">for Homes</span>
    </>
  ),
  lead: "The bedroom window that faces the neighbor's deck. The ground-floor rooms where the blinds stay shut all day. The bathroom you'd like to have some daylight in. Privacy window film gives street- and neighbor-facing glass privacy during the day without blinds or curtains — and depending on the film, you can still see out.",
  sections: [
    {
      heading: 'Two ways to get privacy',
      body: (
        <p>
          <strong>Daytime one-way (reflective) film</strong> uses the brightness difference between
          outside and inside: during the day, the outside is brighter, so the window reads as a
          mirror from the street while you still see out clearly. <strong>Frosted film</strong>
          diffuses the view entirely in both directions but passes daylight through — better for
          bathrooms and any window where you don't need to see out. We match the film to the room.
        </p>
      ),
    },
    {
      heading: 'The night-time trade-off (and how to handle it)',
      body: (
        <p>
          Reflective one-way film depends on outside being brighter than inside. After dark, with
          interior lights on, that flips — so a purely reflective film gives less privacy at night.
          For bedrooms and bathrooms we usually recommend a frosted or a heavier dual-reflective
          film, or pairing a lighter film with a simple shade for night. We walk through this at
          the estimate so there are no surprises.
        </p>
      ),
    },
    {
      heading: 'How it looks from the street',
      body: (
        <p>
          One-way privacy films have a visible exterior look that ranges from a subtle silver
          sheen to a distinct mirror, depending on how much privacy you want. Frosted film reads as
          etched or "bathroom" glass. If you want privacy <em>and</em> a decorative pattern, band,
          or logo, see{' '}
          <a href="/window-tint/decorative-privacy" className="text-mint hover:underline">
            frosted &amp; decorative film
          </a>
          . We show you samples against your own glass before you decide.
        </p>
      ),
    },
    {
      heading: 'Where homeowners use it most',
      body: (
        <p>
          Ground-floor bedrooms and bathrooms, front rooms that face the sidewalk, windows a few
          feet from a neighbor's house, home-office windows, and glass in door sidelights. Many
          privacy films also add UV and some heat rejection, so a street-facing room can get
          privacy and fade protection in one product.
        </p>
      ),
    },
  ],
  faqs: [
    {
      q: 'Can people see in at night?',
      a: 'Reflective one-way film loses its effect after dark when interior lights are on. For rooms that need night privacy we recommend a frosted film, a heavier dual-reflective film, or pairing a lighter film with a shade. We cover this at the estimate.',
    },
    {
      q: 'Will my house look mirrored?',
      a: 'It depends on the film. Light privacy films have a subtle silver sheen; stronger one-way films look more like a mirror from outside. Frosted films look like etched glass. You choose the level after seeing samples.',
    },
    {
      q: 'Can I still see out?',
      a: 'With reflective one-way film, yes — clearly, during the day. Frosted film diffuses the view in both directions, so it’s used where seeing out doesn’t matter.',
    },
    {
      q: 'Does privacy film also block heat and UV?',
      a: 'Most do to some degree — reflective privacy films in particular add meaningful heat and UV rejection. If heat control is a main goal, we’ll steer you to a film that does both well.',
    },
    {
      q: 'Is it removable?',
      a: 'Yes — professional film removes cleanly from glass if your needs change.',
    },
  ],
  related: [
    { label: 'Residential Window Tinting', to: '/window-tint' },
    { label: 'Decorative & Frosted Film', to: '/window-tint/decorative-privacy' },
    { label: 'Solar & Heat-Rejection Film', to: '/window-tint/solar-heat' },
  ],
  ctaTitle: 'Get a free in-home estimate',
  ctaBody:
    "Tell us which windows need privacy and whether night privacy matters. We show you samples on your own glass and send one written quote.",
};

export const services: Record<string, ServiceData> = {
  residential,
  commercialTint,
  storefrontGraphics,
  decorativePrivacy,
  securityFilm,
  storefrontTint,
  solarHeat,
  uvProtection,
  privacyFilm,
};
