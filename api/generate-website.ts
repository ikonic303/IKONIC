import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import {
  isGeneratorEnabled,
  getClientIp,
  verifyTurnstile,
  isHoneypotTripped,
  rateLimit,
  claimOnce,
  releaseClaim,
} from './_lib/security';
import { verifyDepositSession } from './_lib/stripe';
import { isAgreementSigned, upsertContact, createOpportunity } from './_lib/ghl';
import { sendLeadEmail } from './_lib/email';

// ─────────────────────────────────────────────────────────────────────────────
// AI Website Generator — LOCKED generation endpoint.
//
// Gemini is only ever reached AFTER, in order:
//   1. Kill-switch (GENERATOR_ENABLED=0)              -> 503
//   2. Honeypot                                       -> 400
//   3. Cloudflare Turnstile                           -> 403
//   4. Per-IP rate limit                              -> 429
//   5. Paid $250 Stripe deposit session (verified)    -> 402 if missing/invalid
//   6. Qualified budget tier (from the session)       -> 403
//   7. Signed Marvin/GHL service agreement            -> 403
//   8. One-time-use claim on the session id           -> 409 if already spent
//
// Only then is a concept generated. One successful generation per paid session.
// After generation, the concept is hand-edited by our team before build.
// ─────────────────────────────────────────────────────────────────────────────

export const maxDuration = 45;

const QUALIFIED_TIERS = new Set(['website-build', 'growth-system']);
const val = (v?: string) => (v && v.trim() ? v.trim() : 'Not specified');

interface FormPayload {
  businessName?: string;
  businessType?: string;
  services?: string;
  targetCustomers?: string;
  websiteGoal?: string;
  existingUrl?: string;
  pagesNeeded?: string;
  preferredStyle?: string;
  preferredColors?: string;
  hasBranding?: string;
  inspiration?: string;
  uniqueSellingPoint?: string;
  needsSystems?: string;
  budgetInterest?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── 1. Kill-switch — before anything else, never touches Gemini ────────────
  if (!isGeneratorEnabled()) {
    return res.status(503).json({ error: 'The website generator is temporarily unavailable.' });
  }

  const body = (req.body || {}) as {
    stripeSessionId?: string;
    turnstileToken?: string;
    honeypot?: string;
    smsConsent?: boolean;
    form?: FormPayload;
  };
  const form: FormPayload = body.form || {};
  const ip = getClientIp(req);

  // ── 2. Honeypot ────────────────────────────────────────────────────────────
  if (isHoneypotTripped(body.honeypot)) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }

  // ── 3. Turnstile ────────────────────────────────────────────────────────────
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return res.status(403).json({ error: 'Verification failed. Please retry.' });
  }

  // ── 4. Rate limit (per IP) ───────────────────────────────────────────────────
  if (!(await rateLimit(`rl:generate:${ip}`, 20, 60 * 60))) {
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  // ── 5. Paid deposit session (verified server-side) ───────────────────────────
  const sessionId = body.stripeSessionId;
  const deposit = await verifyDepositSession(sessionId);
  if (!deposit.ok) {
    // 402 Payment Required — no valid paid session, Gemini is never called.
    return res.status(402).json({ error: 'A completed deposit is required before generating.', reason: deposit.reason });
  }

  // ── 6. Qualified tier (trust the SERVER-verified session metadata) ───────────
  const tier = deposit.session?.metadata?.budgetTier || form.budgetInterest || '';
  if (!QUALIFIED_TIERS.has(tier)) {
    return res.status(403).json({ error: 'This selection does not qualify for generation.' });
  }

  // ── 7. Signed service agreement (paid AND signed both required) ──────────────
  if (!(await isAgreementSigned(sessionId as string))) {
    return res.status(403).json({ error: 'The service agreement must be signed before generating.', code: 'agreement_required' });
  }

  // ── 8. One-time-use claim — fail CLOSED if KV is unavailable ─────────────────
  const claimKey = `used:session:${sessionId}`;
  let claimed = false;
  try {
    claimed = await claimOnce(claimKey, 60 * 60 * 24 * 30);
  } catch (err) {
    console.error('one-time-use claim failed (KV):', err);
    return res.status(503).json({ error: 'Could not verify your session. Please try again shortly.' });
  }
  if (!claimed) {
    return res.status(409).json({ error: 'This deposit has already been used to generate a concept.', code: 'session_spent' });
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await releaseClaim(claimKey); // allow retry once configured
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const prompt = buildPrompt(form);

  let concept: unknown = null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const raw = result.text?.trim() || '{}';
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    concept = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('generate-website generation error:', err?.message);
    await releaseClaim(claimKey); // transient failure — let the paid user retry
    return res.status(502).json({ error: 'The design engine is temporarily unavailable. Please try again shortly.' });
  }

  const conceptTitle = (concept as any)?.conceptTitle as string | undefined;

  // ── Lead routing + notification (best-effort, never fails the response) ──────
  await routeLeadToGhl(form, body.smsConsent === true, conceptTitle);
  await sendLeadEmail({ ...form, smsConsent: body.smsConsent === true, conceptTitle });

  return res.status(200).json({ concept });
}

// ── GHL lead routing (P4) — isolated so a GHL outage can't break generation ────
async function routeLeadToGhl(form: FormPayload, smsConsent: boolean, conceptTitle?: string) {
  try {
    const { contactId } = await upsertContact({
      name: form.name,
      email: form.email,
      phone: form.phone,
      businessName: form.businessName,
      smsConsent,
    });
    if (contactId) {
      await createOpportunity({
        contactId,
        name: `${val(form.businessName)} — ${conceptTitle || 'AI Website Concept'}`,
        monetaryValue: 250,
      });
    }
  } catch (err: any) {
    // TODO: once GHL_API_TOKEN + pipeline ids are configured this should succeed;
    // until then it logs and the generation still returns to the user.
    console.error('GHL lead routing failed (non-fatal):', err?.message);
  }
}

function buildPrompt(body: FormPayload): string {
  return `Based on the following business information, generate a custom website design concept. Include a recommended website layout, hero headline, subheadline, section structure, service section ideas, call-to-action buttons, design style, color direction, and conversion-focused recommendations. Make it professional, clear, and ready for a web design team to build.

Business Name: ${val(body.businessName)}
Business Type: ${val(body.businessType)}
Services: ${val(body.services)}
Target Customers: ${val(body.targetCustomers)}
Website Goal: ${val(body.websiteGoal)}
Existing Website: ${val(body.existingUrl)}
Pages Needed: ${val(body.pagesNeeded)}
Preferred Style: ${val(body.preferredStyle)}
Preferred Colors: ${val(body.preferredColors)}
Brand Assets Available: ${val(body.hasBranding)}
Inspiration Websites: ${val(body.inspiration)}
Unique Selling Point: ${val(body.uniqueSellingPoint)}
Needs CRM/AI/Marketing: ${val(body.needsSystems)}
Budget Interest: ${val(body.budgetInterest)}

Return ONLY a valid JSON object (no markdown fences, no commentary) that matches this exact shape:
{
  "conceptTitle": "a short, punchy title for this website concept",
  "layout": "1-2 sentences describing the recommended overall website layout and flow",
  "pageStructure": ["Home", "Services", "About", "Contact", "..."],
  "sections": ["Hero", "Services grid", "Social proof", "..."],
  "hero": { "headline": "compelling hero headline", "subheadline": "supporting subheadline" },
  "ctaButtons": ["Primary CTA text", "Secondary CTA text"],
  "serviceIdeas": [ { "title": "Service section idea", "description": "one short sentence" } ],
  "aboutDirection": "2-3 sentences on the direction for the About section",
  "contactDirection": "2-3 sentences on the direction for the Contact / booking section",
  "designStyle": "recommended design style described in 1-2 sentences",
  "colorDirection": {
    "description": "1-2 sentences on the color direction and why it fits this business",
    "palette": [ { "name": "Primary", "hex": "#RRGGBB" }, { "name": "Accent", "hex": "#RRGGBB" }, { "name": "Background", "hex": "#RRGGBB" }, { "name": "Text", "hex": "#RRGGBB" } ]
  },
  "conversionTips": ["conversion-focused recommendation", "..."]
}

Rules: Every hex value must be a valid 6-digit hex color. Provide 4-6 page structure items, 5-7 sections, 3-5 service ideas, 2-3 CTA buttons, and 3-5 conversion tips. Tailor everything specifically to this business — never generic.`;
}
