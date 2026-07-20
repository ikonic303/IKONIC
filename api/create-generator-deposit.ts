/**
 * create-generator-deposit.ts — Square payment link for the AI Website Generator deposit.
 *
 * Flow:
 *   1. Client POSTs their business details here.
 *   2. We mint a one-time token, store it in KV as {status:'pending'} alongside the
 *      Square reference, and return a Square checkout URL.
 *   3. Customer pays. Square redirects back to /ai-website-generator?token=…
 *   4. The client calls /api/verify-generator-deposit, which confirms with Square that
 *      the order is actually PAID and flips the token to {status:'paid'}.
 *   5. /api/generate-website consumes the token — one deposit, one generation.
 *
 * Payment processor is SQUARE (Josh 2026-07-20: "we use square" / "retire stripe add
 * square"). The unmerged feature/ai-website-generator-gating branch built this on
 * Stripe — that branch is retired; do not resurrect it. This reuses the same
 * quick_pay payment-link pattern as api/create-checkout-session.ts.
 *
 * The token is only ever a RECEIPT POINTER — never trust a client-supplied "paid"
 * flag. Status is set from Square's own API in verify-generator-deposit.ts.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { blocked, putToken } from './_lib/guard.js';

const DEPOSIT_USD = Number(process.env.GENERATOR_DEPOSIT_USD || 250);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cheap to spam, so it gets the same front door as the expensive endpoint.
  if (await blocked(req, res, { limit: 5, windowSec: 600, name: 'gen-deposit' })) return;

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    console.error('create-generator-deposit: Square env not configured');
    return res.status(500).json({ error: 'Payment not configured — please call (720) 679-1230.' });
  }

  const { businessName, businessType, email } = req.body || {};
  if (!businessName || !businessType) {
    return res.status(400).json({ error: 'Business name and business type are required' });
  }

  const token = randomUUID();
  const stored = await putToken(token, {
    status: 'pending',
    businessName,
    businessType,
    email: email || null,
    createdAt: new Date().toISOString(),
  });

  // Without KV we cannot enforce one-deposit-one-generation, and an unenforceable
  // token is worse than no feature: it would take money and then be replayable.
  if (!stored) {
    console.error('create-generator-deposit: KV unavailable — refusing to take payment');
    return res.status(503).json({
      error: 'This feature is temporarily unavailable. Please call (720) 679-1230.',
    });
  }

  const base =
    process.env.SQUARE_ENV === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';

  const origin = process.env.SITE_ORIGIN || req.headers.origin || 'https://ikonic303.com';

  try {
    const response = await fetch(`${base}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        quick_pay: {
          name: 'Website Design Concept — deposit',
          price_money: { amount: Math.round(DEPOSIT_USD * 100), currency: 'USD' },
          location_id: locationId,
        },
        checkout_options: {
          redirect_url: `${origin}/ai-website-generator?token=${token}`,
        },
        payment_note: `AI Website Generator deposit — ${businessName}`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Square checkout error');
    }

    // Keep Square's order id so verification can ask Square, not the client.
    await putToken(token, {
      status: 'pending',
      businessName,
      businessType,
      email: email || null,
      orderId: data.payment_link?.order_id || null,
      paymentLinkId: data.payment_link?.id || null,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ url: data.payment_link.url, token });
  } catch (err: any) {
    console.error('create-generator-deposit Square error:', err.message);
    return res.status(500).json({ error: 'Could not start checkout. Please call (720) 679-1230.' });
  }
}
