import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { blocked } from './_lib/guard.js';
import { priceOrder } from './_lib/pricing.js';

/**
 * Square checkout for Print & Ship.
 *
 * REWRITTEN 2026-07-21 (security audit). The previous version did:
 *
 *   const { total, description, successUrl } = req.body;
 *   if (!total || total <= 0) ...
 *   quick_pay: { name: description, price_money: { amount: Math.round(total * 100) } }
 *
 * i.e. it let the CALLER set the price, the line-item name, and the redirect target on
 * the live Ikonic Square merchant account. That is not just a discount bug — it let any
 * stranger mint a payment link for any amount with any description ("Invoice #4471 —
 * Roofing deposit") and use it to defraud third parties, with the proceeds landing in
 * Josh's account: chargebacks, fraud review, possible freeze.
 *
 * Now: the client sends a SPEC, the server prices it (api/_lib/pricing.ts), and the
 * redirect is pinned to our own origin. No value that touches money comes from the body.
 */

/** Only ever redirect back to somewhere we own. */
function safeReturnUrl(req: VercelRequest): string {
  const configured = process.env.SITE_ORIGIN || 'https://ikonic303.com';
  return `${configured.replace(/\/+$/, '')}/print-and-ship?payment=success`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Minting payment links is a spend-adjacent action; cap it per client.
  if (await blocked(req, res, { limit: 5, windowSec: 600, name: 'checkout', flag: 'CHECKOUT_ENABLED' })) {
    return;
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    return res.status(500).json({ error: 'Payment not configured' });
  }

  // Price is DERIVED, never received. priceOrder throws on anything malformed or
  // out of bounds; a bad spec is a 400, not a mispriced order.
  let priced;
  try {
    priced = priceOrder(req.body?.spec ?? req.body);
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Invalid order' });
  }

  const base =
    process.env.SQUARE_ENV === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';

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
          name: priced.description,
          price_money: { amount: Math.round(priced.total * 100), currency: 'USD' },
          location_id: locationId,
        },
        checkout_options: { redirect_url: safeReturnUrl(req) },
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.payment_link?.url) {
      // Log the upstream detail; never return it. Square errors quote internal state
      // and quota information that a caller has no business seeing.
      console.error('Square checkout error:', JSON.stringify(data?.errors || data));
      return res.status(502).json({ error: 'Could not start checkout. Please call (720) 679-1230.' });
    }

    return res.status(200).json({ url: data.payment_link.url, total: priced.total });
  } catch (err: any) {
    console.error('Square error:', err?.message);
    return res.status(502).json({ error: 'Could not start checkout. Please call (720) 679-1230.' });
  }
}
