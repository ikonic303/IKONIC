/**
 * prerender-routes.mjs — per-route static HTML for crawlers and AI answer engines.
 *
 * THE PROBLEM THIS SOLVES
 * ikonic303.com is a client-rendered Vite/React SPA. Every SPA route (/about, /services,
 * /contact, …) was served the SAME dist/index.html — byte-identical, 9,658 bytes, with the
 * homepage's <title> and a canonical pointing at "https://ikonic303.com/". To any crawler that
 * does not execute JavaScript — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, and Google's
 * first pass — the site was ONE page published at a dozen URLs, each one declaring itself a
 * duplicate of the homepage. react-helmet-async sets the correct per-page tags, but only after
 * JS runs, which is exactly when those crawlers have already left.
 *
 * THE FIX
 * After `vite build`, take the built dist/index.html as a template and emit a real
 * dist/<route>/index.html for every public route, each carrying its own <title>, description,
 * canonical, OG/Twitter tags, and a block of genuine page content inside #root. Vercel serves
 * a matching static file before it consults the SPA catch-all rewrite, so /about now returns
 * about-specific HTML.
 *
 * Users are unaffected: React's createRoot().render() replaces #root the instant JS runs, so
 * the interactive SPA is identical. Same HTML is served to every visitor — progressive
 * enhancement, not cloaking.
 *
 * MAINTENANCE
 * `title` and `description` below are copied verbatim from each page's <PageSEO> props so the
 * static shell and the React app never disagree. If you change PageSEO on a page, change it
 * here too. `body` is the crawler-visible content — keep every claim true and consistent with
 * listings/nap-truth.json; this text is what AI answer engines quote back about ikonic.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const ORIGIN = 'https://ikonic303.com';

const PHONE = '(720) 679-1230';
const CONTACT_BLOCK = `<h2>Free in-home estimate</h2>
<p>Call <a href="tel:+17206791230">${PHONE}</a> or email
<a href="mailto:info@ikonic303.com">info@ikonic303.com</a>.
ikonic — 4880 Robb St. #8, Wheat Ridge, CO 80033. We visit your home in the Denver metro
(Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver), look at the actual windows, and
send one clear written quote. Commercial storefront work is scheduled around business hours.</p>`;

/** @type {{path:string,title:string,description:string,body:string}[]} */
const ROUTES = [
  {
    path: '/about',
    title: 'About ikonic303 | Denver Residential Window Tinting',
    description:
      "ikonic is a Wheat Ridge, CO window film company specializing in residential window tinting for the Denver metro — heat, glare, UV, privacy, and energy savings. Commercial storefront tint also available.",
    body: `<h1>About ikonic303 — Denver's Residential Window Tinting Specialists</h1>
<p>ikonic is a Wheat Ridge, Colorado window film company. Home window tinting is what we do most:
heat and glare reduction, up to 99% UV protection, daytime privacy, improved comfort, energy
savings, and fade protection for floors, furniture, and artwork — plus decorative and security
film options.</p>
<p>We recommend a film per window rather than one film for the whole house, we check the glass
against the manufacturer's compatibility chart before quoting, and we finish most homes in a
single visit with floors and furniture protected. Commercial storefront window tint and graphics
are a supporting, secondary service. Serving Wheat Ridge, Arvada, Lakewood, Golden, and greater
Denver.</p>`,
  },
  {
    path: '/services',
    title: 'Window Tinting Services Denver | Residential & Commercial | ikonic303',
    description:
      'ikonic specializes in residential window tinting in Denver — heat, glare, UV, privacy, and energy-efficient home window film. Commercial storefront window tint and graphics are also available as a secondary service.',
    body: `<h1>Window Tinting Services — Denver, Colorado</h1>
<p>Residential window tinting is ikonic's primary service. Commercial storefront window tint and
graphics are offered as a supporting, secondary service.</p>
<h2>Residential Window Tinting (primary)</h2>
<p>Home window film for Denver houses: solar and heat-rejection film for hot west- and
south-facing rooms, up to 99% UV protection to stop fading of hardwood, carpet, furniture, and
artwork, daytime privacy film, improved room-to-room comfort, and energy savings. Decorative and
frosted film for style and privacy; tear-resistant security and safety film for ground-floor and
patio glass. Free in-home estimate; glass checked for compatibility; most homes installed in one
visit; manufacturer film warranty plus workmanship guarantee.</p>
<h2>Commercial Storefront Window Tint (secondary)</h2>
<p>Solar heat and glare control, energy savings, and privacy or security film for retail, offices,
and multi-tenant buildings. Scoped window by window or room by room; installed before or after
business hours.</p>
<h2>Commercial Storefront Film &amp; Window Graphics (secondary)</h2>
<p>Custom window graphics (hours, logos, offers, full-window art), privacy and decorative film,
security film, and business branding and promotional graphics — designed in-house and installed
on-site.</p>
<h2>Why homeowners choose ikonic</h2>
<p><strong>Residential window tinting is our specialty.</strong> <strong>A film recommended per
window</strong>, not one for the whole house. <strong>Glass checked first</strong> against the
film compatibility chart before quoting. <strong>Clean, one-day install</strong> with your home
protected. ikonic serves Wheat Ridge, Arvada, Lakewood, Golden, and Denver.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/contact',
    title: 'Contact ikonic303 | Free In-Home Window Tint Estimate — Denver, CO',
    description:
      'Request a free in-home estimate for residential window tinting in the Denver metro. We look at your actual windows and send one clear written quote. Call (720) 679-1230.',
    body: `<h1>Contact ikonic303 — Wheat Ridge, Colorado</h1>
<p>Request a free in-home estimate for residential window tinting — heat, glare, privacy, fading,
or a decorative look. We also quote commercial storefront window tint and graphics. Serving the
Denver metro including Wheat Ridge, Arvada, Lakewood, and Golden.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/blogs',
    title: 'Residential Window Tinting Blog | Denver Home Window Film Guides | ikonic303',
    description:
      'Guides on residential window tinting for Denver homes — heat and glare control, UV and fade protection, privacy film, energy-efficient window tint, and decorative and security film. Plus commercial storefront tint.',
    body: `<h1>ikonic guides — residential window tinting</h1>
<p>Practical guides on home window tinting in the Denver metro: heat and glare control, UV and
fade protection, privacy film, energy-efficient window tint, and decorative and security film —
plus commercial storefront window tint. Written for homeowners, not marketers.</p>`,
  },
  {
    path: '/careers',
    title: 'Careers at ikonic303 | Window Tint Installers — Denver, CO',
    description:
      "Join the ikonic303 crew in Wheat Ridge, CO. We're hiring residential window film / tint installers. Craft-focused, steady year-round work across the Denver metro. Training provided.",
    body: `<h1>Careers at ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic hires residential window film / tint installers. We are a small Wheat Ridge crew that
values a clean finished edge and treating a customer's home like our own. Window-film experience
is a plus, not required — we train the technique. Steady, year-round home work across the Denver
metro, plus some commercial storefront tint.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/learn-more',
    title: 'How Home Window Tinting Works | ikonic303 Denver',
    description:
      'How ikonic scopes and installs residential window film in the Denver metro: free in-home estimate, glass compatibility check, one written quote, a clean one-day install, and a manufacturer-backed warranty.',
    body: `<h1>How home window tinting works</h1>
<p>Every ikonic home job starts with a free in-home estimate — we look at the actual glass and
rooms and talk through your goals. Then we match your glass to the film manufacturer's
compatibility chart, send one clear written quote with the right film spec'd per window, and do a
clean, dust-controlled install with your floors and furniture protected. Most homes are finished
in a single visit, backed by a manufacturer film warranty plus our workmanship guarantee.</p>`,
  },
  {
    path: '/gallery',
    title: 'Residential Window Tinting Gallery Denver | ikonic303',
    description:
      'Completed residential window tinting projects across Denver — living rooms, bedrooms, sunrooms, and entryways treated with solar, UV, privacy, and decorative film. Plus commercial storefront tint and graphics.',
    body: `<h1>Completed Residential Window Tinting Projects</h1>
<p>Homes across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver — living rooms,
bedrooms, sunrooms, home offices, and entryways, each treated with the right film for the window:
solar and heat-rejection film, near-invisible UV film, daytime privacy film, decorative frosted
film, and security film. We also tint and brand commercial storefronts as a secondary service.</p>
${CONTACT_BLOCK}`,
  },

  // ── Service pages (React Router routes in src/pages/services). Residential-first
  //    (2026-09-04). Keep this copy roughly in sync with serviceData.tsx.
  //    /window-tint/home 301s to /window-tint; /signage and /wayfinding 301 to
  //    /storefront-graphics (vercel.json), so they no longer get shells.
  {
    path: '/window-tint',
    title: 'Residential Window Tinting Denver | Home Window Film | ikonic303',
    description:
      'Professional residential window tinting in Denver — heat and glare reduction, 99% UV protection, privacy window film, energy-efficient window tint, and fade protection for floors and furniture. Free in-home estimate.',
    body: `<h1>Professional Residential Window Tinting in Denver</h1>
<p>Home window film makes a Denver house more comfortable, more private, and cheaper to run
without changing how it looks from the street. ikonic installs solar, UV, privacy, decorative,
and security film for homeowners across Wheat Ridge, Arvada, Lakewood, Golden, and greater
Denver.</p>
<h2>What home window tinting does</h2>
<p><strong>Heat &amp; glare reduction</strong> on west- and south-facing rooms. <strong>UV
protection</strong> — up to 99% — to stop fading of hardwood, carpet, furniture, cabinetry, and
artwork. <strong>Daytime privacy</strong> without living behind blinds. <strong>Improved
comfort</strong> with fewer hot and cold spots. <strong>Energy savings</strong> — a lighter AC
load in summer, and low-E options that retain heat in winter. <strong>Decorative and security
film</strong> options for style, privacy, and safety.</p>
<h2>Residential film options</h2>
<p>Solar &amp; heat-rejection film, near-invisible UV-blocking film, daytime privacy film,
decorative and frosted film, and tear-resistant security and safety film. We recommend a film per
window rather than one film for the whole house.</p>
<h2>We check your glass first</h2>
<p>Single-pane, dual-pane, low-E, tempered, and laminated glass each behave differently. The
wrong film on the wrong glass can cause thermal-stress cracks or void a window's seal warranty,
so every quote starts with identifying your glass and matching it to the film manufacturer's
compatibility chart.</p>
<h2>How the installation works</h2>
<p>A free in-home estimate, one clear written quote, a clean one-day install with your home
protected, and a manufacturer film warranty plus our workmanship guarantee.</p>
<h2>FAQ</h2>
<p><strong>Will it make my rooms dark?</strong> Not unless you want it to — solar and UV films
stay close to clear. <strong>Can film stop my floors and furniture fading?</strong> Yes — UV is
the biggest driver of fading and quality film blocks up to 99% of it. <strong>Does it really
save energy?</strong> It reduces solar heat gain, lowering the AC load; low-E options help in
winter.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/office',
    title: 'Commercial Storefront Window Tint Denver | ikonic303',
    description:
      'Commercial storefront window tint in Denver — solar heat and glare control, energy savings, privacy and decorative film, and security film for retail, offices, and multi-tenant buildings.',
    body: `<h1>Commercial Storefront Window Tint in Denver</h1>
<p>Alongside our residential work, ikonic tints commercial storefronts and offices across Denver —
cutting solar heat and glare, lowering cooling costs, and adding privacy or security. Same crew
and clean install as our home jobs, scheduled around your business hours.</p>
<h2>Storefront &amp; office window tint</h2>
<p>Solar-control film on retail and office glass cuts afternoon heat and glare. Jobs are scoped
window by window or room by room, so you can treat the problem glass first and roll out the rest
as budget allows.</p>
<h2>Privacy, decorative &amp; security film</h2>
<p>Frosted and etched privacy film for conference rooms, clinics, and street-facing glass;
tear-resistant security film that holds broken glass in the frame; and clear anti-graffiti film
for ground-floor glass.</p>
<h2>FAQ</h2>
<p><strong>Will it help our cooling bill?</strong> It reduces the solar heat load through the
glass. <strong>Can you tint just the problem windows?</strong> Yes — most commercial jobs are
scoped window by window. <strong>Do you install outside business hours?</strong> Yes.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/storefront-graphics',
    title: 'Commercial Storefront Film & Window Graphics Denver | ikonic303',
    description:
      'Commercial storefront window graphics, privacy and decorative film, security film, and business branding & promotional graphics — designed, printed, and installed on-site across the Denver metro.',
    body: `<h1>Commercial Storefront Film &amp; Window Graphics in Denver</h1>
<p>A supporting service to our residential window tinting: ikonic brands and protects commercial
storefronts across Denver with custom window graphics, privacy and decorative film, security
film, and promotional graphics — designed in-house and installed on-site.</p>
<h2>Custom window graphics &amp; business branding</h2>
<p>Hours, logo, service lists, and full-window art. Perforated film reads as a solid graphic from
the sidewalk while you still see out from inside. We design from your brand and proof it with you
before anything prints.</p>
<h2>Privacy, decorative &amp; security film</h2>
<p>Frosted, etched-glass, and patterned films for privacy with daylight still passing through;
tear-resistant security film for ground-floor storefront glass.</p>
<h2>Promotional graphics</h2>
<p>Grand-opening takeovers, seasonal offers, and event graphics in removable vinyl — up for the
promotion, off cleanly when it's over.</p>
<h2>FAQ</h2>
<p><strong>Will graphics block the view out?</strong> Only where you want them to. <strong>Can
you match our brand colors?</strong> Yes — we print from your brand files and proof against
them. <strong>Do you also tint the storefront glass?</strong> Yes — see commercial storefront
window tint.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/solar-heat',
    title: 'Heat-Rejection Window Film Denver | Solar Window Tint for Homes | ikonic303',
    description:
      'Solar and heat-rejection window film for Denver homes — cuts a large share of solar heat and afternoon glare on west- and south-facing glass while staying nearly clear. Lower AC load, comfortable rooms. Free in-home estimate.',
    body: `<h1>Solar &amp; Heat-Rejection Window Film in Denver</h1>
<p>Solar heat-rejection film stops the heat and glare at the glass, so the west-facing living room
stops spiking in temperature every afternoon and screens stay readable. Modern spectrally-selective
film rejects a large share of the sun's total energy while still passing most of the visible
light, so you keep the view and the daylight — it will not make your rooms dark.</p>
<h2>Where it earns its keep</h2>
<p>West- and south-facing living rooms, sunrooms and enclosed porches, upstairs bedrooms that bake
in the afternoon, home offices with screen glare, and any wall of glass. Colorado's
high-altitude sun makes the difference noticeable day to day. Most homes get interior film;
exterior film is an option for glass that can't take an interior film or for the highest heat
rejection on a brutal west elevation.</p>
<h2>FAQ</h2>
<p><strong>Will it make my rooms dark?</strong> No — spectrally-selective film separates heat from
light, so you keep a bright room and a clear view. <strong>Does it cut glare?</strong> Yes, glare
reduction comes with the heat control. <strong>Does it help in winter?</strong> Solar film still
lets winter sun in; ask about low-E film if winter heat loss is the bigger concern.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/uv-protection',
    title: 'UV Protection Window Film Denver | Fade Protection for Homes | ikonic303',
    description:
      'Near-invisible UV-blocking window film for Denver homes — blocks up to 99% of ultraviolet light to slow fading of hardwood floors, rugs, furniture, artwork, and cabinetry. Clear film, no change to your view. Free in-home estimate.',
    body: `<h1>UV &amp; Fade Protection Window Film in Denver</h1>
<p>Ultraviolet light is the main driver of fading in hardwood and engineered floors, rugs and
carpet, upholstery and drapes, leather furniture, wood cabinetry, artwork, and photographs. A
near-invisible film on the glass blocks up to 99% of UV, dramatically slowing that damage without
changing how the room looks or how bright it is.</p>
<h2>Near-invisible, goes on almost any window</h2>
<p>Dedicated fade-protection film is optically clear — no darkening, no color cast, no change to
the view — which makes it the easy choice for street-facing rooms, formal spaces, and windows
with a view you don't want to touch. Skylights and south-facing sliding doors are common fade
culprits and good candidates; we check each pane's glass type first.</p>
<h2>FAQ</h2>
<p><strong>Can you see the film once installed?</strong> No — it's optically clear.
<strong>Will it stop fading completely?</strong> It blocks up to 99% of UV, the largest single
cause of fading; heat and visible light still contribute over long periods. <strong>Do I need it
if I want heat-rejection film?</strong> No — a good solar film already blocks ~99% of UV.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/privacy',
    title: 'Privacy Window Film for Homes Denver | Daytime Privacy Tint | ikonic303',
    description:
      'Privacy window film for Denver homes — daytime one-way and frosted films for bedrooms, bathrooms, and street- or neighbor-facing glass. Privacy without blinds, daylight kept. Free in-home estimate.',
    body: `<h1>Privacy Window Film for Homes in Denver</h1>
<p>Privacy window film gives street- and neighbor-facing glass privacy during the day without
blinds or curtains. <strong>Daytime one-way (reflective) film</strong> reads as a mirror from the
street while you still see out clearly; <strong>frosted film</strong> diffuses the view entirely
in both directions but passes daylight through — better for bathrooms.</p>
<h2>The night-time trade-off</h2>
<p>Reflective one-way film depends on the outside being brighter than the inside, so after dark
with interior lights on it gives less privacy. For bedrooms and bathrooms we recommend a frosted
or heavier dual-reflective film, or pairing a lighter film with a shade. We walk through this at
the estimate. One-way films have a visible exterior look from a subtle silver sheen to a distinct
mirror; frosted film looks like etched glass. Many privacy films also add UV and some heat
rejection.</p>
<h2>FAQ</h2>
<p><strong>Can people see in at night?</strong> Reflective film loses its effect after dark;
frosted or heavier films keep night privacy. <strong>Will my house look mirrored?</strong> It
depends on the film — you choose the level after seeing samples. <strong>Can I still see
out?</strong> Yes with reflective one-way film during the day; frosted film diffuses the view
both ways.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/decorative-privacy',
    title: 'Frosted & Decorative Window Film Denver | Privacy Film | ikonic303',
    description:
      'Frosted, etched, and decorative window film for Denver homes and businesses — daytime privacy for bathrooms, sidelights, and street-facing glass, plus branded and patterned looks, without blinds.',
    body: `<h1>Frosted &amp; Decorative Window Film in Denver</h1>
<p>Frosted and decorative film changes what a window shows without closing it off. Frosted film
passes daylight through while blocking a clear line of sight — a bathroom stays bright without
anyone seeing in, a street-facing room keeps its privacy without blinds, and a home office or
conference room can go opaque for a meeting without construction.</p>
<h2>Decorative &amp; branded options</h2>
<p>Decorative film can be cut into a band, a pattern, a gradient, a logo, or an etched-glass-style
design for glass doors, sidelights, feature walls, and storefronts. Because it's a film, not
sandblasted glass, it costs far less and is fully reversible.</p>
<h2>FAQ</h2>
<p><strong>Does frosted film block all the light?</strong> No — it passes light while blocking a
clear view. <strong>Can you cut it into our logo?</strong> Yes — bands, patterns, gradients, and
custom logo shapes, approved before anything is cut.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/security-film',
    title: 'Security & Safety Window Film Denver | ikonic303',
    description:
      'Security and safety window film for Denver homes and businesses — tear-resistant film that holds shattered glass in the frame, slowing forced entry and containing storm and accident damage.',
    body: `<h1>Security &amp; Safety Window Film in Denver</h1>
<p>Security film doesn't make a pane unbreakable, but it changes what happens next: instead of the
glass shattering and falling away, a thick, tear-resistant film holds it together in the frame —
slowing a break-in and containing storm and accident damage. On a home it protects patio doors,
ground-floor windows, and door sidelights; for a business, street-level storefront glass and
entry doors.</p>
<h2>We check your glass first</h2>
<p>Pane size, thickness, and existing glass condition all affect what's safe to install. We
identify the glass and confirm the right product before quoting, and security film can be layered
with a solar or decorative film on the same pane.</p>
<h2>FAQ</h2>
<p><strong>Does it stop a break-in?</strong> It doesn't make glass unbreakable, but it holds
shattered glass in the frame instead of falling away, which slows a smash-and-grab and often ends
it. <strong>Is it the same as tinted film?</strong> No — it's a thicker film built for impact
performance; it can be clear or combined with other films.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/window-tint/storefront',
    title: 'Storefront Window Tinting Denver | ikonic303',
    description:
      'Storefront window tinting in Denver — solar film that cuts heat, glare, and merchandise fade on retail glass while keeping the view from the sidewalk clear. Scheduled around your hours.',
    body: `<h1>Storefront Window Tinting in Denver</h1>
<p>Retail glass takes full sun most of the day, with merchandise against it and customers who need
to feel comfortable near the windows. Solar film cuts the heat and UV that cause fade and
window-side discomfort while keeping visibility from the sidewalk intact — the whole point of a
storefront.</p>
<h2>We check your glass before we quote</h2>
<p>Storefront glass is often larger and older than residential glass, and large single panes
carry their own thermal-stress risk. We identify the glass and confirm the film against the
manufacturer's compatibility chart first. Many storefronts combine solar film with window
graphics in one visit.</p>
<h2>FAQ</h2>
<p><strong>Will tinting hide us from the street?</strong> No — storefront solar films stay close
to clear from both sides. <strong>Can film protect our displays from fading?</strong> Yes — UV
and heat are the main drivers of fade and quality film blocks most of both.</p>
${CONTACT_BLOCK}`,
  },

  // ---------------------------------------------------------------------------
  // HIDDEN 2026-08-29 — site refocused on architectural window film & graphics.
  // The digital-marketing service pages, the founder's book, and the print/AI/
  // sticker tools are unrouted in the SPA and 301-redirect to /services (see
  // vercel.json), so they no longer need prerendered shells or sitemap entries.
  // The route definitions are kept here, commented out, for an easy revert.
  // ---------------------------------------------------------------------------
  // { path: '/branded-to-win', ... },
  // { path: '/services/web-design', ... },
  // { path: '/services/crm-automation', ... },
  // { path: '/services/reputation', ... },
  // { path: '/services/speed-to-lead', ... },
  // { path: '/services/marketing', ... },
  // { path: '/print-ship', ... },
  // { path: '/lost-call-calculator', ... },
  // { path: '/sticker-builder', ... },
  // { path: '/ai-website-generator', ... },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the content of a meta/link tag matched by `attrRe`, preserving the rest of the tag. */

// JSON.stringify does NOT escape "/", so a value containing </script> breaks out of the
// block below and is baked into dist/**/index.html — XSS that fires before React mounts
// and even for JS-disabled crawlers. Blog titles/descriptions come from GHL, so they are
// not fully trusted. Escaping "<" to \u003c keeps the JSON valid and inert.
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function setTag(html, attrRe, value) {
  return html.replace(attrRe, (m) => m.replace(/content="[^"]*"/, `content="${esc(value)}"`));
}

function buildPage(template, route) {
  const url = ORIGIN + route.path;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`);
  html = setTag(html, /<meta\s+name="description"[^>]*>/, route.description);
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`
  );
  html = setTag(html, /<meta\s+property="og:url"[^>]*>/, url);
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/, route.title);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/, route.description);
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/, route.title);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/, route.description);

  // Swap the homepage crawler fallback for this route's content. React replaces #root on boot.
  // In source, #root is followed by <script type="module">. After `vite build` that script is
  // hoisted into <head>, leaving </div> followed by </body>. Match either so the script works
  // against both the source template and the built output.
  const rootRe = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  if (!rootRe.test(html)) {
    throw new Error(
      'prerender: could not locate the #root fallback block in dist/index.html. ' +
        'If index.html changed shape, update the rootRe pattern in scripts/prerender-routes.mjs.'
    );
  }
  const fallback = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        ${route.body}
        <p><a href="${ORIGIN}/">ikonic home</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
      </main>
    `;
  html = html.replace(rootRe, `$1${fallback}$2`);
  return html;
}

/**
 * Blog posts. There are ~53 of them and they were ALL served the homepage shell —
 * same <title>, canonical="https://ikonic303.com/" — so to a crawler that doesn't run
 * JS, every post looked like another copy of the homepage. Posts are the whole point
 * of the daily generator and the most citable thing on the site, so they get real
 * shells with their own title, description, canonical, opening text and Article schema.
 *
 * FAIL SOFT: the post list is fetched from the live API at build time. If that fetch
 * fails (site down, API blip, offline build) we log and skip — a broken blog feed must
 * never break the deploy of the whole site.
 *
 * STALENESS: a post published between builds has no shell until the next deploy. It
 * still renders for humans (the SPA handles /post/:slug) and is still indexable — it
 * just shows the generic shell to a crawler until then. Run scripts/deploy-site.sh
 * after publishing if a post matters immediately.
 */
async function fetchJson(url, ms = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const stripHtml = (html) =>
  String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function buildPost(template, post) {
  const url = `${ORIGIN}/post/${post.slug}`;
  const title = `${post.title} | ikonic303`;
  const desc = (post.description || post.excerpt || '').slice(0, 300);
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = setTag(html, /<meta\s+name="description"[^>]*>/, desc);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  html = setTag(html, /<meta\s+property="og:url"[^>]*>/, url);
  html = setTag(html, /<meta\s+property="og:title"[^>]*>/, title);
  html = setTag(html, /<meta\s+property="og:description"[^>]*>/, desc);
  html = setTag(html, /<meta\s+name="twitter:title"[^>]*>/, title);
  html = setTag(html, /<meta\s+name="twitter:description"[^>]*>/, desc);
  html = html.replace(/<meta\s+property="og:type"[^>]*>/, '<meta property="og:type" content="article" />');

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: desc,
    datePublished: post.publishedAt || undefined,
    author: { '@type': 'Organization', name: 'ikonic303' },
    publisher: { '@type': 'Organization', name: 'ikonic303', url: ORIGIN },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    articleSection: post.category || undefined,
    keywords: Array.isArray(post.tags) && post.tags.length ? post.tags.join(', ') : undefined,
  };

  const body = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        <article>
          <h1>${esc(post.title)}</h1>
          <p><em>${esc(post.category || 'Window Film')}${post.publishedAt ? ' · ' + new Date(post.publishedAt).toDateString() : ''}</em></p>
          ${post.body ? `<p>${esc(post.body)}</p>` : `<p>${esc(desc)}</p>`}
        </article>
        <p><a href="${ORIGIN}/blogs">All guides</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
      </main>
      <script type="application/ld+json">${jsonLd(schema)}</script>
    `;
  return html.replace(/(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/, `$1${body}$2`);
}

// Moon River (Rios's Brighton construction business) categories. The daily generator is
// not yet client-scoped, so it can still queue these onto ikonic's own blog. Unpublishing
// clears what's already live; this filter keeps any new ones out of ikonic's prerendered
// shells and sitemap until the generator itself is scoped at write time.
const MOON_RIVER_CATEGORIES = new Set([
  'Concrete & Hardscapes',
  'Landscaping & Outdoor Living',
  'Interior Remodeling',
  'Home Maintenance & Seasonal',
]);

// D4 vehicle content removal (2026-08-26): PPF, window tint, ceramic coating, and
// commercial/fleet vehicle wraps are no longer part of ikonic's content strategy — the
// 14 existing posts were unpublished via the Redis status flag and the generator no
// longer queues these topics (see TOPICS_BY_CATEGORY in auto-blog-generate.ts). This
// filter is defense-in-depth, same as MOON_RIVER_CATEGORIES above: it keeps any
// leftover or manually-added vehicle post out of the sitemap and prerendered shells.
//
// 2026-08-29 refocus: 'Digital Marketing' is retired from the blog for the same reason.
// Existing marketing posts are unpublished; this keeps any that slip through out of the
// sitemap and prerendered shells. See auto-blog-generate.ts for the matching change.
// 2026-09-04 refocus on RESIDENTIAL window tinting: the 'Signage' and 'Wayfinding
// Signage' blog categories are retired in auto-blog-generate.ts (no new posts),
// but the ~28 existing signage/wayfinding posts stay published AND stay in the
// sitemap/shells — dropping that many indexed pages would hurt more than help.
// Their in-body /signage and /wayfinding links 301 to /storefront-graphics.
const VEHICLE_CATEGORIES = new Set([
  'Commercial Wraps', 'Vehicle Protection', 'Digital Marketing',
]);

// 2026-08-29 refocus: some older marketing posts were filed under generic categories
// ('Marketing', 'Lead Generation', etc.) so the category set alone doesn't catch them.
// This slug/title keyword filter is the belt-and-braces: any post that is clearly about
// digital marketing, SEO, ads, CRM, funnels, or lead automation is kept out of the
// prerendered shells and the sitemap. Unpublishing them in Redis is still the real fix.
const OFF_TOPIC_SLUG_RE =
  /(^|-)(marketing|gohighlevel|ghl|crm|seo|sem|ppc|funnel|funnels|lead-|leads-|lead-gen|lead-generation|automation|chatbot|ai-voice|retarget|ad-|ads-|advertising|google-ads|meta-ads|facebook-ads|newsletter|email-marketing|reputation|reviews?-automation|website-|web-design|sales-funnel)(-|$)/i;

async function prerenderPosts(template) {
  let list;
  try {
    const d = await fetchJson(`${ORIGIN}/api/blog-posts`, 20000);
    list = (d.posts || [])
      .filter((p) => p.slug && !String(p.link || '').startsWith('http'))
      .filter((p) => !MOON_RIVER_CATEGORIES.has(p.category))
      .filter((p) => !VEHICLE_CATEGORIES.has(p.category))
      .filter((p) => !OFF_TOPIC_SLUG_RE.test(p.slug || '') && !OFF_TOPIC_SLUG_RE.test(p.title || ''));
  } catch (err) {
    console.warn(`prerender: skipping blog posts — could not load the list (${err.message})`);
    return { count: 0, slugs: [] };
  }

  const slugs = [];
  for (const p of list) {
    // Opening text makes the shell genuinely citable; excerpt-only is the fallback.
    try {
      const full = await fetchJson(`${ORIGIN}/api/blog-post?slug=${encodeURIComponent(p.slug)}`, 12000);
      p.description = full.description || p.excerpt;
      p.body = stripHtml(full.content).slice(0, 1200);
      p.publishedAt = full.publishedAt || p.publishedAt;
      p.tags = full.tags;
      p.category = full.category || p.category;
    } catch {
      /* excerpt-only shell — still far better than a homepage clone */
    }
    const outDir = join(DIST, 'post', p.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), buildPost(template, p), 'utf8');
    slugs.push(p.slug);
  }
  return { count: slugs.length, slugs };
}

/**
 * Rewrite dist/sitemap.xml: add every prerendered post and drop duplicates.
 */
function fixSitemap(postSlugs) {
  const smPath = join(DIST, 'sitemap.xml');
  if (!existsSync(smPath)) return 0;
  const xml = readFileSync(smPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  const keep = [...new Set(locs)];
  for (const slug of postSlugs) keep.push(`${ORIGIN}/post/${slug}`);

  const body = [...new Set(keep)]
    .sort()
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n');
  writeFileSync(smPath, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, 'utf8');
  return [...new Set(keep)].length;
}

/**
 * The 404 shell. Every unmatched path rewrites here (see vercel.json), so it must:
 *  - carry <meta name="robots" content="noindex"> — otherwise every mistyped or stale
 *    URL returns the HOMEPAGE's title and canonical, telling Google there are infinite
 *    copies of the homepage (a "soft 404");
 *  - still load the JS bundle, so if someone adds a React route and forgets to add a
 *    rewrite here, the page STILL WORKS for humans — it just isn't indexed until the
 *    entry is added. Degrade gracefully, never blank-screen.
 */
function build404(template) {
  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Page Not Found | ikonic303</title>');
  html = setTag(html, /<meta\s+name="description"[^>]*>/, "That page doesn't exist. Architectural window film, window graphics, and signage for Denver-area homes and businesses.");
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    '<meta name="robots" content="noindex,follow" />');
  const rootRe = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  const body = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        <h1>Page not found</h1>
        <p>That page doesn't exist. The link may be out of date, or the address slightly off.</p>
        <p><a href="${ORIGIN}/">ikonic303 home</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/blogs">guides</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
        <p>Or call <a href="tel:+17206791230">(720) 679-1230</a>.</p>
      </main>
    `;
  return html.replace(rootRe, `$1${body}$2`);
}

async function main() {
  const templatePath = join(DIST, 'index.html');
  if (!existsSync(templatePath)) {
    console.error(`prerender: ${templatePath} not found — run \`vite build\` first.`);
    process.exit(1);
  }
  const template = readFileSync(templatePath, 'utf8');

  let count = 0;
  for (const route of ROUTES) {
    const outDir = join(DIST, route.path);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'index.html'), buildPage(template, route), 'utf8');
    count++;
  }
  writeFileSync(join(DIST, '404.html'), build404(template), 'utf8');

  const { count: postCount, slugs } = await prerenderPosts(template);
  const smCount = fixSitemap(slugs);

  console.log(
    `prerender: ${count} route shells + 404.html + ${postCount} post shells; sitemap has ${smCount} urls`
  );
}

await main();
