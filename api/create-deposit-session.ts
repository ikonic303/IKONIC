import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createDepositSession } from './_lib/stripe';
import {
  isGeneratorEnabled,
  getClientIp,
  verifyTurnstile,
  isHoneypotTripped,
  rateLimit,
} from './_lib/security';

// ─────────────────────────────────────────────────────────────────────────────
// Creates the $250 deposit Checkout Session for the AI Website Generator.
//
// Guards (in order) BEFORE any Stripe call:
//   1. Kill-switch (GENERATOR_ENABLED=0)  -> 503
//   2. Honeypot                           -> 400
//   3. Cloudflare Turnstile               -> 403
//   4. Per-IP rate limit                  -> 429
//   5. Qualified budget tier              -> 403 (unqualified never sees checkout)
//
// The unqualified tier ("not-sure") must route to book-a-call on the client and
// never reach this endpoint; we defend it server-side regardless.
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 15;

/** Budget tiers that unlock the paid deposit flow. Must match the client. */
const QUALIFIED_TIERS = new Set(['website-build', 'growth-system']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Kill-switch — checked before anything else.
  if (!isGeneratorEnabled()) {
    return res.status(503).json({ error: 'The website generator is temporarily unavailable.' });
  }

  const { budgetTier, email, honeypot, turnstileToken } = (req.body || {}) as {
    budgetTier?: string;
    email?: string;
    honeypot?: string;
    turnstileToken?: string;
  };

  const ip = getClientIp(req);

  // 2. Honeypot — silently blocks scripted submits.
  if (isHoneypotTripped(honeypot)) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  // 3. Turnstile.
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return res.status(403).json({ error: 'Verification failed. Please retry.' });
  }

  // 4. Rate limit — cap deposit-session creation per IP.
  if (!(await rateLimit(`rl:deposit:${ip}`, 10, 60 * 60))) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  // 5. Only qualified tiers may reach checkout.
  if (!budgetTier || !QUALIFIED_TIERS.has(budgetTier)) {
    return res.status(403).json({ error: 'This selection does not qualify for online checkout.' });
  }

  const origin = (req.headers.origin as string) || `https://${req.headers.host}`;

  try {
    const session = await createDepositSession({ origin, budgetTier, email });
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('create-deposit-session error:', err?.message);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
