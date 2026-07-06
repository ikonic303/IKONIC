// ─────────────────────────────────────────────────────────────────────────────
// Lead-notification email for the AI Website Generator (P5).
//
// Uses a VERIFIED domain sender — never the Resend sandbox (onboarding@resend.dev).
// Sender/recipient are env-configurable with safe verified-domain defaults.
//
// Not a Vercel function (under api/_lib) — imported by generate-website.
// ─────────────────────────────────────────────────────────────────────────────
import { Resend } from 'resend';

/** Verified-domain default sender. Override with LEAD_EMAIL_FROM. */
const DEFAULT_FROM = 'Ikonic AI Website Generator <noreply@ikonicmarketing303.com>';
/** Internal recipient for new leads. Override with LEAD_EMAIL_TO. */
const DEFAULT_TO = 'info@ikonicmarketing303.com';

export interface LeadEmailFields {
  name?: string;
  email?: string;
  phone?: string;
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
  smsConsent?: boolean;
  conceptTitle?: string;
}

const val = (v?: string) => (v && v.trim() ? v.trim() : 'Not specified');

/**
 * Send the internal lead-notification email. Best-effort: returns false instead
 * of throwing if Resend isn't configured, so it never blocks a generation.
 */
export async function sendLeadEmail(fields: LeadEmailFields): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = process.env.LEAD_EMAIL_FROM || DEFAULT_FROM;
  const to = process.env.LEAD_EMAIL_TO || DEFAULT_TO;

  const row = (label: string, value?: string) =>
    `<tr><td style="padding:6px 12px;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td><td style="padding:6px 12px;color:#111;font-size:13px;">${val(value)}</td></tr>`;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:32px;max-width:720px;margin:0 auto;">
      <div style="background:#0B0D10;padding:22px;border-radius:10px;text-align:center;margin-bottom:20px;">
        <h1 style="color:#00FF9D;font-size:22px;margin:0;letter-spacing:1px;">NEW AI WEBSITE GENERATOR LEAD</h1>
        <p style="color:#8aa399;font-size:13px;margin:8px 0 0;">Paid deposit + signed agreement · concept generated</p>
      </div>
      <div style="background:#fff;border-radius:10px;padding:8px 12px;margin-bottom:16px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row('Concept', fields.conceptTitle)}
          ${row('Contact', fields.name)}
          ${row('Email', fields.email)}
          ${row('Phone', fields.phone)}
          ${row('SMS consent', fields.smsConsent ? 'YES (consent:sms)' : 'No')}
          ${row('Business', fields.businessName)}
          ${row('Industry', fields.businessType)}
          ${row('Services', fields.services)}
          ${row('Target Customers', fields.targetCustomers)}
          ${row('Website Goal', fields.websiteGoal)}
          ${row('Existing URL', fields.existingUrl)}
          ${row('Pages Needed', fields.pagesNeeded)}
          ${row('Preferred Style', fields.preferredStyle)}
          ${row('Preferred Colors', fields.preferredColors)}
          ${row('Has Branding', fields.hasBranding)}
          ${row('Inspiration', fields.inspiration)}
          ${row('Differentiator', fields.uniqueSellingPoint)}
          ${row('Needs CRM/AI/Marketing', fields.needsSystems)}
          ${row('Budget Tier', fields.budgetInterest)}
        </table>
      </div>
      <div style="text-align:center;color:#aaa;font-size:12px;">
        <p>Ikonic Marketing · Denver, CO · 720.679.1230</p>
      </div>
    </div>`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `New Website Generator Lead — ${val(fields.name)} · ${val(fields.businessName)}`,
      html,
    });
    return true;
  } catch (err) {
    console.error('sendLeadEmail failed:', err);
    return false;
  }
}
