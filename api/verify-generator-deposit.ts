/**
 * verify-generator-deposit.ts — confirm a deposit with SQUARE, not with the browser.
 *
 * The client returns from Square with ?token=… . That token proves only that a
 * checkout was STARTED. This asks Square whether the order was actually paid, and
 * only then flips the stored token to {status:'paid'} so /api/generate-website will
 * honour it.
 *
 * Never trust a client-side "payment=success" query param — it is trivially forged by
 * typing it into the URL bar. The money question is always answered by the processor.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { blocked, readToken, putToken } from './_lib/guard';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (await blocked(req, res, { limit: 20, windowSec: 600, name: 'gen-verify' })) return;

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const record = await readToken(token);
  if (!record) {
    return res.status(404).json({ error: 'Unknown or expired deposit. Please start again.' });
  }

  // Already verified — idempotent so a refresh after payment doesn't 4xx the customer.
  if (record.status === 'paid') {
    return res.status(200).json({ paid: true, businessName: record.businessName });
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken || !record.orderId) {
    return res.status(503).json({ error: 'Cannot verify payment right now. Please call (720) 679-1230.' });
  }

  const base =
    process.env.SQUARE_ENV === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';

  try {
    const r = await fetch(`${base}/v2/orders/${record.orderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18',
        'Content-Type': 'application/json',
      },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.errors?.[0]?.detail || 'Square order lookup failed');

    const order = data.order || {};
    // Square marks a completed quick_pay order COMPLETED with tenders settled.
    const paid =
      order.state === 'COMPLETED' ||
      (order.tenders || []).some((t: any) => t.card_details?.status === 'CAPTURED');

    if (!paid) {
      return res.status(200).json({ paid: false, state: order.state || 'UNKNOWN' });
    }

    await putToken(token, { ...record, status: 'paid', paidAt: new Date().toISOString() });
    return res.status(200).json({ paid: true, businessName: record.businessName });
  } catch (err: any) {
    console.error('verify-generator-deposit error:', err.message);
    return res.status(500).json({ error: 'Could not verify payment. Please call (720) 679-1230.' });
  }
}
