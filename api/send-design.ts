import type { VercelRequest, VercelResponse } from '@vercel/node';
// import { Resend } from 'resend';

// ─────────────────────────────────────────────────────────────────────────────
// DISABLED per Josh's request — this endpoint emailed AI-generated wrap designs
// for the (now retired) wrap generator. It is intentionally inert and returns
// HTTP 410 Gone. The original implementation is preserved (commented) below so it
// can be restored later. To re-enable: delete the stub handler, restore the
// `Resend` import above, and uncomment the original handler.
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({ error: 'The AI wrap design service has been retired.' });
}

/* ORIGINAL IMPLEMENTATION — kept for future re-enable

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, contactName, businessName, designs } = req.body;

  if (!email || !designs || !businessName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const resend = new Resend(apiKey);

  // Build image sections for each design
  const designSections = Object.entries(designs as Record<string, string>)
    .map(([side, dataUrl]) => {
      const isBase64 = dataUrl.startsWith('data:image');
      const imgSrc = isBase64 ? dataUrl : dataUrl;
      return `
        <div style="margin-bottom:24px;">
          <p style="font-size:14px;color:#aaa;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">${side} view</p>
          <img src="${imgSrc}" alt="${side} wrap design" style="width:100%;max-width:600px;border-radius:8px;border:1px solid #333;" />
        </div>`;
    })
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;max-width:700px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 style="color:#00ff9d;font-size:28px;margin-bottom:8px;">Your Wrap Designs Are Ready!</h1>
        <p style="color:#aaa;font-size:16px;">Hi ${contactName || businessName}, here are your AI-generated vehicle wrap designs.</p>
      </div>

      <div style="background:#111;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h2 style="color:#fff;font-size:18px;margin-bottom:16px;">Design Previews — ${businessName}</h2>
        ${designSections}
      </div>

      <div style="background:#111;border-radius:12px;padding:24px;margin-bottom:24px;">
        <h3 style="color:#00ff9d;font-size:16px;margin-bottom:12px;">What Happens Next?</h3>
        <ul style="color:#aaa;font-size:14px;line-height:1.8;padding-left:20px;">
          <li>Our design team reviews your preferences and images above</li>
          <li>We prepare production-ready vector files (SVG/AI/EPS) with CMYK color profile</li>
          <li>You receive final files within 24 hours</li>
          <li>Files are ready to send directly to your wrap installer</li>
        </ul>
      </div>

      <div style="text-align:center;padding:24px;background:#111;border-radius:12px;">
        <p style="color:#aaa;font-size:13px;">Questions? Contact us at <a href="mailto:info@ikonicmarketing303.com" style="color:#00ff9d;">info@ikonicmarketing303.com</a></p>
        <p style="color:#555;font-size:12px;margin-top:8px;">© 2026 Ikonic Marketing. All rights reserved.</p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: 'Ikonic Wraps <onboarding@resend.dev>',
      to: email,
      subject: `Your Vehicle Wrap Designs — ${businessName}`,
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send email';
    return res.status(500).json({ error: message });
  }
}

*/
