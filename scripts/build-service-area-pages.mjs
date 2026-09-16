/**
 * build-service-area-pages.mjs — one static service-area page per Front Range municipality.
 *
 * WHY THESE ARE STATIC HTML, NOT SPA ROUTES
 * Same reason as scripts/prerender-routes.mjs: crawlers and AI answer engines that do not run
 * JavaScript must receive real, page-specific HTML. These pages ship complete — title,
 * description, canonical, OG/Twitter, JSON-LD (Service + FAQPage + BreadcrumbList) and a full
 * body — with no JS required to read a word of them.
 *
 * WHY EVERY PAGE IS DIFFERENT
 * 86 near-identical city pages is a doorway-page pattern and Google treats it as scaled content
 * abuse. Every paragraph below is driven by data that is actually different per town and is
 * sourced, not invented: 2020 census population and county (U.S. Census via the Wikipedia
 * municipality table), coordinates (MediaWiki geo API), ground elevation in feet (USGS National
 * Map EPQS), great-circle distance and compass bearing from Wheat Ridge, and the three genuinely
 * nearest municipalities in the set. See data/front-range-towns.json for provenance.
 *
 * TRUTH RULES BAKED IN — do not relax without Josh:
 *  - residential window film only. No commercial, no signage, no vehicle work of any kind.
 *  - NO prices, and no film recommendation by name. Every page says the glass is identified and
 *    checked against the manufacturer's compatibility chart before a quote exists.
 *  - no street address on any page (address freeze). Phone + email + "Wheat Ridge, Colorado".
 *  - scheduling language is tiered by real distance. Towns outside the routine radius say so
 *    instead of implying same-week service.
 *
 * The four hand-written pages in HANDWRITTEN are never overwritten.
 *
 * Run: node scripts/build-service-area-pages.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', 'service-areas');
const ORIGIN = 'https://ikonic303.com';
const PHONE = '(720) 679-1230';
const TEL = '+17206791230';
const EMAIL = 'info@ikonic303.com';
const HANDWRITTEN = new Set(['wheat-ridge', 'arvada', 'lakewood', 'golden']);

const { towns } = JSON.parse(readFileSync(join(ROOT, 'data', 'front-range-towns.json'), 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = (n) => n.toLocaleString('en-US');

/* ---------- shared chrome, lifted verbatim from the hand-written pages ---------- */
const CHROME = readFileSync(join(OUT, 'golden.html'), 'utf8');
const STYLE = CHROME.slice(CHROME.indexOf('  <style>'), CHROME.indexOf('</style>') + 8);
const NAV = CHROME.slice(CHROME.indexOf('<canvas id="matrix">'), CHROME.indexOf('  <div class="wrap">'));
const FOOT = CHROME.slice(CHROME.indexOf('<footer class="site-footer">'), CHROME.indexOf('</body>'));

/* ---------- per-town copy, driven by real values ---------- */
const countyPhrase = (t) => {
  const c = t.counties.filter((x) => x !== t.name);
  if (c.length === 0) return `${t.name} is its own consolidated city and county`;
  if (c.length === 1) return `${t.name} sits in ${c[0]} County`;
  return `${t.name} straddles ${c.slice(0, -1).join(', ')} and ${c[c.length - 1]} counties`;
};

const sizePhrase = (t) =>
  ({
    village: `a town of about ${nf(t.pop)} people at the 2020 census`,
    small: `a community of roughly ${nf(t.pop)} residents`,
    mid: `home to about ${nf(t.pop)} people`,
    city: `a city of roughly ${nf(t.pop)}`,
    large: `one of the largest cities on the Front Range, with about ${nf(t.pop)} residents`,
  })[t.size];

const bandLead = (t) =>
  ({
    mountain: `At about ${nf(t.elev_ft)} feet, ${t.name} gets thinner air and harder light than the metro floor below it. Glass that faces open sky up here takes a beating: rooms overheat fast in the afternoon and floors and fabric fade sooner than owners expect.`,
    foothills: `${t.name} sits against the first rise of the foothills at roughly ${nf(t.elev_ft)} feet, and west-facing glass takes the full late-afternoon sun coming back off the slope.`,
    divide: `${t.name} sits high on the Palmer Divide at about ${nf(t.elev_ft)} feet, where open exposure and long sightlines mean very little shades the glass.`,
    plains: `${t.name} sits east of the mountains at about ${nf(t.elev_ft)} feet, with open ground on most sides and little natural shade — sun reaches the windows early and stays on them late.`,
    north: `${t.name} sits in the northern Front Range at about ${nf(t.elev_ft)} feet, where newer subdivisions with a lot of glass share streets with older homes that have very different windows.`,
    central: `${t.name} sits in the central Denver metro at about ${nf(t.elev_ft)} feet, close enough to the mountains that afternoon sun arrives low and straight into west-facing rooms.`,
  })[t.band];

const elevNote = (t) =>
  `Ultraviolet exposure climbs with altitude, and ${t.name}'s ground elevation of roughly ${nf(t.elev_ft)} feet is well above sea level — which is a large part of why hardwood, rugs, upholstery, and artwork fade faster here than the same furniture would somewhere lower. UV-blocking film is usually the least visible change a homeowner can make to a window and one of the most useful.`;

const tierNote = (t) => {
  const d = `about ${Math.round(t.mi)} miles ${t.dir} of our Wheat Ridge base`;
  if (t.tier === 'core')
    return `${t.name} is ${d}, inside the area ikonic works in every week. Estimates and installs here schedule the same way as our home city.`;
  if (t.tier === 'metro')
    return `${t.name} is ${d}, well within the Denver-metro area ikonic covers. Estimates and installs are scheduled normally; we'll give you the realistic window when you call.`;
  if (t.tier === 'extended')
    return `${t.name} is ${d}. That is outside the metro we drive daily, so ${t.name} work is booked by appointment, usually grouped with other jobs in the same direction, and travel is shown as its own line on the estimate rather than buried in the film price.`;
  return `${t.name} is ${d} — a long way outside the Denver metro ikonic covers routinely. We do take work this far out, but only by arrangement and typically for whole-home jobs where the drive makes sense for both of us. Call and ask before assuming a date; travel is quoted as its own line.`;
};

const asks = (t) => {
  const base = [
    `heat and glare on west- and south-facing living rooms`,
    `UV film to stop floors, rugs, and furniture from fading`,
    `daytime privacy on street-facing and ground-floor glass`,
    `frosted and decorative film for bathrooms, sidelights, and interior glass`,
    `security and safety film on patio doors and ground-floor windows`,
  ];
  const extra =
    t.band === 'mountain'
      ? `Up here the fade question comes up first — high-altitude light is hard on anything it lands on.`
      : t.band === 'plains'
        ? `Out here the ask is usually heat and glare, because there is nothing between the window and the sun.`
        : t.size === 'large' || t.size === 'city'
          ? `In a ${t.name}-sized city we see the full mix, from a single hot room to a whole-house job.`
          : `In a community this size most jobs start with one or two rooms that became unusable in the afternoon, then grow from there.`;
  return { base, extra };
};

const faqs = (t) => {
  const c = t.counties.filter((x) => x !== t.name);
  const area = c.length ? `${c[0]} County` : t.name;
  const list = [
    {
      q: `Do you install residential window tinting in ${t.name}?`,
      a:
        t.tier === 'core' || t.tier === 'metro'
          ? `Yes. ${t.name} is about ${Math.round(t.mi)} miles ${t.dir} of ikonic's Wheat Ridge base and is part of the Denver-metro area we cover. Homes only — ikonic installs residential window film.`
          : `Yes, by appointment. ${t.name} is about ${Math.round(t.mi)} miles ${t.dir} of ikonic's Wheat Ridge base, outside the metro we drive daily, so ${t.name} jobs are scheduled ahead and travel is quoted as its own line on the estimate.`,
    },
    {
      q: `How do you decide which film goes on our windows?`,
      a: `Window by window. We identify the glass in your home first and check it against the film manufacturer's compatibility chart before anything is quoted — some films are not safe on some glass, and that check comes before the price, not after it.`,
    },
    {
      q: `Will tinted windows make our rooms dark?`,
      a: `Not necessarily. Heat rejection and visible darkness are separate choices, and most homeowners here end up with film that reads close to clear from inside. We show you the trade-off per window rather than putting one film on the whole house.`,
    },
    t.band === 'mountain' || t.elev_ft >= 6000
      ? {
          q: `Does elevation actually change anything?`,
          a: `Yes. UV intensity rises with altitude, and ${t.name} sits at roughly ${nf(t.elev_ft)} feet. That is why fading on floors and furniture is a more common complaint here than the same homeowner would have had at a lower elevation.`,
        }
      : {
          q: `Can you do just one or two rooms?`,
          a: `Yes. Plenty of ${t.name} jobs start with the one west-facing room nobody uses after 3 p.m. There is a minimum for a visit, which we'll tell you plainly when you call, and the estimate is free either way.`,
        },
    {
      q: `What does a ${t.name} estimate involve?`,
      a: `A visit to the house. We look at the actual windows, measure, identify the glass, check compatibility, and send one written quote. No charge, and no obligation.`,
    },
  ];
  return list;
};

const nearbyLinks = (t) => {
  const inSet = t.nearest.map((n) => n);
  return inSet.map((n) => `<a href="/service-areas/${n.slug}">${esc(n.name)}</a>`).join('');
};

function page(t) {
  const title = `Residential Window Tinting in ${t.name}, CO | ikonic`;
  const desc = `Residential window tinting in ${t.name}, Colorado — home window film for heat and glare, UV and fade protection, privacy, decorative, and security film. Free in-home estimate. Call ${PHONE}.`;
  const url = `${ORIGIN}/service-areas/${t.slug}`;
  const F = faqs(t);
  const A = asks(t);

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Residential Window Tinting',
      name: `Residential Window Tinting in ${t.name}, CO`,
      description: `ikonic installs residential window film for homes in ${t.name}, Colorado — heat and glare reduction, UV and fade protection, privacy film, decorative film, and security film. Glass is checked against the film manufacturer's compatibility chart before any quote.`,
      areaServed: {
        '@type': 'City',
        name: t.name,
        address: { '@type': 'PostalAddress', addressLocality: t.name, addressRegion: 'CO', addressCountry: 'US' },
        geo: { '@type': 'GeoCoordinates', latitude: t.lat, longitude: t.lon },
      },
      provider: { '@id': `${ORIGIN}/#business` },
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: F.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ikonic', item: ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Service Areas', item: `${ORIGIN}/service-areas` },
        { '@type': 'ListItem', position: 3, name: t.name, item: url },
      ],
    },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
  <link rel="canonical" href="${url}" />
  <meta name="geo.region" content="US-CO" />
  <meta name="geo.placename" content="${esc(t.name)}, Colorado" />
  <meta name="geo.position" content="${t.lat};${t.lon}" />
  <meta name="ICBM" content="${t.lat}, ${t.lon}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="ikonic" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${ORIGIN}/logo-ikonic.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${ORIGIN}/logo-ikonic.webp" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
${ld.map((o) => `  <script type="application/ld+json">\n  ${JSON.stringify(o)}\n  </script>`).join('\n')}
${STYLE}
</head>
<body>
${NAV}  <div class="wrap">
    <nav aria-label="Breadcrumb" style="font-size:13px;color:var(--muted);margin-bottom:6px">
      <a href="/">ikonic</a> &rsaquo; <a href="/service-areas">Service Areas</a> &rsaquo; <span>${esc(t.name)}</span>
    </nav>
    <main>
      <h1>Residential Window Tinting in ${esc(t.name)}, CO</h1>
      <p class="lead">${bandLead(t)} ikonic installs home window film for ${esc(t.name)} houses — heat and glare cut at the glass, up to 99% UV protection, privacy, and security film — chosen window by window.</p>
      <div class="hero-ctas">
        <a class="callbtn" href="/contact">Get a Free In-Home Estimate</a>
        <a class="callbtn ghost" href="tel:${TEL}">Call ${PHONE}</a>
      </div>

      <h2>Home window film in ${esc(t.name)}</h2>
      <p>${countyPhrase(t)} and is ${sizePhrase(t)}. Whatever the house, the job starts the same way: we identify the glass in each opening and check it against the film manufacturer's compatibility chart before a quote exists. Some films are not safe on some glass, and that is a question to answer before the price, not after. The full process is on the <a href="/window-tint">residential window tinting page</a>.</p>

      <h2>Sun at ${nf(t.elev_ft)} feet</h2>
      <p>${elevNote(t)}</p>

      <h2>What ${esc(t.name)} homeowners ask for most</h2>
      <p>${A.extra} The usual list: ${A.base.join('; ')}. See <a href="/window-tint/solar-heat">solar and heat-rejection film</a>, <a href="/window-tint/uv-protection">UV and fade protection</a>, <a href="/window-tint/privacy">privacy film</a>, <a href="/window-tint/decorative-privacy">decorative and frosted film</a>, and <a href="/window-tint/security-film">security and safety film</a>.</p>

      <h2>Scheduling and travel to ${esc(t.name)}</h2>
      <p>${tierNote(t)}</p>

      <h2>FAQ — window tinting in ${esc(t.name)}</h2>
${F.map((f) => `      <div class="faq-item"><h3>${esc(f.q)}</h3>\n        <p>${f.a}</p></div>`).join('\n')}

      <h2>Getting started</h2>
      <p>A free in-home estimate is the starting point. We look at the actual windows in your ${esc(t.name)} home, check the glass against the compatibility chart, and send one clear written quote — no pressure, no package you did not ask for. Call <a href="tel:${TEL}">${PHONE}</a> or email <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>

      <h2>Our services</h2>
      <div class="related"><a href="/window-tint">Residential Window Tinting</a><a href="/window-tint/solar-heat">Solar &amp; Heat-Rejection Film</a><a href="/window-tint/uv-protection">UV &amp; Fade Protection Film</a><a href="/window-tint/privacy">Privacy Window Film</a><a href="/window-tint/decorative-privacy">Decorative &amp; Privacy Film</a><a href="/window-tint/security-film">Security &amp; Safety Film</a></div>

      <h2>Nearby service areas</h2>
      <div class="related">${nearbyLinks(t)}<a href="/service-areas">All service areas</a><a href="/contact">Contact ikonic</a></div>

      <div class="cta">
        <strong>Residential window film in ${esc(t.name)}, installed by ikonic.</strong>
        <p><a class="callbtn" href="/contact">Get a Free In-Home Estimate</a>
        &nbsp; <a class="callbtn ghost" href="tel:${TEL}">Call ${PHONE}</a></p>
      </div>

    </main>
  </div>
${FOOT}</body>
</html>
`;
}

/* ---------- hub ---------- */
function hub() {
  const byCounty = {};
  for (const t of towns) {
    const key = t.counties.filter((c) => c !== t.name)[0] || `${t.name} (city and county)`;
    (byCounty[key] ||= []).push(t);
  }
  const counties = Object.keys(byCounty).sort();
  const title = 'Service Areas | Residential Window Tinting Across the Colorado Front Range | ikonic';
  const desc = `ikonic installs residential window tinting across the Colorado Front Range — ${towns.length} cities and towns from Fort Collins to Pueblo, based in Wheat Ridge. Free in-home estimate.`;
  const url = `${ORIGIN}/service-areas`;
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description: desc,
      url,
      about: { '@id': `${ORIGIN}/#business` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: towns.length,
        itemListElement: towns.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Residential Window Tinting in ${t.name}, CO`,
          url: `${ORIGIN}/service-areas/${t.slug}`,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ikonic', item: ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Service Areas', item: url },
      ],
    },
  ];
  const tierRows = (tier, label, note) => {
    const list = towns.filter((t) => t.tier === tier).sort((a, b) => a.mi - b.mi);
    if (!list.length) return '';
    return `      <h3>${label}</h3>
      <p style="color:var(--muted);font-size:14px;margin-top:0">${note}</p>
      <div class="related">${list.map((t) => `<a href="/service-areas/${t.slug}">${esc(t.name)}</a>`).join('')}</div>\n`;
  };
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="ikonic" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${ORIGIN}/logo-ikonic.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
${ld.map((o) => `  <script type="application/ld+json">\n  ${JSON.stringify(o)}\n  </script>`).join('\n')}
${STYLE}
</head>
<body>
${NAV}  <div class="wrap">
    <main>
      <h1>Where ikonic installs residential window film</h1>
      <p class="lead">ikonic is a Wheat Ridge, Colorado window film company. We install residential window tinting in homes across the Colorado Front Range — ${towns.length} incorporated cities and towns, from the northern corridor down through the Denver metro and the Palmer Divide to the southern Front Range.</p>
      <div class="hero-ctas">
        <a class="callbtn" href="/contact">Get a Free In-Home Estimate</a>
        <a class="callbtn ghost" href="tel:${TEL}">Call ${PHONE}</a>
      </div>

      <h2>How far we travel, said plainly</h2>
      <p>Distance is real and we would rather be straight about it than promise a next-day visit two hours away. Towns are grouped below by actual driving distance from our Wheat Ridge base. Travel, when it applies, appears as its own line on the estimate — never hidden inside the film price.</p>

${tierRows('core', 'Core area — within about 15 miles', 'Scheduled the same way as our home city.')}
${tierRows('metro', 'Denver metro — about 15 to 35 miles', 'Regular coverage; normal scheduling.')}
${tierRows('extended', 'Extended Front Range — about 35 to 75 miles', 'By appointment, usually grouped with other jobs in the same direction. Travel is quoted separately.')}
${tierRows('outer', 'Outer Front Range — beyond about 75 miles', 'By arrangement only, and typically for whole-home jobs. Call and ask before assuming a date.')}

      <h2>By county</h2>
${counties
  .map(
    (c) =>
      `      <h3>${esc(c)}${c.includes('(') ? '' : ' County'}</h3>\n      <div class="related">${byCounty[c]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((t) => `<a href="/service-areas/${t.slug}">${esc(t.name)}</a>`)
        .join('')}</div>`,
  )
  .join('\n')}

      <h2>What we install, everywhere on this list</h2>
      <p>Residential window film only — homes, not businesses and not vehicles. Solar and heat-rejection film, up to 99% UV and fade protection, daytime privacy film, decorative and frosted film, and security and safety film. Every job begins by identifying the glass and checking it against the film manufacturer's compatibility chart before a quote is written.</p>
      <div class="related"><a href="/window-tint">Residential Window Tinting</a><a href="/window-tint/solar-heat">Solar &amp; Heat-Rejection Film</a><a href="/window-tint/uv-protection">UV &amp; Fade Protection Film</a><a href="/window-tint/privacy">Privacy Window Film</a><a href="/window-tint/decorative-privacy">Decorative &amp; Privacy Film</a><a href="/window-tint/security-film">Security &amp; Safety Film</a></div>

      <div class="cta">
        <strong>Not sure your town is on the list? Ask.</strong>
        <p><a class="callbtn" href="/contact">Get a Free In-Home Estimate</a>
        &nbsp; <a class="callbtn ghost" href="tel:${TEL}">Call ${PHONE}</a></p>
      </div>
    </main>
  </div>
${FOOT}</body>
</html>
`;
}

/* ---------- write ---------- */
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
let written = 0,
  skipped = 0;
for (const t of towns) {
  if (HANDWRITTEN.has(t.slug)) {
    skipped++;
    continue;
  }
  writeFileSync(join(OUT, `${t.slug}.html`), page(t), 'utf8');
  written++;
}
writeFileSync(join(OUT, 'index.html'), hub(), 'utf8');
console.log(`service-areas: ${written} generated, ${skipped} hand-written preserved, 1 hub → public/service-areas/`);
