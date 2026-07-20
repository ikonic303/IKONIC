import type { VercelRequest, VercelResponse } from '@vercel/node';

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
export async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) {
    return res.status(503).json({ error: 'Not configured' });
  }
  const authHeader = (req.headers['authorization'] as string) || '';
  const querySecret = (req.query?.secret as string) || '';
  if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
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
