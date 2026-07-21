/**
 * guard.ts — spend protection for public AI endpoints.
 *
 * WHY: /api/generate-website is public and unauthenticated, and every valid request
 * calls Gemini. Before this, there was no kill switch, no rate limit and no bot
 * protection — anyone who found the endpoint could loop it and bill us for every call.
 * These helpers cap that exposure.
 *
 * DESIGN NOTE — fail CLOSED on spend, fail OPEN on availability:
 *  - Kill switch missing/unset => enabled (don't break the site on a config typo).
 *  - Rate-limit backend unavailable => fall back to in-memory, and if even that can't
 *    be trusted, DENY. A request we can't account for is a request we don't pay for.
 * The asymmetry is deliberate: an over-eager block costs one lead, an unbounded loop
 * costs money with no ceiling.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/kv';

// This project stores its Redis creds under the UPSTASH_* names (Vercel KV is Upstash
// underneath, same REST protocol), while @vercel/kv's default export expects KV_*.
// Accept either so no new service has to be provisioned.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const kv = REDIS_URL && REDIS_TOKEN ? createClient({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

/**
 * Hard kill switch. Set GENERATOR_ENABLED=0 in Vercel to disable instantly with no
 * deploy. Any other value (or unset) leaves the feature on.
 */
export function isEnabled(flag = 'GENERATOR_ENABLED'): boolean {
  return process.env[flag] !== '0';
}

/**
 * Client IP behind Vercel's proxy.
 *
 * HARDENED 2026-07-21 (security audit). This used to read the FIRST element of
 * `x-forwarded-for`. That is the attacker-controlled position: a proxy chain APPENDS,
 * so the leftmost value is whatever the caller typed. Sending a random XFF on every
 * request gave each request its own rate-limit bucket, which silently defeated every
 * limit in this file — including the 3/hour on the Gemini endpoint that exists purely
 * to stop an unbounded bill.
 *
 * Order of trust:
 *  1. `x-vercel-forwarded-for` — set by Vercel's edge, not settable by the client.
 *  2. `x-real-ip` — likewise platform-set.
 *  3. the LAST element of `x-forwarded-for` — the hop nearest us, the only element a
 *     remote caller cannot prepend to.
 *  4. the socket address.
 */
export function clientIp(req: VercelRequest): string {
  const first = (v: string | string[] | undefined): string =>
    (Array.isArray(v) ? v[0] : v || '').trim();

  const vercelIp = first(req.headers['x-vercel-forwarded-for']);
  if (vercelIp) return vercelIp.split(',')[0].trim();

  const realIp = first(req.headers['x-real-ip']);
  if (realIp) return realIp;

  const fwd = first(req.headers['x-forwarded-for']);
  if (fwd) {
    const hops = fwd.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }

  return (req.socket?.remoteAddress || 'unknown').trim();
}

/** In-memory fallback. Per-instance only — Vercel may run several, so this is a
 *  backstop that narrows the blast radius, not a precise limiter. KV is the real one. */
const memHits = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

/**
 * Sliding-window rate limit. Uses Vercel KV when configured so the limit holds across
 * instances; otherwise degrades to per-instance memory.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  if (kv) {
    try {
      const k = `rl:${key}`;
      const count = await kv.incr(k);
      if (count === 1) await kv.expire(k, windowSec);
      const ttl = await kv.ttl(k);
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        retryAfter: ttl > 0 ? ttl : windowSec,
      };
    } catch (err) {
      // HARDENED 2026-07-21: KV is CONFIGURED but erroring. The file header promises
      // "if even that can't be trusted, DENY" — the old code instead fell through to a
      // per-instance memory map, which under Vercel's per-request instances degrades to
      // roughly no limit at all. If the accounting store we chose is broken, we refuse
      // the request rather than pay for one we cannot count.
      console.error('rateLimit: KV unavailable — failing CLOSED:', err);
      return { allowed: false, remaining: 0, retryAfter: 30 };
    }
  }

  // No KV configured at all (local dev / preview). Per-instance backstop.
  const hits = (memHits.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  memHits.set(key, hits);
  // Evict only EXPIRED keys. The old code called memHits.clear() at 5000 entries, wiping
  // everyone's counters at once — trivially triggerable, and it reset the limiter for
  // every caller each time it fired.
  if (memHits.size > 5000) {
    for (const [k, ts] of memHits) {
      const live = ts.filter((t) => now - t < windowMs);
      if (live.length) memHits.set(k, live);
      else memHits.delete(k);
    }
  }
  return {
    allowed: hits.length <= limit,
    remaining: Math.max(0, limit - hits.length),
    retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000),
  };
}

/**
 * One-time-use tokens (deposit receipts). KV-backed; without KV we cannot guarantee
 * single use across instances, so issuing is refused rather than issuing something
 * forgeable-by-replay.
 */
export const TOKEN_TTL_SEC = 60 * 60 * 24 * 7; // 7 days to come back and generate

export async function putToken(token: string, value: Record<string, unknown>): Promise<boolean> {
  if (!kv) return false;
  try {
    await kv.set(`gen:${token}`, JSON.stringify(value), { ex: TOKEN_TTL_SEC });
    return true;
  } catch (err) {
    console.error('putToken failed:', err);
    return false;
  }
}

export async function readToken(token: string): Promise<Record<string, any> | null> {
  if (!kv) return null;
  try {
    const raw = await kv.get(`gen:${token}`);
    if (!raw) return null;
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as Record<string, any>);
  } catch (err) {
    console.error('readToken failed:', err);
    return null;
  }
}

/** Atomically consume a token so one deposit buys exactly one generation. */
export async function consumeToken(token: string): Promise<boolean> {
  if (!kv) return false;
  try {
    const deleted = await kv.del(`gen:${token}`);
    return deleted === 1;
  } catch (err) {
    console.error('consumeToken failed:', err);
    return false;
  }
}

/**
 * Standard front door for a public AI endpoint: kill switch + per-IP rate limit.
 * Returns true when the handler should stop (a response has already been sent).
 */
export async function blocked(
  req: VercelRequest,
  res: VercelResponse,
  opts: { limit: number; windowSec: number; name: string; flag?: string }
): Promise<boolean> {
  // `flag` added 2026-07-21: non-generator endpoints (checkout, reviews, notify) reuse this
  // limiter but must NOT be killed by GENERATOR_ENABLED=0 — flipping the generator off should
  // not silently stop the shop taking orders. Defaults to the original behaviour.
  if (!isEnabled(opts.flag)) {
    res.status(503).json({
      error: 'This feature is temporarily unavailable. Please call (720) 679-1230.',
    });
    return true;
  }

  const rl = await rateLimit(`${opts.name}:${clientIp(req)}`, opts.limit, opts.windowSec);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(rl.retryAfter));
    res.status(429).json({
      error: 'Too many requests. Please try again shortly, or call (720) 679-1230.',
    });
    return true;
  }

  return false;
}
