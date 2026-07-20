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

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
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
      // KV blipped — fall through to memory rather than failing the request outright.
      console.error('rateLimit: KV unavailable, using in-memory fallback:', err);
    }
  }

  const hits = (memHits.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  memHits.set(key, hits);
  if (memHits.size > 5000) memHits.clear(); // crude bound; this is a backstop, not a store
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
  opts: { limit: number; windowSec: number; name: string }
): Promise<boolean> {
  if (!isEnabled()) {
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
