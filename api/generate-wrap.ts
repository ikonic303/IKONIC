import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─────────────────────────────────────────────────────────────────────────────
// DISABLED per Josh's request — the AI wrap generator (Gemini-powered) has been
// removed from the live site. This endpoint is intentionally inert and returns
// HTTP 410 Gone. The original implementation is preserved (commented) below so it
// can be restored later. To re-enable: delete the stub handler, uncomment the
// `maxDuration` export and the original handler, and re-wire the UI (see the
// commented route/links in src/App.tsx + src/components/Navigation.tsx and the
// page at src/pages/CommercialWraps.tsx).
// ─────────────────────────────────────────────────────────────────────────────

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({ error: 'The AI wrap generator has been retired.' });
}

/* ORIGINAL IMPLEMENTATION — kept for future re-enable

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { businessName, wrapStyle, colorTheme, brandColors, services, tagline, logo, logoDescription } = req.body;

  if (!businessName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const styleDescriptions: Record<string, string> = {
    full: 'full coverage wrap — entire vehicle body covered with bold color blocks and graphic shapes',
    partial: 'partial wrap — bold color panels on lower body and doors, upper body in base color',
    decals: 'minimal decal style — clean logo placement on doors, simple stripe or accent line',
  };

  const colorInstruction = brandColors
    ? `Primary colors: ${brandColors}.`
    : `Color theme: ${colorTheme} — use 2-3 complementary colors that work well together.`;

  const serviceText = Array.isArray(services) && services.length > 0
    ? services.slice(0, 3).join('  |  ')
    : '';

  const prompt = `Create a professional commercial vehicle wrap design sheet in FLAT VECTOR ILLUSTRATION style, exactly like a professional wrap design template.

LAYOUT: White background canvas. Show a sedan or SUV from 3 angles arranged neatly:
- Large LEFT SIDE PROFILE view (biggest, center-left)
- Smaller REAR VIEW (top-right corner)
- Smaller FRONT VIEW (bottom-right corner)

DESIGN STYLE:
- Flat vector graphic illustration — NO photorealism, NO 3D rendering, NO shadows
- Clean geometric color blocks: diagonal panels, sharp angular shapes
- ${styleDescriptions[wrapStyle] || styleDescriptions.full}
- ${colorInstruction}
- White and dark contrast areas for text readability

TEXT ON WRAP:
- Company name: "${businessName}" in large clean bold sans-serif font
${tagline ? `- Tagline: "${tagline}" in smaller font` : ''}
${serviceText ? `- Services: "${serviceText}"` : ''}
${logo ? `- IMPORTANT: The attached image is the company logo. Place this EXACT logo prominently on the vehicle sides. ${logoDescription ? logoDescription : 'Center it on the door panels.'}` : ''}

QUALITY: Professional wrap design sheet, crisp vector edges, print-ready appearance.`;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data?.error?.message || 'Gemini API error' });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return res.status(200).json({ url: `data:${mimeType};base64,${part.inlineData.data}` });
      }
    }

    return res.status(500).json({ error: 'No image returned from Gemini' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Image generation failed';
    return res.status(500).json({ error: message });
  }
}

*/
