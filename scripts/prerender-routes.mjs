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
const CONTACT_BLOCK = `<h2>Get a quote</h2>
<p>Call <a href="tel:+17206791230">${PHONE}</a> or email
<a href="mailto:info@ikonicmarketing303.com">info@ikonicmarketing303.com</a>.
ikonic — 4880 Robb St. #8, Wheat Ridge, CO 80033. Vehicle wraps are installed in our
Wheat Ridge shop by drop-off appointment; building and storefront signage is installed
on-site.</p>`;

/** @type {{path:string,title:string,description:string,body:string}[]} */
const ROUTES = [
  {
    path: '/about',
    title: 'About ikonic303 | Denver Digital Marketing Agency',
    description:
      'Meet the ikonic303 team. Denver-based digital marketing agency specializing in GoHighLevel automation, CRM setup, and lead generation for Colorado businesses.',
    body: `<h1>About ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic is a brand-transformation company for local service businesses in the Denver metro.
We design, print, and install commercial vehicle and fleet wraps, storefront signage and window
graphics, and wayfinding and ADA/safety signage — and we run AI-powered digital marketing
retainers for the same kind of business.</p>
<p>The through-line is consistency: a customer should see the same brand, at the same level of
quality, on your truck, on your building, and in their search results. Most shops do one of
those three. We do all of them under one roof in Wheat Ridge.</p>`,
  },
  {
    path: '/services',
    title: 'Digital Marketing Services Denver CO | ikonic303',
    description:
      'Full-service digital marketing for Denver businesses — web design, GoHighLevel CRM automation, reputation management, speed-to-lead, and marketing systems. All under one roof.',
    body: `<h1>ikonic services — Denver, Colorado</h1>
<p>Two sides of one business: the physical brand and the digital front office.</p>
<h2>Brand &amp; signage</h2>
<p>Commercial and fleet vehicle wraps, color changes, storefront and building signage, window
graphics and storefront branding, wayfinding and ADA/safety signage. Vehicle work is installed
in our Wheat Ridge shop by drop-off appointment; building signage is installed on-site.</p>
<h2>Digital marketing</h2>
<p>Web design and sales funnels, CRM automation, speed-to-lead response, reputation and review
generation, SEO and AEO, and monthly reporting — delivered as a flat monthly retainer.</p>`,
  },
  {
    path: '/contact',
    title: 'Contact ikonic303 | Free Strategy Call — Denver, CO',
    description:
      'Book your free marketing strategy session with ikonic303. Denver-based GoHighLevel experts ready to build your lead generation system. Call (720) 679-1230.',
    body: `<h1>Contact ikonic303 — Wheat Ridge, Colorado</h1>
<p>Talk to us about a vehicle wrap, storefront signage, or a marketing retainer for your local
service business. We serve the Denver metro including Wheat Ridge, Arvada, Lakewood, and
Golden.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/blogs',
    title: 'Digital Marketing Blog | Tips for Denver Businesses | ikonic303',
    description:
      'Marketing tips, GoHighLevel guides, and growth strategies for Denver-area businesses. Learn how to automate leads, improve your reputation, and scale your business.',
    body: `<h1>ikonic guides — marketing for local service businesses</h1>
<p>Practical guides on marketing a local service business in the Denver metro: capturing and
responding to leads, generating reviews, getting found in search and in AI answers, and what
branding actually costs. Written for owners, not marketers.</p>`,
  },
  {
    path: '/branded-to-win',
    title: 'Branded to Win Book by Joshua Soderblom | ikonic303',
    description:
      'Get the Branded to Win book — the complete guide to building a business brand that attracts customers, generates leads, and dominates your local market. Digital & bundle editions available.',
    body: `<h1>Branded to Win — by Joshua Soderblom</h1>
<p><em>Branded to Win</em> is ikonic founder Joshua Soderblom's guide to building a local brand
that brings customers in: how a service business earns recognition in its own market, why
consistency across vehicle, storefront, and search beats a bigger ad budget, and how to
compound that recognition instead of renting it.</p>
<p>Available in digital and bundle editions.</p>`,
  },
  {
    path: '/careers',
    title: 'Careers at ikonic303 | Join Our Denver Marketing Team',
    description:
      "Join the ikonic303 team in Denver, CO. We're hiring driven marketers, GoHighLevel specialists, and automation experts. Build your career in digital marketing.",
    body: `<h1>Careers at ikonic303 — Wheat Ridge, Colorado</h1>
<p>ikonic hires for the shop and for the marketing side: vinyl installers, designers, and
marketing and automation specialists. We are a small team in Wheat Ridge that values doing the
work right over doing it fast.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/learn-more',
    title: 'How It Works | Marketing Automation for Denver Businesses | ikonic303',
    description:
      'Learn how ikonic303 builds automated lead generation systems for Denver businesses. Our proven 4-step process captures leads 24/7 while you focus on your business.',
    body: `<h1>How ikonic works</h1>
<p>Every lead gets captured, answered fast, followed up with until they respond, and tracked
through to the job. Most local service businesses lose revenue in the gap between a customer
reaching out and someone getting back to them — that gap is what we close first, then we build
the rest of the marketing on top of it.</p>`,
  },
  {
    path: '/services/web-design',
    title: 'Web Design & Sales Funnels Denver CO | ikonic303',
    description:
      'Custom websites and high-converting GoHighLevel sales funnels for Denver businesses. Mobile-responsive, conversion-optimized, built by GHL experts. Get a free quote.',
    body: `<h1>Web design &amp; sales funnels — Denver, Colorado</h1>
<p>Websites and funnels built to turn visitors into booked jobs: mobile-first, fast, and wired
into the CRM so every enquiry lands somewhere it will be answered. Built and maintained for
local service businesses across the Denver metro.</p>`,
  },
  {
    path: '/services/crm-automation',
    title: 'GoHighLevel CRM Setup & Automation Denver CO | ikonic303',
    description:
      'Expert GoHighLevel CRM setup and automation for Colorado businesses. Automate follow-ups, nurture leads, and close more deals. Free CRM audit available.',
    body: `<h1>CRM setup &amp; automation — Denver, Colorado</h1>
<p>Your customer list, pipeline, and follow-up in one place, automated: every lead tagged and
routed, follow-up that runs without anyone remembering to send it, and a pipeline that shows
what is actually going to close this month.</p>`,
  },
  {
    path: '/services/reputation',
    title: 'Reputation Management & Google Reviews Denver CO | ikonic303',
    description:
      'Build your 5-star reputation and dominate Google Maps. Automated review collection, Google Business Profile optimization, and local SEO for Denver businesses.',
    body: `<h1>Reputation &amp; Google reviews — Denver, Colorado</h1>
<p>Reviews are the single strongest local ranking and trust signal a service business has. We
ask every finished customer at the right moment, route unhappy ones to you privately first, and
keep your Google Business Profile accurate and complete.</p>`,
  },
  {
    path: '/services/speed-to-lead',
    title: 'Speed to Lead Automation Denver CO | ikonic303',
    description:
      'Respond to leads in under 60 seconds with automated SMS and email follow-up. Never lose a lead again. Speed-to-lead automation for Colorado businesses.',
    body: `<h1>Speed to lead — Denver, Colorado</h1>
<p>Most local service leads go to whoever answers first. We answer for you in under a minute,
day or night, then keep following up until the customer replies — so the job does not go to the
competitor who happened to pick up.</p>`,
  },
  {
    path: '/services/marketing',
    title: 'Digital Marketing Systems & Automation Denver CO | ikonic303',
    description:
      'Full-service digital marketing for Colorado businesses — social media, paid ads (Google & Facebook), email automation, and analytics dashboards. Fill your pipeline on autopilot.',
    body: `<h1>Marketing systems — Denver, Colorado</h1>
<p>The full front office on a flat monthly retainer: search and AI visibility, Google Business
Profile, social, paid ads when they earn their keep, email and SMS follow-up, and a monthly
report that shows what came in and what it was worth.</p>`,
  },
  {
    path: '/wrap-calculator',
    title: 'Commercial Vehicle Wrap Cost Calculator Denver | ikonic303',
    description:
      'Get an instant vehicle wrap price estimate for your business vehicle. Our free wrap calculator covers cars, trucks, vans, and trailers. Serving Denver and Colorado.',
    body: `<h1>Vehicle wrap cost calculator</h1>
<p>Estimate what wrapping your work vehicle involves — cars, trucks, vans, and trailers, full or
partial coverage, single vehicle or a fleet. Wraps are installed in our Wheat Ridge shop by
drop-off appointment.</p>
${CONTACT_BLOCK}`,
  },
  {
    path: '/print-ship',
    title: 'Print & Ship Vinyl Wraps Denver | ikonic303',
    description:
      'Order custom-printed vinyl wraps and have them shipped directly to you. Professional print quality for vehicle wraps, banners, and signage. Serving Denver and Colorado.',
    body: `<h1>Print &amp; ship vinyl</h1>
<p>Custom-printed vinyl wraps, banners, and signage printed to spec and shipped to you or your
installer — the same print quality we install in our own shop, for shops and businesses outside
the Denver metro.</p>`,
  },
  {
    path: '/lost-call-calculator',
    title:
      'Missed Call Revenue Calculator | How Much Are Lost Calls Costing You? | ikonic303',
    description:
      'Find out how much revenue your business loses from missed calls. Use our free calculator and see how missed call text-back automation can recover that revenue instantly.',
    body: `<h1>Missed call revenue calculator</h1>
<p>Work out what unanswered calls cost your business each month. Every missed call at a local
service business is a customer who is already calling the next name on the list — this puts a
number on it, and shows what automatic text-back recovers.</p>`,
  },
  {
    path: '/sticker-builder',
    title: 'Custom Sticker Builder — Design & Order Online | ikonic303',
    description:
      'Design and order custom stickers online. Choose your shape, size, material, and finish — die-cut, kiss-cut, bumper stickers, and more. Fast shipping across Colorado and the US.',
    body: `<h1>Custom sticker builder</h1>
<p>Design and order custom stickers online — die-cut, kiss-cut, and bumper stickers in your
choice of shape, size, material, and finish. Printed by ikonic in Wheat Ridge, Colorado and
shipped nationwide.</p>`,
  },
  {
    path: '/ai-website-generator',
    title: 'AI Website Generator | Free Custom Website Design Concept | ikonic303',
    description:
      "Answer a few questions and let Ikonic's AI create a custom website design concept for your business — layout, copy, sections, colors, and a design direction ready to build.",
    body: `<h1>AI website generator</h1>
<p>Answer a few questions about your business and get a custom website design concept back —
layout, sections, copy direction, and colors — as a starting point you can build from or hand
to us to build for you.</p>`,
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replace the content of a meta/link tag matched by `attrRe`, preserving the rest of the tag. */
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
  html = setTag(html, /<meta\s+name="description"[^>]*>/, "That page doesn't exist. Vehicle wraps, signage and marketing for Denver businesses.");
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    '<meta name="robots" content="noindex,follow" />');
  const rootRe = /(<div id="root">)[\s\S]*?(<\/div>\s*(?:<script|<\/body>))/;
  const body = `
      <main style="max-width:820px;margin:0 auto;padding:2rem 1.25rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#e8e8e8;background:#0b0b0f">
        <h1>Page not found</h1>
        <p>That page doesn't exist. The link may be out of date, or the address slightly off.</p>
        <p><a href="${ORIGIN}/">ikonic303 home</a> ·
           <a href="${ORIGIN}/services">services</a> ·
           <a href="${ORIGIN}/wrap-calculator">wrap calculator</a> ·
           <a href="${ORIGIN}/blogs">guides</a> ·
           <a href="${ORIGIN}/contact">contact</a></p>
        <p>Or call <a href="tel:+17206791230">(720) 679-1230</a>.</p>
      </main>
    `;
  return html.replace(rootRe, `$1${body}$2`);
}

function main() {
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
  console.log(`prerender: wrote ${count} route shells + 404.html into dist/`);
}

main();
