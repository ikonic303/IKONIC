import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';



const TOPICS = [
  // Digital Marketing
  'How Denver Businesses Can Use Digital Marketing to Get More Leads This Month',
  'The ROI of Digital Marketing for Local Service Companies in Colorado',
  'Email Automation vs. Social Media: Which Drives More Leads for Denver Businesses?',
  'How to Build a 24/7 Lead Generation System with Digital Marketing',
  'Google Ads vs. Meta Ads: Which Is Better for Denver Local Businesses?',
  'Why Every Denver Service Business Needs a CRM and Marketing Automation System',
  // Signage
  'How Business Signage Drives Walk-In Traffic and Brand Recognition in Denver',
  'Indoor vs. Outdoor Signage: What Denver Businesses Need to Know',
  'The Psychology of Effective Business Signage: What Makes Customers Stop and Look',
  'How to Choose the Right Signage for Your Denver Business Location',
  // Commercial Wraps
  'How Commercial Vehicle Wraps Turn Denver Fleets Into Mobile Billboards',
  'The True ROI of Commercial Wraps for Denver Service Businesses',
  'Full Wrap vs. Partial Wrap: Which Is Right for Your Denver Business Fleet?',
  'How to Design a Commercial Wrap That Gets Your Denver Business Noticed',
  'Fleet Branding 101: Wrapping Multiple Vehicles for Maximum Impact in Colorado',
  // Wayfinding Signage
  'What Is Wayfinding Signage and Why Does Your Denver Business Need It?',
  'How Wayfinding Signage Improves the Customer Experience at Your Location',
  'Interior Wayfinding Signs: Helping Customers Navigate Your Denver Business',
  'Wayfinding Signage for Office Buildings and Commercial Properties in Denver',
  'How to Design a Wayfinding System That Reflects Your Brand in Colorado',
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

export async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth — Vercel cron sends Authorization: Bearer {CRON_SECRET} automatically.
  //
  // FAIL CLOSED. This previously read `if (cronSecret) { ...check... }`, so when
  // CRON_SECRET was unset the check was skipped entirely and this endpoint was
  // publicly triggerable — every call costing a Gemini generation and a Resend email.
  // CRON_SECRET was in fact NOT set in Vercel (found 2026-07-20), so that was live.
  // A missing secret must mean NOBODY gets in, never everybody.
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) {
    console.error('auto-blog-generate: CRON_SECRET not configured — refusing to run');
    return res.status(503).json({ error: 'Not configured' });
  }
  const authHeader = (req.headers['authorization'] as string) || '';
  const querySecret = (req.query?.secret as string) || '';
  if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  if (!process.env.UPSTASH_REDIS_REST_URL) return res.status(500).json({ error: 'UPSTASH_REDIS_REST_URL not set' });

  // TOPIC SELECTION — never write the same subject twice.
  //
  // This used to be `TOPICS[Math.floor(Math.random() * TOPICS.length)]` with no memory,
  // running daily against a 20-item list. The result was severe self-cannibalisation:
  // by post 47 there were SEVEN near-identical "fleet as mobile billboard" articles and
  // three on "the hidden cost of a weak brand", each splitting the others' search
  // authority. A content engine that republishes its own topics is worse than one that
  // stops.
  //
  // Every post now records the exact topic string it came from. We read those back and
  // only pick from what's left. When the list is exhausted we DO NOT generate — we email
  // instead, because the right response to "nothing new to say" is to write new topics,
  // not to say an old thing again.
  const usedTopics = new Set<string>();
  try {
    const slugsData = await upstash(['SMEMBERS', 'blog:slugs']);
    const existing: string[] = slugsData.result || [];
    for (const s of existing) {
      const d = await upstash(['GET', `blog:post:${s}`]);
      if (!d.result) continue;
      try {
        const post = JSON.parse(d.result);
        if (post.topic) usedTopics.add(post.topic);
      } catch { /* ignore an unparseable record */ }
    }
  } catch (err) {
    console.error('auto-blog-generate: could not read existing topics, proceeding:', err);
  }

  const available = TOPICS.filter((t) => !usedTopics.has(t));
  if (!available.length) {
    console.warn('auto-blog-generate: every topic is used — not generating a duplicate');
    try {
      await new Resend(resendKey).emails.send({
        from: 'ikonic303 Blog <blog@ikonicmarketing303.com>',
        to: 'info@ikonicmarketing303.com',
        subject: 'Blog generator paused — the topic list is used up',
        html: `<p>The daily blog generator ran but every topic in its list has already been
               published, so it did not write anything rather than duplicate an existing post.</p>
               <p><strong>To restart it:</strong> add new topics to <code>TOPICS</code> in
               <code>api/_lib/blog/auto-blog-generate.ts</code>.</p>
               <p>${usedTopics.size} topics used.</p>`,
      });
    } catch (err) {
      console.error('auto-blog-generate: exhausted-notice email failed:', err);
    }
    return res.status(200).json({ ok: true, skipped: 'all topics used', used: usedTopics.size });
  }

  const topic = available[Math.floor(Math.random() * available.length)];

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const prompt = `You are a professional content writer for ikonic303, a Denver-based company specializing in digital marketing, business signage, commercial vehicle wraps, and wayfinding signage.

Write a high-quality, SEO-optimized blog post on this topic: "${topic}"

Return ONLY a single valid JSON object — no markdown, no code fences, just the JSON:
{
  "title": "compelling SEO title (60 chars max)",
  "slug": "url-friendly-slug-with-hyphens-only",
  "excerpt": "2-3 sentence compelling description for the blog listing page",
  "content": "full article as clean HTML (use h2, h3, p, ul, li, strong tags; 900-1300 words; no outer html/body/head tags; no inline styles; no class attributes)",
  "category": "one of: Digital Marketing, Signage, Commercial Wraps, Wayfinding Signage",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Make it genuinely helpful and relevant to Denver business owners. Include real actionable advice. Write at an 8th-grade reading level. Mention Denver or Colorado where natural.`;

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

  // NOTE: named `draft`, but status is 'published' — generated posts go LIVE immediately.
  // The token/publish-blog flow is a leftover from when they were held for review.
  const draft = {
    token,
    topic, // recorded so the next run can exclude this subject — see topic selection above
    title: postData.title,
    slug,
    excerpt: postData.excerpt,
    content: postData.content,
    category: postData.category,
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    author: 'ikonic303',
    status: 'published',
    createdAt: now,
    publishedAt: now,
  };

  await upstash(['SET', `blog:post:${slug}`, JSON.stringify(draft)]);
  await upstash(['SADD', 'blog:slugs', slug]);

  const postUrl = `https://ikonic303.com/post/${slug}`;

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
    <p style="color:rgba(255,255,255,0.5);margin:6px 0 0;font-size:12px;">Auto-published · Live on ikonic303.com/blogs</p>
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

  <p style="text-align:center;color:#aaa;font-size:11px;margin:0;">ikonic303 · ikonic303.com</p>
</div>`;

  const resend = new Resend(resendKey);
  try {
    await resend.emails.send({
      from: 'ikonic303 Blog <blog@ikonicmarketing303.com>',
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
