import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';

export const maxDuration = 60;

const TOPICS = [
  "Why Vehicle Wraps Are Denver's Best ROI Marketing Investment",
  '5 Signs Your Business Brand Is Costing You Customers',
  'How to Rank #1 on Google Maps as a Local Service Business',
  'The Real Cost of Ignoring Online Reviews (And How to Fix It)',
  'Paint Protection Film vs. Ceramic Coating: Which Is Right for You?',
  'The 90-Day Local Marketing Plan for Service Businesses',
  'How CRM Automation Can Double Your Lead Conversion Rate',
  'Window Tinting: A Complete Guide for Denver Drivers',
  'From One Truck to a Fleet: Scaling a Local Service Business with Brand',
  'Why Most Small Business Websites Fail to Convert (And How to Fix Yours)',
  'The Hidden Cost of a Weak Brand for Local Service Businesses',
  'Ceramic Coating vs. Waxing: What Denver Vehicle Owners Need to Know',
  'GoHighLevel for Small Business: A Beginners Guide to Lead Automation',
  'How to Use Your Fleet as a Mobile Billboard (And Track the ROI)',
];

async function upstash(command: unknown[]) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth — Vercel cron sends Authorization: Bearer {CRON_SECRET} automatically
  const cronSecret = process.env.CRON_SECRET || '';
  if (cronSecret) {
    const authHeader = (req.headers['authorization'] as string) || '';
    const querySecret = (req.query?.secret as string) || '';
    if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  if (!process.env.UPSTASH_REDIS_REST_URL) return res.status(500).json({ error: 'UPSTASH_REDIS_REST_URL not set' });

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const prompt = `You are a professional content writer for Ikonic Marketing, a Denver-based digital marketing and vehicle protection company (vehicle wraps, paint protection film, ceramic coating, window tinting, GoHighLevel CRM automation).

Write a high-quality, SEO-optimized blog post on this topic: "${topic}"

Return ONLY a single valid JSON object — no markdown, no code fences, just the JSON:
{
  "title": "compelling SEO title (60 chars max)",
  "slug": "url-friendly-slug-with-hyphens-only",
  "excerpt": "2-3 sentence compelling description for the blog listing page",
  "content": "full article as clean HTML (use h2, h3, p, ul, li, strong tags; 900-1300 words; no outer html/body/head tags; no inline styles; no class attributes)",
  "category": "one of: Marketing, Vehicle Protection, Branding, Local SEO, Automation",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Make it genuinely helpful and relevant to Denver service business owners. Include real actionable advice. Write at an 8th-grade reading level. Mention Denver or Colorado where natural.`;

  let postData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    tags: string[];
  };

  let lastErr = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      postData = JSON.parse(result.text ?? '{}');
      break;
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err.message : 'Unknown error';
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  if (!postData!) {
    return res.status(500).json({ error: 'Gemini generation failed after 3 attempts: ' + lastErr });
  }

  const token = randomUUID();
  const slug = (postData.slug || token).replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const now = new Date().toISOString();

  const draft = {
    token,
    title: postData.title,
    slug,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    author: 'Ikonic Team',
    status: 'published',
    createdAt: now,
    publishedAt: now,
  };

  await upstash(['SET', `blog:post:${slug}`, JSON.stringify(draft)]);
  await upstash(['SADD', 'blog:slugs', slug]);

  const postUrl = `https://ikonicmarketing303.com/post/${slug}`;

  // Content preview — strip HTML tags for a clean text preview in the email
  const textPreview = draft.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 800);

  const emailHtml = `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#f0f0f0;padding:28px;">

  <div style="background:#0B0D10;padding:22px 28px;border-radius:12px;margin-bottom:20px;text-align:center;">
    <h1 style="color:#00FF9D;font-size:18px;margin:0;letter-spacing:2px;">✅ NEW BLOG POST PUBLISHED</h1>
    <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">Auto-published · Live on ikonicmarketing303.com/blogs</p>
  </div>

  <div style="background:white;border-radius:12px;padding:28px;margin-bottom:16px;">
    <p style="color:#888;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">${draft.category}</p>
    <h2 style="font-size:24px;color:#0B0D10;margin:0 0 14px;line-height:1.3;">${draft.title}</h2>
    <p style="color:#444;font-size:14px;line-height:1.7;border-left:3px solid #00FF9D;padding-left:14px;margin:0 0 20px;">${draft.excerpt}</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:18px;font-size:13px;color:#333;line-height:1.75;">
      ${textPreview}${draft.content.length > 800 ? '&hellip;' : ''}
    </div>
    <div style="margin-top:14px;">
      ${draft.tags.map((t: string) => `<span style="display:inline-block;background:#e8f5f0;color:#00aa66;font-size:11px;padding:3px 10px;border-radius:999px;margin:2px;">#${t}</span>`).join('')}
    </div>
  </div>

  <div style="text-align:center;margin-bottom:20px;">
    <a href="${postUrl}" style="display:inline-block;background:#00FF9D;color:#0B0D10;font-weight:bold;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">
      View Live Post →
    </a>
  </div>

  <p style="text-align:center;color:#aaa;font-size:11px;margin:0;">Ikonic Marketing · ikonicmarketing303.com</p>
</div>`;

  const resend = new Resend(resendKey);
  try {
    await resend.emails.send({
      from: 'Ikonic Blog <blog@ikonicmarketing303.com>',
      to: 'info@ikonicmarketing303.com',
      subject: `✅ New Blog Post Live: "${draft.title}"`,
      html: emailHtml,
    });
  } catch (emailErr: unknown) {
    const msg = emailErr instanceof Error ? emailErr.message : 'Unknown';
    return res.status(500).json({ error: 'Draft saved but email failed: ' + msg });
  }

  return res.status(200).json({ success: true, slug, title: draft.title, topic });
}
