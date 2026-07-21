import type { VercelRequest, VercelResponse } from '@vercel/node';
import { blocked } from './_lib/guard.js';

/**
 * Public Google reviews feed for the testimonials section.
 *
 * HARDENED 2026-07-21 (security audit). There was NO method check. The
 * `Cache-Control: s-maxage=3600` below is the only thing standing between this handler
 * and Google's billing, and Vercel's CDN only caches GET/HEAD — so every POST bypassed
 * the cache and made a live Place Details call including the `reviews` field, which is
 * Google's most expensive Places SKU (~$17 per 1,000). An unauthenticated loop of POSTs
 * was a five-figure Google Cloud bill with nothing to stop it.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET/HEAD only — anything else misses the CDN cache and bills us per call.
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cache misses still reach Google, so cap per-client volume as well.
  if (await blocked(req, res, { limit: 30, windowSec: 3600, name: 'reviews', flag: 'REVIEWS_ENABLED' })) {
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return res.status(500).json({ error: 'Google Places not configured' });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      // Log the upstream status; don't return it. Google's status strings disclose
      // quota/billing state (REQUEST_DENIED, OVER_QUERY_LIMIT) — useful to an attacker
      // probing whether the key is exhausted, useless to a visitor.
      console.error('Google Places error:', data.status, data.error_message || '');
      return res.status(502).json({ error: 'Reviews unavailable' });
    }

    const reviews = (data.result.reviews || [])
      .filter((r: any) => r.rating >= 4)
      .map((r: any) => ({
        name: r.author_name,
        avatar: r.profile_photo_url,
        rating: r.rating,
        text: r.text,
        time: r.relative_time_description,
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({
      reviews,
      rating: data.result.rating,
      total: data.result.user_ratings_total,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
