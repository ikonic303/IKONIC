import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';

/**
 * unpublish.ts — take a post off the blog without destroying it.
 *
 * WHY IT EXISTS: posts live in Redis and there was no way to remove one. The blog
 * accumulated content that doesn't belong on ikonic303.com — articles written for
 * CLIENTS (deck building, sprinkler winterizing, concrete, lawns for Brighton
 * homeowners). ikonic does marketing for service businesses; publishing a client's
 * subject matter here dilutes that positioning and does nothing for the client, whose
 * own site should be earning those rankings.
 *
 * It sets status:'unpublished' rather than deleting the record. The listing filters on
 * status === 'published', so the post disappears from the blog, the sitemap and the
 * prerendered shells — but the content is still there and one call puts it back.
 * Deleting published content outright is not the kind of thing that should be one
 * typo away.
 *
 * AUTH: Bearer CRON_SECRET (or ?secret=). Same key that guards generation — this
 * changes what the public sees and must never be open.
 */

/**
 * Constant-time secret comparison.
 * ADDED 2026-07-21: `!==` on a secret leaks length and prefix through timing. Not
 * practically exploitable across the public internet, but this is one line.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) {
    return res.status(503).json({ error: 'Not configured' });
  }
  // HEADER ONLY (2026-07-21 security audit). The ?secret= path was removed: a secret in
  // a URL lands in Vercel access logs, browser history, and any Referer sent by the
  // rendered page. call it with an Authorization header, not a query string.
  const authHeader = (req.headers['authorization'] as string) || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!provided || !secretMatches(provided, cronSecret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return res.status(503).json({ error: 'Store not configured' });

  const upstash = async (command: unknown[]) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    });
    return r.json();
  };

  // Accept one slug or many, so a cleanup sweep is a single call.
  const raw = (req.body?.slugs ?? req.body?.slug ?? req.query?.slug) as string | string[] | undefined;
  const slugs = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(Boolean);
  if (!slugs.length) return res.status(400).json({ error: 'slug or slugs required' });

  const restore = req.body?.restore === true || req.query?.restore === '1';
  const results: Record<string, string> = {};

  for (const slug of slugs) {
    try {
      const d = await upstash(['GET', `blog:post:${slug}`]);
      if (!d.result) {
        results[slug] = 'not-found';
        continue;
      }
      const post = JSON.parse(d.result);
      post.status = restore ? 'published' : 'unpublished';
      post.statusChangedAt = new Date().toISOString();
      await upstash(['SET', `blog:post:${slug}`, JSON.stringify(post)]);
      results[slug] = restore ? 'republished' : 'unpublished';
    } catch (err) {
      results[slug] = `error: ${(err as Error).message}`;
    }
  }

  return res.status(200).json({ ok: true, results });
}
