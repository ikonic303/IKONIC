import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeHtml } from '../sanitize-html.js';

const GHL_BASE_URL    = 'https://go.ikonicmarketing303.com';
const GHL_PREVIEW_LOC = 'ZFg6wMxjGeRh7lGwtZDW';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveNuxtArr(arr: any[], idx: number, depth = 0): any {
  if (depth > 20 || idx === -1 || idx === null || idx === undefined) return null;
  if (typeof idx !== 'number' || idx >= arr.length) return idx;
  const val = arr[idx];
  if (typeof val === 'string' || typeof val === 'boolean' || val === null) return val;
  if (typeof val === 'number') return resolveNuxtArr(arr, val, depth + 1);
  if (Array.isArray(val)) return val.map((i: any) => (typeof i === 'number' ? resolveNuxtArr(arr, i, depth + 1) : i));
  if (typeof val === 'object') {
    const obj: any = {};
    for (const [k, v] of Object.entries(val)) {
      obj[k] = typeof v === 'number' ? resolveNuxtArr(arr, v as number, depth + 1) : v;
    }
    return obj;
  }
  return val;
}

function parseNuxtData(html: string): any[] | null {
  const match = html.match(/__NUXT_DATA__">\[(.+?)\]<\/script/s);
  if (!match) return null;
  try { return JSON.parse('[' + match[1] + ']'); } catch { return null; }
}

// ── Preview-page content scrape ───────────────────────────────────────────────

async function fetchFromPreview(slug: string): Promise<{ content: string; debug: any[] }> {
  const debug: any[] = [];
  const url = `https://app.gohighlevel.com/v2/preview/${GHL_PREVIEW_LOC}/post-preview/${slug}`;

  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    debug.push({ step: 'preview_fetch', status: res.status, url });

    if (!res.ok) return { content: '', debug };

    const html = await res.text();
    debug.push({ step: 'preview_html_length', length: html.length });

    // Strip non-content nodes
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      // Remove elements with nav/menu class names
      .replace(/<div[^>]+class="[^"]*(?:navbar|nav-bar|nav-menu|main-menu|site-menu|mobile-menu|hamburger|menu-open|header-nav)[^"]*"[\s\S]*?<\/div>/gi, '')
      // Remove the GHL preview close/nav bar (contains × and nav links)
      .replace(/<[^>]+>[^<]*×[^<]*(?:Home|About|Services|Contact)[^<]*<\/[^>]+>/gi, '')
      .replace(/<div[^>]*>[^<]*×\s*<\/div>/gi, '');

    // 1) Try <article> tag
    const articleMatch = stripped.match(/<article[\s\S]*?<\/article>/i);
    if (articleMatch) {
      const text = articleMatch[0].replace(/<[^>]*>/g, '').trim();
      if (text.length > 200) {
        debug.push({ step: 'article_tag', length: articleMatch[0].length });
        return { content: articleMatch[0], debug };
      }
    }

    // 2) Try <main> tag
    const mainMatch = stripped.match(/<main[\s\S]*?<\/main>/i);
    if (mainMatch) {
      const text = mainMatch[0].replace(/<[^>]*>/g, '').trim();
      if (text.length > 200) {
        debug.push({ step: 'main_tag', length: mainMatch[0].length });
        return { content: mainMatch[0], debug };
      }
    }

    // 3) Try common GHL blog content wrapper classes
    for (const cls of ['blog-post-content', 'post-content', 'blog-content', 'article-content', 'entry-content', 'hl-blog-post']) {
      const re = new RegExp(`<div[^>]+class="[^"]*${cls}[^"]*"[\\s\\S]*?</div>`, 'i');
      const m = stripped.match(re);
      if (m && m[0].replace(/<[^>]*>/g, '').trim().length > 200) {
        debug.push({ step: 'class_match', cls, length: m[0].length });
        return { content: m[0], debug };
      }
    }

    // 4) Collect all meaningful block-level elements
    const blocks: string[] = [];
    const blockRe = /<(h[1-6]|p|ul|ol|blockquote|figure)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(stripped)) !== null) {
      const inner = m[0].replace(/<[^>]*>/g, '').trim();
      // Skip nav-looking blocks: contain × symbol or are just link sequences
      if (inner.length > 15 && !inner.includes('×') && !/^(Home|About|Services|Contact)/.test(inner)) {
        blocks.push(m[0]);
      }
    }

    if (blocks.length > 0) {
      const joined = blocks.join('\n');
      debug.push({ step: 'blocks_collected', count: blocks.length, totalLength: joined.length });
      return { content: joined, debug };
    }

    debug.push({ step: 'no_content_found' });
    return { content: '', debug };
  } catch (e: any) {
    debug.push({ step: 'preview_error', error: e.message });
    return { content: '', debug };
  }
}

// ── Redis helper ─────────────────────────────────────────────────────────────

async function getRedisPost(slug: string) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['GET', `blog:post:${slug}`]),
    });
    const data = await res.json();
    if (!data.result) return null;
    const post = JSON.parse(data.result);
    if (post.status !== 'published') return null;
    const wordCount = post.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    return {
      title: post.title,
      description: post.excerpt,
      // SANITIZED 2026-07-21: this HTML is rendered via dangerouslySetInnerHTML in
      // src/pages/BlogPost.tsx and baked into the prerendered shells. See sanitize-html.ts.
      content: sanitizeHtml(post.content),
      urlSlug: post.slug,
      image: '',
      imageAlt: '',
      author: post.author,
      publishedAt: post.publishedAt,
      category: post.category,
      tags: post.tags,
      readTime: Math.max(1, Math.round(wordCount / 200)),
    };
  } catch {
    return null;
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug, _debug } = req.query;
  if (!slug || typeof slug !== 'string') return res.status(400).json({ error: 'slug required' });

  // Check Redis-published posts first
  const redisPost = await getRedisPost(slug);
  if (redisPost) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(redisPost);
  }

  try {
    const listingHtml = await fetch(`${GHL_BASE_URL}/blogs`, { headers: { 'User-Agent': UA } }).then(r => r.text());

    const arr = parseNuxtData(listingHtml);
    if (!arr) return res.status(502).json({ error: 'Could not parse blog listing data' });

    const stateStr = JSON.stringify(arr);
    const blogKeyMatch = stateStr.match(/"blogPosts-[^"]+":(\d+)/);
    if (!blogKeyMatch) return res.status(502).json({ error: 'blogPosts key not found' });

    const blogData = resolveNuxtArr(arr, parseInt(blogKeyMatch[1]));
    const rawPosts: any[] = blogData?.blogPosts ?? [];
    const post = rawPosts.find((p: any) => p.urlSlug === slug);

    if (!post) return res.status(404).json({
      error: 'Post not found',
      requestedSlug: slug,
      availableSlugs: rawPosts.map((p: any) => p.urlSlug),
    });

    const { content, debug } = await fetchFromPreview(slug);

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      title: post.title ?? '',
      description: post.description ?? '',
      // The regex "cleaning" in fetchFromPreview removes ELEMENTS but leaves every
      // ATTRIBUTE vector (onerror=, javascript: hrefs, iframes). Sanitize here, at the
      // single point where scraped HTML leaves the handler.
      content: sanitizeHtml(content),
      urlSlug: post.urlSlug ?? '',
      image: post.imageUrl ?? '',
      imageAlt: post.imageAltText ?? '',
      author: post.author?.name ?? 'Ikonic Team',
      publishedAt: post.publishedAt ?? '',
      category: post.categories?.[0]?.label?.replace(/-/g, ' ') ?? 'Marketing',
      tags: post.tags ?? [],
      readTime: post.readTimeInMinutes ? Math.ceil(post.readTimeInMinutes) : null,
      ...(_debug === '1' ? { _debug: { slug, debug } } : {}),
    });
  } catch (err: any) {
    // Log the detail; return a generic message. Upstream errors quote internal
    // endpoints and upstream status that a visitor has no business seeing.
    console.error('blog-post error:', err?.message ?? err);
    return res.status(500).json({ error: 'Failed to load post' });
  }
}
