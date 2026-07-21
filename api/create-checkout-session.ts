import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * ⛔ DISABLED 2026-07-21 (security audit) — TEMPORARY.
 *
 * The previous implementation took `total`, `description` and `successUrl`
 * straight from the request body and handed them to Square's payment-links API:
 *
 *   const { total, description, successUrl } = req.body;
 *   if (!total || total <= 0) { ...400... }
 *   quick_pay: { name: description, price_money: { amount: Math.round(total * 100) } }
 *
 * The price is computed in the BROWSER (src/pages/PrintAndShip.tsx) and was
 * trusted verbatim. Two consequences, the second worse than the first:
 *
 *   1. Anyone could buy a $900 print job for $0.01.
 *   2. Anyone could mint an ARBITRARY payment link on the live Ikonic Square
 *      merchant account — any amount, any description — and use it to defraud
 *      third parties, with the money landing in Josh's account. That means
 *      chargebacks, fraud review, and a possible account freeze.
 *
 * `successUrl` was unvalidated too, turning the real Square checkout page into
 * an open redirect.
 *
 * This endpoint stays 503 until server-side pricing lands: the handler must
 * accept a product SPEC, compute the price itself from a server-owned table,
 * and never read an amount from the client.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(503).json({
    error:
      'Checkout is temporarily unavailable. Please call (720) 679-1230 and we will take your order directly.',
  });
}
