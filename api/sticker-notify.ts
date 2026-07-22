import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { blocked } from './_lib/guard.js';

const SHARED_EMAIL = 'info@ikonicmarketing303.com';

/**
 * Order notification for the sticker builder.
 *
 * HARDENED 2026-07-21 (security audit). This was an unauthenticated, unrate-limited
 * mail relay into the business inbox:
 *  - every customer.* / product.* field was interpolated into the HTML UNESCAPED, so a
 *    caller could author the entire email body (fake "ACTION REQUIRED" invoices with
 *    their own links, arriving from our own site);
 *  - fileBase64/fileName/fileType became a Resend attachment verbatim — arbitrary bytes
 *    under an arbitrary filename, up to the 4.5 MB body limit;
 *  - looping it buried the inbox AND burned the Resend daily quota, which silently kills
 *    the generator lead emails and blog notifications. Lost leads, not just spam;
 *  - `order:{}` destructured undefined outside the try block → unhandled 500.
 *
 * Now: rate limited, every field escaped and length-capped, the payload shape validated
 * before use, and attachments restricted by size and type.
 */

const MAX_FIELD = 200;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // Resend's own limit; reject rather than truncate
const ALLOWED_ATTACHMENT = /\.(png|jpe?g|gif|webp|svg|pdf|ai|eps|zip)$/i;

/** Escape for HTML text/attribute context, then bound the length. */
function esc(v: unknown, max = MAX_FIELD): string {
  const s = v === null || v === undefined ? '' : String(v);
  return s
    .slice(0, max)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Money fields must be numbers; a string here used to reach .toFixed() and 500. */
function money(v: unknown): string {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? n.toFixed(2) : '0.00';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (await blocked(req, res, { limit: 5, windowSec: 600, name: 'sticker-notify', flag: 'STICKER_NOTIFY_ENABLED' })) {
    return;
  }

  const body = (req.body ?? {}) as Record<string, any>;
  const order = body.order;
  if (!order || typeof order !== 'object') {
    return res.status(400).json({ error: 'Missing order data' });
  }

  const customer = (order.customer ?? {}) as Record<string, unknown>;
  const product = (order.product ?? {}) as Record<string, unknown>;
  const pricing = (order.pricing ?? {}) as Record<string, unknown>;

  if (!customer.firstName || !customer.email) {
    return res.status(400).json({ error: 'Missing customer name or email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // ── attachment: bounded and type-restricted ──────────────────────────────
  const { fileBase64, fileName, fileType } = body;
  const attachments: { filename: string; content: Buffer; type?: string }[] = [];
  if (fileBase64 && fileName) {
    if (typeof fileBase64 !== 'string' || typeof fileName !== 'string') {
      return res.status(400).json({ error: 'Invalid attachment' });
    }
    // Strip any path component — a filename is a name here, never a path.
    const safeName = fileName.replace(/[/\\]/g, '_').slice(0, 120);
    if (!ALLOWED_ATTACHMENT.test(safeName)) {
      return res.status(400).json({ error: 'Unsupported attachment type' });
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(fileBase64, 'base64');
    } catch {
      return res.status(400).json({ error: 'Invalid attachment encoding' });
    }
    if (!buf.length || buf.length > MAX_ATTACHMENT_BYTES) {
      return res.status(400).json({ error: 'Attachment too large' });
    }
    attachments.push({
      filename: safeName,
      content: buf,
      type: typeof fileType === 'string' ? fileType.slice(0, 100) : undefined,
    });
  }

  const name = `${esc(customer.firstName, 80)} ${esc(customer.lastName, 80)}`.trim();
  const email = esc(customer.email, 254);

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;max-width:700px;margin:0 auto;">
      <div style="background:#0A1628;padding:24px;border-radius:8px;margin-bottom:24px;text-align:center;">
        <h1 style="color:#FF6B35;font-size:24px;margin:0;letter-spacing:2px;">NEW STICKER ORDER</h1>
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Customer</h2>
        <p style="margin:4px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> ${email}</p>
        ${customer.phone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${esc(customer.phone, 40)}</p>` : ''}
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Order Details</h2>
        <p style="margin:4px 0;"><strong>Type:</strong> ${esc(product.type)}</p>
        ${product.shape ? `<p style="margin:4px 0;"><strong>Shape:</strong> ${esc(product.shape)}</p>` : ''}
        <p style="margin:4px 0;"><strong>Size:</strong> ${esc(product.size)}</p>
        <p style="margin:4px 0;"><strong>Material:</strong> ${esc(product.material)}</p>
        <p style="margin:4px 0;"><strong>Finish:</strong> ${esc(product.finish)}</p>
        <p style="margin:4px 0;"><strong>Quantity:</strong> ${esc(product.quantity, 20)}</p>
        ${product.perSheet ? `<p style="margin:4px 0;"><strong>Per Sheet:</strong> ${esc(product.perSheet, 20)}</p>` : ''}
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Pricing</h2>
        <p style="margin:4px 0;"><strong>Subtotal:</strong> $${money(pricing.subtotal)}</p>
        <p style="margin:4px 0;"><strong>Shipping:</strong> ${Number(pricing.shipping) === 0 ? 'FREE' : `$${money(pricing.shipping)}`}</p>
        <p style="margin:8px 0 0;font-size:20px;color:#FF6B35;"><strong>Total: $${money(pricing.total)}</strong></p>
      </div>

      <div style="text-align:center;color:#aaa;font-size:12px;margin-top:24px;">
        <p>Ikonic Marketing · Denver, CO · 720.679.1230</p>
      </div>

      <div style="text-align:center;color:#c00;font-size:11px;margin-top:12px;">
        <p>Submitted from the public sticker builder — verify the customer before producing.</p>
      </div>
    </div>`;

  try {
    await resendSend(apiKey, {
      subject: `New Sticker Order — ${name} · $${money(pricing.total)}`,
      html,
      attachments,
    });
    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    // Log the detail, return a generic message — Resend errors quote quota state.
    console.error('sticker-notify send failed:', error instanceof Error ? error.message : error);
    return res.status(502).json({ error: 'Notification failed' });
  }
}

async function resendSend(
  apiKey: string,
  opts: { subject: string; html: string; attachments: { filename: string; content: Buffer; type?: string }[] }
) {
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: 'Ikonic Stickers <onboarding@resend.dev>',
    to: SHARED_EMAIL,
    subject: opts.subject,
    html: opts.html,
    attachments: opts.attachments,
  });
}
