/**
 * generator-deposit.ts — Square deposit for the AI Website Generator.
 *
 * ONE function handling two actions, dispatched on `action` in the POST body:
 *   { action: 'create', businessName, businessType, email } -> { url, token }
 *   { action: 'verify', token }                             -> { paid, businessName }
 *
 * WHY ONE FILE: Vercel's Hobby plan allows a maximum of 12 Serverless Functions per
 * deployment, and every file in api/ is one function. The project was already at 11.
 * Splitting create/verify into two files pushed it to 13 and the deployment failed
 * with `exceeded_serverless_functions_per_deployment`. Consolidating related actions
 * behind one endpoint is the free fix; the alternative is a paid plan upgrade.
 * ⚠️ The project is now at the 12-function ceiling — any NEW api/*.ts file will break
 * deploys until something is consolidated or the plan changes.
 *
 * FLOW
 *   1. 'create' mints a one-time token, stores it as {status:'pending'} with Square's
 *      order id, and returns a Square checkout URL.
 *   2. Customer pays; Square redirects to /ai-website-generator?token=…
 *   3. 'verify' asks SQUARE whether that order is paid, and only then flips the token
 *      to {status:'paid'}.
 *   4. /api/generate-website consumes the token — one deposit, one generation.
 *
 * The token is only ever a RECEIPT POINTER. A client-supplied "paid" flag, or a
 * ?payment=success query param, proves nothing — it is typed as easily as read. The
 * money question is always answered by the processor.
 *
 * Payments are SQUARE, not Stripe (Josh 2026-07-20: "retire stripe add square"). The
 * unmerged feature/ai-website-generator-gating branch built this on Stripe and is
 * retired — do not resurrect it. Reuses the quick_pay payment-link pattern from
 * api/create-checkout-session.ts.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { blocked, putToken, readToken } from './_lib/guard.js';

const DEPOSIT_USD = Number(process.env.GENERATOR_DEPOSIT_USD || 250);

const squareBase = () =>
  process.env.SQUARE_ENV === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

const squareHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  'Square-Version': '2024-01-18',
  'Content-Type': 'application/json',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const action = (req.body?.action as string) || 'create';

  if (action === 'verify') return verify(req, res);
  return create(req, res);
}

/** Mint a token + Square checkout link. */
async function create(req: VercelRequest, res: VercelResponse) {
  if (await blocked(req, res, { limit: 5, windowSec: 600, name: 'gen-deposit' })) return;

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    console.error('generator-deposit: Square env not configured');
    return res.status(500).json({ error: 'Payment not configured — please call (720) 679-1230.' });
  }

  const { businessName, businessType, email } = req.body || {};
  if (!businessName || !businessType) {
    return res.status(400).json({ error: 'Business name and business type are required' });
  }

  const token = randomUUID();
  const base = {
    status: 'pending' as const,
    businessName,
    businessType,
    email: email || null,
    createdAt: new Date().toISOString(),
  };

  // Without Redis we cannot enforce one-deposit-one-generation, and an unenforceable
  // token is worse than no feature: it would take money and then be replayable.
  if (!(await putToken(token, base))) {
    console.error('generator-deposit: token store unavailable — refusing to take payment');
    return res.status(503).json({
      error: 'This feature is temporarily unavailable. Please call (720) 679-1230.',
    });
  }

  const origin = process.env.SITE_ORIGIN || req.headers.origin || 'https://ikonic303.com';

  try {
    const response = await fetch(`${squareBase()}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: squareHeaders(accessToken),
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        quick_pay: {
          name: 'Website Design Concept — deposit',
          price_money: { amount: Math.round(DEPOSIT_USD * 100), currency: 'USD' },
          location_id: locationId,
        },
        checkout_options: { redirect_url: `${origin}/ai-website-generator?token=${token}` },
        payment_note: `AI Website Generator deposit — ${businessName}`,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.errors?.[0]?.detail || 'Square checkout error');

    // Keep Square's order id so verification can ask Square, not the client.
    await putToken(token, {
      ...base,
      orderId: data.payment_link?.order_id || null,
      paymentLinkId: data.payment_link?.id || null,
    });

    return res.status(200).json({ url: data.payment_link.url, token });
  } catch (err: any) {
    console.error('generator-deposit Square error:', err.message);
    return res.status(500).json({ error: 'Could not start checkout. Please call (720) 679-1230.' });
  }
}

/** Ask Square whether the order was actually paid, then mark the token paid. */
async function verify(req: VercelRequest, res: VercelResponse) {
  if (await blocked(req, res, { limit: 20, windowSec: 600, name: 'gen-verify' })) return;

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const record = await readToken(token);
  if (!record) {
    return res.status(404).json({ error: 'Unknown or expired deposit. Please start again.' });
  }

  // Idempotent so a refresh after payment doesn't 4xx a paying customer.
  if (record.status === 'paid') {
    return res.status(200).json({ paid: true, businessName: record.businessName });
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken || !record.orderId) {
    return res
      .status(503)
      .json({ error: 'Cannot verify payment right now. Please call (720) 679-1230.' });
  }

  try {
    const r = await fetch(`${squareBase()}/v2/orders/${record.orderId}`, {
      headers: squareHeaders(accessToken),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.errors?.[0]?.detail || 'Square order lookup failed');

    const order = data.order || {};
    const paid =
      order.state === 'COMPLETED' ||
      (order.tenders || []).some((t: any) => t.card_details?.status === 'CAPTURED');

    if (!paid) return res.status(200).json({ paid: false, state: order.state || 'UNKNOWN' });

    await putToken(token, { ...record, status: 'paid', paidAt: new Date().toISOString() });
    return res.status(200).json({ paid: true, businessName: record.businessName });
  } catch (err: any) {
    console.error('generator-deposit verify error:', err.message);
    return res.status(500).json({ error: 'Could not verify payment. Please call (720) 679-1230.' });
  }
}
