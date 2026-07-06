// ─────────────────────────────────────────────────────────────────────────────
// Abuse-protection helpers for the AI Website Generator funnel.
//
// This file lives under api/_lib and is NOT a Vercel Serverless Function
// (underscore-prefixed paths are ignored by the routing layer). It is imported
// by the real endpoints (create-deposit-session, generate-website).
//
// Covers: kill-switch, Cloudflare Turnstile verification, honeypot, per-IP /
// per-session rate limiting, and atomic one-time-use claims backed by Vercel KV.
// ─────────────────────────────────────────────────────────────────────────────
import type { VercelRequest } from '@vercel/node';
import { kv } from '@vercel/kv';

/**
 * Hard kill-switch. Set GENERATOR_ENABLED=0 to disable the entire funnel
 * (deposit creation AND generation) before any other work happens.
 * Anything other than the literal "0" leaves the generator enabled.
 */
export function isGeneratorEnabled(): boolean {
  return process.env.GENERATOR_ENABLED !== '0';
}

/** Best-effort client IP from the standard proxy headers. */
export function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return fwd[0].trim();
  return (req.socket?.remoteAddress as string) || 'unknown';
}

/**
 * Cloudflare Turnstile server-side verification.
 *
 * Behaviour:
 *  - If TURNSTILE_SECRET_KEY is not configured, returns true (staging: the
 *    widget is not wired yet). TODO: once the key is set in every environment,
 *    tighten this to fail closed even when the env var is missing.
 *  - If configured, a missing/invalid token fails closed (returns false).
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not yet configured — see TODO above
  if (!token) return false;

  try {
    const form = new URLSearchParams();
    form.append('secret', secret);
    form.append('response', token);
    if (ip && ip !== 'unknown') form.append('remoteip', ip);

    const resp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = (await resp.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Network/verification error — fail closed so bots can't slip through on error.
    return false;
  }
}

/**
 * Honeypot check. The form ships a hidden field that real users never fill in.
 * Any non-empty value indicates a scripted/bot submission.
 */
export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Fixed-window rate limiter backed by KV.
 * Returns true if the request is ALLOWED, false if the limit is exceeded.
 * Fails OPEN on KV errors (availability over strictness for rate limiting only —
 * the security-critical one-time-use claim below fails CLOSED instead).
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  try {
    const count = await kv.incr(key);
    if (count === 1) await kv.expire(key, windowSec);
    return count <= limit;
  } catch {
    return true;
  }
}

/**
 * Atomically claim a one-time token (e.g. a paid Stripe session id) so a given
 * session can only ever drive ONE successful generation.
 *
 * Returns true if THIS caller won the claim, false if it was already claimed.
 * Throws on KV failure so callers can fail closed (never generate when we can't
 * guarantee single-use).
 */
export async function claimOnce(key: string, ttlSec: number): Promise<boolean> {
  const result = await kv.set(key, '1', { nx: true, ex: ttlSec });
  return result === 'OK';
}

/** Release a claim made with claimOnce (used to allow retry after a transient failure). */
export async function releaseClaim(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch {
    /* best effort */
  }
}
