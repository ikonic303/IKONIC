import type { VercelRequest, VercelResponse } from '@vercel/node';
import { blocked } from './_lib/guard.js';

/**
 * Server-side relay for proof lifecycle events into GoHighLevel.
 *
 * WHY (2026-07-21 security audit): the GHL webhook-trigger URL was hardcoded in
 * ProofClient.tsx and ProofManager.tsx and fired directly from the browser. For an
 * inbound GHL webhook the URL *is* the credential — and it shipped in the public JS
 * bundle AND in the public repo. Anyone could POST unlimited forged `proof_approved` /
 * `proof_revision` payloads into the Ikonic location, polluting contacts, creating false
 * approval records, and triggering whatever workflow sits behind it. Given this account's
 * history of workflows auto-firing SMS and email, that is a customer-facing send risk,
 * not just data noise.
 *
 * The URL now lives in GHL_PROOF_WEBHOOK_URL (Vercel env) and never reaches the client.
 *
 * ⚠️ THE OLD TRIGGER IS BURNED. It has been public since 2026-04-16 and is in the git
 * history of a public repo — moving it server-side does not un-publish it. Create a NEW
 * webhook trigger in GHL, put it in GHL_PROOF_WEBHOOK_URL, and DELETE the old one.
 */

const ALLOWED_EVENTS = new Set(['proof_created', 'proof_approved', 'proof_revision']);
const MAX_FIELD = 300;

function clean(v: unknown, max = MAX_FIELD): string {
  return v === null || v === undefined ? '' : String(v).slice(0, max);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (await blocked(req, res, { limit: 20, windowSec: 600, name: 'proof-webhook', flag: 'PROOF_WEBHOOK_ENABLED' })) {
    return;
  }

  const url = process.env.GHL_PROOF_WEBHOOK_URL;
  if (!url) {
    // Fail quietly for the caller but loudly in the logs: a missing webhook must not
    // break a client's ability to approve their proof.
    console.error('proof-webhook: GHL_PROOF_WEBHOOK_URL is not set — event dropped');
    return res.status(200).json({ ok: true, delivered: false });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const event = clean(body.event, 40);
  if (!ALLOWED_EVENTS.has(event)) {
    return res.status(400).json({ error: 'Unknown event' });
  }

  // Forward an allowlisted, length-capped shape — never the caller's raw object. This
  // is what stops the relay being used to inject arbitrary fields into GHL workflows.
  const payload = {
    event,
    proof_id: clean(body.proof_id, 64),
    token: clean(body.token, 64),
    client_name: clean(body.client_name, 120),
    client_email: clean(body.client_email, 254),
    project_name: clean(body.project_name, 200),
    status: clean(body.status, 40),
    revision_note: clean(body.revision_note, 1000),
  };

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!upstream.ok) console.error('proof-webhook: GHL returned', upstream.status);
    return res.status(200).json({ ok: true, delivered: upstream.ok });
  } catch (err) {
    console.error('proof-webhook: delivery failed:', err);
    return res.status(200).json({ ok: true, delivered: false });
  }
}
