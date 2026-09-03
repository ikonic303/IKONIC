/**
 * Shared "is this blog post off-topic?" test, used by the list handler
 * (blog-posts.ts) and the single-post handler (blog-post.ts) so digital-marketing
 * posts disappear from /blogs and 404 at /post/:slug without needing a Redis
 * unpublish. Mirrors the filters in scripts/prerender-routes.mjs
 * (VEHICLE_CATEGORIES + OFF_TOPIC_SLUG_RE) which already keep these out of the
 * sitemap and crawler shells.
 *
 * 2026-08-29: retired digital marketing / SEO / ads / CRM / web-design content.
 * 2026-09-04: site repositioned to residential window tinting; signage &
 *             wayfinding categories retired too (existing posts kept — see
 *             prerender-routes.mjs — but new ones are not generated).
 *
 * The generator (auto-blog-generate.ts) no longer produces any of these; this is
 * defense-in-depth for the ~14 marketing posts (and any stragglers) still sitting
 * in Redis / scraped from the GHL blog.
 */

const OFF_TOPIC_CATEGORIES = new Set(
  [
    'digital marketing',
    'marketing',
    'lead generation',
    'lead gen',
    'seo',
    'local seo',
    'sem',
    'ppc',
    'paid ads',
    'advertising',
    'crm',
    'crm automation',
    'marketing automation',
    'sales funnel',
    'funnels',
    'web design',
    'website',
    'reputation',
    'reputation management',
    'reviews',
    'speed to lead',
    'email marketing',
    // vehicle content, retired earlier
    'commercial wraps',
    'vehicle protection',
    'vehicle wraps',
  ].map((s) => s.toLowerCase()),
);

const OFF_TOPIC_SLUG_RE =
  /(^|-)(marketing|gohighlevel|ghl|crm|seo|sem|ppc|funnel|funnels|lead-|leads-|lead-gen|lead-generation|automation|chatbot|ai-voice|retarget|ad-|ads-|advertising|google-ads|meta-ads|facebook-ads|newsletter|email-marketing|reputation|reviews?-automation|website-|web-design|sales-funnel|missed-call|speed-to-lead)(-|$)/i;

export function isOffTopicPost(p: {
  slug?: string | null;
  title?: string | null;
  category?: string | null;
}): boolean {
  const cat = (p.category || '').trim().toLowerCase();
  if (cat && OFF_TOPIC_CATEGORIES.has(cat)) return true;
  if (OFF_TOPIC_SLUG_RE.test(p.slug || '')) return true;
  if (OFF_TOPIC_SLUG_RE.test(p.title || '')) return true;
  return false;
}
