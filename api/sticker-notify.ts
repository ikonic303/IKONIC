import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const SHARED_EMAIL = 'info@ikonicmarketing303.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order, fileBase64, fileName, fileType } = req.body;

  if (!order) {
    return res.status(400).json({ error: 'Missing order data' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(apiKey);
  const { customer, product, pricing } = order;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px;max-width:700px;margin:0 auto;">
      <div style="background:#0A1628;padding:24px;border-radius:8px;margin-bottom:24px;text-align:center;">
        <h1 style="color:#FF6B35;font-size:24px;margin:0;letter-spacing:2px;">NEW STICKER ORDER</h1>
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Customer</h2>
        <p style="margin:4px 0;"><strong>Name:</strong> ${customer.firstName} ${customer.lastName || ''}</p>
        <p style="margin:4px 0;"><strong>Email:</strong> <a href="mailto:${customer.email}">${customer.email}</a></p>
        ${customer.phone ? `<p style="margin:4px 0;"><strong>Phone:</strong> ${customer.phone}</p>` : ''}
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Order Details</h2>
        <p style="margin:4px 0;"><strong>Type:</strong> ${product.type}</p>
        ${product.shape ? `<p style="margin:4px 0;"><strong>Shape:</strong> ${product.shape}</p>` : ''}
        <p style="margin:4px 0;"><strong>Size:</strong> ${product.size}</p>
        <p style="margin:4px 0;"><strong>Material:</strong> ${product.material}</p>
        <p style="margin:4px 0;"><strong>Finish:</strong> ${product.finish}</p>
        <p style="margin:4px 0;"><strong>Quantity:</strong> ${product.quantity}</p>
        ${product.perSheet ? `<p style="margin:4px 0;"><strong>Per Sheet:</strong> ${product.perSheet}</p>` : ''}
      </div>

      <div style="background:white;border-radius:8px;padding:24px;margin-bottom:16px;">
        <h2 style="font-size:15px;color:#0A1628;margin:0 0 12px;border-bottom:2px solid #FF6B35;padding-bottom:8px;">Pricing</h2>
        <p style="margin:4px 0;"><strong>Subtotal:</strong> $${pricing.subtotal.toFixed(2)}</p>
        <p style="margin:4px 0;"><strong>Shipping:</strong> ${pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`}</p>
        <p style="margin:8px 0 0;font-size:20px;color:#FF6B35;"><strong>Total: $${pricing.total.toFixed(2)}</strong></p>
      </div>

      <div style="text-align:center;color:#aaa;font-size:12px;margin-top:24px;">
        <p>Ikonic Marketing · Denver, CO · 720.679.1230</p>
      </div>
    </div>`;

  const attachments =
    fileBase64 && fileName
      ? [{ filename: fileName, content: Buffer.from(fileBase64, 'base64'), type: fileType || undefined }]
      : [];

  try {
    await resend.emails.send({
      from: 'Ikonic Stickers <onboarding@resend.dev>',
      to: SHARED_EMAIL,
      subject: `New Sticker Order — ${customer.firstName} ${customer.lastName || ''} · $${pricing.total.toFixed(2)}`,
      html,
      attachments,
    });

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Notification failed';
    return res.status(500).json({ error: message });
  }
}
