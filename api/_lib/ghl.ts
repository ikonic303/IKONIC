// ─────────────────────────────────────────────────────────────────────────────
// GoHighLevel (GHL / LeadConnector) integration for the AI Website Generator.
//
// Two responsibilities:
//   1. Agreement gate  — verify the Marvin/GHL website-build service agreement
//      is signed before generation is allowed (P2).
//   2. Lead routing    — on a successful generation, upsert the contact and open
//      an opportunity in the IKONIC SALES pipeline (P4), honoring TCPA SMS
//      consent.
//
// Not a Vercel function (under api/_lib) — imported by generate-website.
//
// REQUIRED ENV (set in Vercel; see .env.example):
//   GHL_API_TOKEN            Private integration / API token with contacts +
//                            opportunities + documents scopes.
//   GHL_PIPELINE_ID          Id of the "IKONIC SALES" pipeline.          (TODO)
//   GHL_PIPELINE_STAGE_ID    Id of the target stage in that pipeline.    (TODO)
//   GHL_AGREEMENT_TEMPLATE_ID  Id of the website-build document template. (TODO)
// ─────────────────────────────────────────────────────────────────────────────
import { kv } from '@vercel/kv';

/** Fixed sub-account (location) for all AI Website Generator leads. */
export const GHL_LOCATION_ID = 'DSt3GeDVV0wQXQt9iuGn';

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function ghlHeaders(): Record<string, string> {
  const token = process.env.GHL_API_TOKEN;
  if (!token) throw new Error('GHL_API_TOKEN not configured');
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ── P2: Agreement gate ───────────────────────────────────────────────────────

/**
 * Whether the Marvin/GHL website-build service agreement is signed for this
 * deposit session.
 *
 * Verification strategy (in order):
 *   1. A signing webhook (GHL Documents "signed" event) writes a KV flag
 *      `signed:session:<stripeSessionId>` — the fast, authoritative path.
 *      TODO: build the /api webhook that receives the GHL Documents event and
 *      sets this flag (needs the real webhook payload shape + signature secret).
 *   2. TODO: direct GHL Documents API lookup by contact + GHL_AGREEMENT_TEMPLATE_ID
 *      as a fallback (needs the documents endpoint + token scope confirmed).
 *
 * Staging escape hatch: AGREEMENT_ENFORCED=0 treats every session as signed so
 * Josh can exercise the paid→generate path before the document flow is wired.
 * Defaults to ENFORCED (fails closed) when unset.
 */
export async function isAgreementSigned(stripeSessionId: string): Promise<boolean> {
  try {
    const flag = await kv.get(`signed:session:${stripeSessionId}`);
    if (flag) return true;
  } catch {
    /* fall through to enforcement decision */
  }

  // TODO: replace with a real GHL Documents signature lookup once the endpoint
  // and GHL_AGREEMENT_TEMPLATE_ID are confirmed.

  if (process.env.AGREEMENT_ENFORCED === '0') return true;
  return false;
}

/** Mark an agreement as signed for a session (used by the future signing webhook). */
export async function markAgreementSigned(stripeSessionId: string, ttlSec = 60 * 60 * 24 * 30): Promise<void> {
  await kv.set(`signed:session:${stripeSessionId}`, '1', { ex: ttlSec });
}

// ── P4: Lead routing ─────────────────────────────────────────────────────────

export interface LeadContact {
  name?: string;
  email?: string;
  phone?: string;
  /** TCPA SMS consent. When true we tag consent:sms; never assumed when false. */
  smsConsent?: boolean;
  businessName?: string;
  tags?: string[];
}

export interface UpsertContactResult {
  contactId: string | null;
}

/** Create or update the contact in GHL. Returns the contact id (or null on failure). */
export async function upsertContact(lead: LeadContact): Promise<UpsertContactResult> {
  const [firstName, ...rest] = (lead.name || '').trim().split(/\s+/);
  const lastName = rest.join(' ');

  const tags = [...(lead.tags || []), 'ai-website-generator'];
  // Only tag SMS consent when explicitly granted — never assume consent.
  if (lead.smsConsent === true) tags.push('consent:sms');

  const body: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    name: lead.name || undefined,
    email: lead.email || undefined,
    phone: lead.phone || undefined,
    companyName: lead.businessName || undefined,
    tags,
    source: 'AI Website Generator',
  };

  const resp = await fetch(`${GHL_BASE}/contacts/upsert`, {
    method: 'POST',
    headers: ghlHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`GHL upsertContact failed: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as { contact?: { id?: string }; id?: string };
  return { contactId: data.contact?.id || data.id || null };
}

export interface CreateOpportunityArgs {
  contactId: string;
  name: string;
  /** Deposit paid, in dollars (e.g. 250), stored as the opportunity's monetary value. */
  monetaryValue?: number;
}

/** Open an opportunity in the IKONIC SALES pipeline for a generated concept. */
export async function createOpportunity(args: CreateOpportunityArgs): Promise<{ opportunityId: string | null }> {
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const stageId = process.env.GHL_PIPELINE_STAGE_ID;

  // TODO: confirm the real IKONIC SALES pipeline + stage ids and set these env
  // vars in Vercel. Without them we cannot place the opportunity in the right
  // pipeline, so we surface a clear error to the caller (which logs, non-fatally).
  if (!pipelineId || !stageId) {
    throw new Error('GHL_PIPELINE_ID / GHL_PIPELINE_STAGE_ID not configured');
  }

  const body = {
    locationId: GHL_LOCATION_ID,
    pipelineId,
    pipelineStageId: stageId,
    contactId: args.contactId,
    name: args.name,
    status: 'open',
    monetaryValue: args.monetaryValue ?? undefined,
  };

  const resp = await fetch(`${GHL_BASE}/opportunities/`, {
    method: 'POST',
    headers: ghlHeaders(),
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`GHL createOpportunity failed: ${resp.status} ${text}`);
  }

  const data = (await resp.json()) as { opportunity?: { id?: string }; id?: string };
  return { opportunityId: data.opportunity?.id || data.id || null };
}
