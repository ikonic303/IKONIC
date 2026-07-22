import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { blocked, readToken, consumeToken, claimToken, releaseClaim } from './_lib/guard.js';

export const maxDuration = 45;

const LEAD_EMAIL = 'info@ikonicmarketing303.com';

type FormPayload = {
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
};

const val = (v?: string) => (v && v.trim() ? v.trim() : 'Not specified');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Kill switch + per-IP rate limit. This endpoint calls Gemini on every valid
  // request, so an unguarded loop here is an unbounded bill. See api/_lib/guard.ts.
  if (await blocked(req, res, { limit: 3, windowSec: 3600, name: 'gen-website' })) return;

  const body = (req.body || {}) as FormPayload;

  if (!body.businessName || !body.businessType) {
    return res.status(400).json({ error: 'Business name and business type are required' });
  }

  // Deposit gate. GENERATOR_REQUIRE_DEPOSIT=0 runs the generator free (lead-magnet
  // mode) while still rate-limited; unset/any other value requires a paid deposit.
  // The token is minted by create-generator-deposit and only marked 'paid' by
  // verify-generator-deposit after SQUARE confirms — never by the browser.
  const requireDeposit = process.env.GENERATOR_REQUIRE_DEPOSIT !== '0';
  let depositToken: string | null = null;

  if (requireDeposit) {
    depositToken = typeof (req.body as any)?.token === 'string' ? (req.body as any).token : null;
    if (!depositToken) {
      return res.status(402).json({ error: 'A deposit is required before generating.' });
    }
    const record = await readToken(depositToken);
    if (!record || record.status !== 'paid') {
      return res.status(402).json({ error: 'Deposit not found or not yet confirmed.' });
    }

    // ATOMIC CLAIM (2026-07-21 security audit). Reading the token here and deleting it
    // ~40s later (after Gemini returns) is a TOCTOU race: N concurrent requests with one
    // paid token all saw status:'paid' before any delete landed, so one $250 deposit
    // bought N generations. SET NX lets exactly one caller through.
    if (!(await claimToken(depositToken))) {
      return res.status(409).json({
        error: 'This deposit is already being used to generate a concept. Please wait a moment and refresh.',
      });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const prompt = `Based on the following business information, generate a custom website design concept. Include a recommended website layout, hero headline, subheadline, section structure, service section ideas, call-to-action buttons, design style, color direction, and conversion-focused recommendations. Make it professional, clear, and ready for a web design team to build.

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

  let concept: unknown = null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const raw = result.text?.trim() || '{}';
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    concept = JSON.parse(cleaned);
  } catch (err: any) {
    console.error('generate-website error:', err);
    // The customer PAID. Generation failed, so the token was never consumed — release
    // the claim immediately so they can retry now rather than waiting out CLAIM_TTL_SEC.
    // Without this, a transient Gemini error locks a paid deposit for 5 minutes, and the
    // only remedy would be a refund, which we do not do.
    if (depositToken) await releaseClaim(depositToken);
    // Don't return the raw SDK error — it quotes upstream endpoints and quota state.
    return res.status(502).json({ error: 'Generation failed. Please try again in a moment.' });
  }

  // ── Save the lead (email notification to Ikonic) — non-fatal on failure ──────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const row = (label: string, value?: string) =>
        `<tr><td style="padding:6px 12px;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 12px;color:#111;font-size:13px;">${val(value)}</td></tr>`;

      const html = `
        <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:32px;max-width:720px;margin:0 auto;">
          <div style="background:#0B0D10;padding:22px;border-radius:10px;text-align:center;margin-bottom:20px;">
            <h1 style="color:#00FF9D;font-size:22px;margin:0;letter-spacing:1px;">NEW AI WEBSITE GENERATOR LEAD</h1>
          </div>
          <div style="background:#fff;border-radius:10px;padding:8px 12px;margin-bottom:16px;">
            <table style="width:100%;border-collapse:collapse;">
              ${row('Contact', body.name)}
              ${row('Email', body.email)}
              ${row('Phone', body.phone)}
              ${row('Business', body.businessName)}
              ${row('Industry', body.businessType)}
              ${row('Services', body.services)}
              ${row('Target Customers', body.targetCustomers)}
              ${row('Website Goal', body.websiteGoal)}
              ${row('Existing URL', body.existingUrl)}
              ${row('Pages Needed', body.pagesNeeded)}
              ${row('Preferred Style', body.preferredStyle)}
              ${row('Preferred Colors', body.preferredColors)}
              ${row('Has Branding', body.hasBranding)}
              ${row('Inspiration', body.inspiration)}
              ${row('Differentiator', body.uniqueSellingPoint)}
              ${row('Needs CRM/AI/Marketing', body.needsSystems)}
              ${row('Budget Interest', body.budgetInterest)}
            </table>
          </div>
          <div style="text-align:center;color:#aaa;font-size:12px;">
            <p>Ikonic Marketing · Denver, CO · 720.679.1230</p>
          </div>
        </div>`;

      await resend.emails.send({
        from: 'Ikonic AI Website Generator <onboarding@resend.dev>',
        to: LEAD_EMAIL,
        subject: `New Website Generator Lead — ${val(body.name)} · ${val(body.businessName)}`,
        html,
      });
    } catch (err) {
      console.error('generate-website lead email failed:', err);
      // Do not fail the request — the user still gets their concept.
    }
  }

  // Burn the deposit token only now that a concept actually exists. Consuming it
  // earlier would charge someone for a generation that failed — they'd have paid and
  // have nothing, and the only remedy would be a refund, which we do not do.
  if (depositToken) {
    await consumeToken(depositToken);
    await releaseClaim(depositToken);
  }

  return res.status(200).json({ concept });
}
