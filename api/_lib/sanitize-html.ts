/**
 * sanitize-html.ts — allowlist HTML sanitizer for scraped blog content.
 *
 * WHY (2026-07-21 security audit): blog-post.ts fetches post HTML from GoHighLevel and
 * "cleaned" it by regex-stripping <script>, <style>, <noscript>, <nav>, <header> and
 * <footer>. That removes ELEMENTS but leaves every ATTRIBUTE vector untouched —
 * `<img src=x onerror=…>`, `<svg onload=…>`, `<iframe src=…>`, `<a href="javascript:…">`,
 * `<form action=…>` all survived, and the result was rendered straight into
 * src/pages/BlogPost.tsx via dangerouslySetInnerHTML AND baked into the prerendered
 * static shells. Anyone who could author a GHL post — a staff account, a compromised
 * GHL session, or GHL itself — got arbitrary JS on the ikonic303.com origin.
 *
 * Sanitizing HERE (server-side) rather than in React covers both the live page and the
 * prerendered shells from one place.
 *
 * DESIGN: allowlist, not blocklist. Unknown tags are unwrapped (children kept, tag
 * dropped); dangerous containers are removed WITH their contents; every attribute is
 * dropped unless explicitly permitted; URLs must be http/https/mailto/relative.
 * Blocklists fail as attackers find new vectors — allowlists fail closed by default.
 *
 * UPGRADE PATH: if this ever needs to handle genuinely hostile input rather than
 * semi-trusted CMS output, replace it with DOMPurify + jsdom. This is deliberately
 * conservative to compensate for being hand-rolled.
 */

/** Tags kept, with their permitted attributes. Everything else is dropped. */
const ALLOWED: Record<string, readonly string[]> = {
  p: [], br: [], hr: [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
  strong: [], b: [], em: [], i: [], u: [], s: [], sub: [], sup: [], small: [],
  ul: [], ol: ['start'], li: [],
  blockquote: ['cite'], pre: [], code: [],
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
  figure: [], figcaption: [],
  table: [], thead: [], tbody: [], tfoot: [], tr: [],
  th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'],
  span: [], div: [], section: [], article: [], main: [], aside: [],
};

/** Removed together with everything inside them. */
const DROP_WITH_CONTENT = new Set([
  'script', 'style', 'noscript', 'iframe', 'object', 'embed', 'applet',
  'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
  'svg', 'math', 'template', 'link', 'meta', 'base', 'title',
  'audio', 'video', 'source', 'track', 'canvas', 'portal', 'frame', 'frameset',
]);

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|#|\.\/|\.\.\/)/i;

/** Reject javascript:, data:, vbscript: — including entity/whitespace-obfuscated forms. */
function safeUrl(raw: string): string | null {
  // Strip HTML entities, control chars and whitespace before judging the scheme, so
  // `java&#115;cript:` and `java\tscript:` cannot sneak past a naive prefix check.
  const normalized = raw
    .replace(/&#(\d+);?/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);?/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/[\u0000-\u0020\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g, '')
    .toLowerCase();

  if (/^(?:javascript|vbscript|data|file|blob):/i.test(normalized)) return null;
  if (!SAFE_URL.test(normalized)) return null;
  return raw.trim();
}

function escapeText(s: string): string {
  return s.replace(/&(?![a-zA-Z#0-9]{1,8};)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Parse an attribute list from inside a start tag. */
function parseAttrs(src: string): [string, string][] {
  const out: [string, string][] = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    out.push([m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? '']);
  }
  return out;
}

export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Strip comments first: they can hide conditional-comment script in old engines and
  // confuse the tag scanner.
  let html = input.replace(/<!--[\s\S]*?-->/g, '');

  const out: string[] = [];
  const openStack: string[] = [];
  let skipDepth = 0;
  let skipTag = '';

  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html))) {
    const [full, rawName, rawAttrs] = m;
    const name = rawName.toLowerCase();
    const isClose = full.startsWith('</');

    // Text before this tag
    const text = html.slice(last, m.index);
    if (!skipDepth && text) out.push(escapeText(text));
    last = m.index + full.length;

    // Inside a dropped container: consume until its matching close.
    if (skipDepth) {
      if (name === skipTag) {
        if (isClose) skipDepth--;
        else skipDepth++;
      }
      continue;
    }

    if (DROP_WITH_CONTENT.has(name)) {
      if (!isClose && !full.endsWith('/>')) {
        skipDepth = 1;
        skipTag = name;
      }
      continue;
    }

    const allowedAttrs = ALLOWED[name];
    if (!allowedAttrs) continue; // unknown tag: unwrap, keep its text

    if (isClose) {
      const i = openStack.lastIndexOf(name);
      if (i !== -1) {
        // Close any tags left open inside it, innermost first.
        for (let j = openStack.length - 1; j >= i; j--) out.push(`</${openStack[j]}>`);
        openStack.splice(i);
      }
      continue;
    }

    const kept: string[] = [];
    for (const [attr, value] of parseAttrs(rawAttrs)) {
      if (!allowedAttrs.includes(attr)) continue; // drops every on*, style, srcset, formaction…
      if (attr === 'href' || attr === 'src' || attr === 'cite') {
        const url = safeUrl(value);
        if (!url) continue;
        kept.push(`${attr}="${escapeAttr(url)}"`);
      } else {
        kept.push(`${attr}="${escapeAttr(value)}"`);
      }
    }

    const voidTag = name === 'br' || name === 'hr' || name === 'img';
    const attrStr = kept.length ? ' ' + kept.join(' ') : '';

    if (voidTag) {
      out.push(`<${name}${attrStr} />`);
    } else {
      // Force external links to be safe to click.
      if (name === 'a') {
        const hasHref = kept.some((k) => k.startsWith('href='));
        if (!hasHref) { openStack.push(name); out.push(`<${name}>`); continue; }
        const rel = ' rel="noopener noreferrer nofollow"';
        const cleaned = kept.filter((k) => !k.startsWith('rel='));
        out.push(`<a ${cleaned.join(' ')}${rel}>`);
      } else {
        out.push(`<${name}${attrStr}>`);
      }
      openStack.push(name);
    }
  }

  const tail = html.slice(last);
  if (!skipDepth && tail) out.push(escapeText(tail));

  // Close anything still open.
  for (let j = openStack.length - 1; j >= 0; j--) out.push(`</${openStack[j]}>`);

  return out.join('');
}
