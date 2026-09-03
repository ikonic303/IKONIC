import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { Resend } from 'resend';
import { randomUUID } from 'node:crypto';



// TOPICS_BY_CATEGORY + CATEGORY_ORDER below replace a flat 20-item TOPICS list.
// That list ran out on ~2026-07-22 (one draw per day, no repeats allowed — see the
// dedup note further down), and the generator has been silently emailing "topic
// list is used up" and skipping ever since instead of posting. Fix: ~4x more
// topics for runway, grouped by category, with the day-to-day category picked in
// rotation (see CATEGORY_ORDER) so consecutive posts don't cluster on one area.
// 2026-09-04 refocus on RESIDENTIAL window tinting. 'Signage' and 'Wayfinding
// Signage' categories retired (those service pages 301 to /storefront-graphics).
// 'Digital Marketing' was already retired 2026-08-29. Do NOT re-add marketing,
// SEO, ads, CRM, signage, or wayfinding topics. Residential Window Tint is the
// primary category and gets the largest topic list + the most rotation weight.
const TOPICS_BY_CATEGORY: Record<string, string[]> = {
  'Residential Window Tint': [
    'How Home Window Tinting Cuts Heat and Glare in West-Facing Denver Rooms',
    'The Real Cost of Sun Damage: How Window Film Protects Hardwood, Carpet, and Furniture',
    'Daytime Privacy Window Film for Homes: How It Works and What to Expect at Night',
    'Energy-Efficient Window Tint: How Much Can a Denver Homeowner Actually Save?',
    'Low-E Window Film for Colorado Winters: Keeping Heat In, Not Just Out',
    'Which Rooms in Your Home Benefit Most From Window Tinting?',
    'Window Film vs. New Windows: A Cost and Comfort Comparison for Denver Homes',
    'Nursery and Kids\' Room Windows: Choosing Film for UV and Heat',
    'Will Home Window Tint Make My Rooms Dark? Understanding Visible Light Transmission',
    'How to Prepare Your Home for a Window Tint Installation',
    'Caring for Newly Installed Window Film: The First 30 Days',
    'Sunrooms and Enclosed Porches: The Best Window Film for a Glass-Heavy Room',
    'Home Office Window Tint: Killing Screen Glare Without Losing Daylight',
    'How Long Does Residential Window Film Last in Colorado\'s Climate?',
    'What to Expect at a Free In-Home Window Tint Estimate',
    'HOA Rules and Window Film: What Denver-Area Homeowners Should Check First',
  ],
  'Window Film Basics': [
    'How to Tell If Your Windows Are Safe for Window Film Before You Buy',
    'Dual-Pane vs. Single-Pane Glass: What It Means for Your Window Film Options',
    'Low-E Glass and Window Film: Why the Combination Has to Be Checked First',
    'Can Window Film Crack a Window? Understanding Thermal Stress',
    'Does Window Film Void a Window Warranty? What Denver Homeowners Should Ask',
    'Spectrally-Selective Film: Rejecting Heat Without Making a Room Dark',
    'How Much Heat Can Window Film Actually Block?',
    'Interior vs. Exterior Window Film: When Each One Makes Sense',
    'Ceramic vs. Dyed vs. Metalized Window Film: A Plain-English Comparison',
    'How UV Window Film Protects Floors, Furniture, and Artwork From Fading',
    'How Window Film Installers Check Your Glass Before Quoting',
    'Understanding Window Film Specs: VLT, Heat Rejection, UV Rejection, and Glare',
  ],
  'Privacy & Decorative Film': [
    'Frosted Window Film for Bathrooms, Sidelights, and Street-Facing Glass',
    'Decorative and Etched Window Film: Style and Privacy in One Product',
    'Reflective vs. Frosted Privacy Film: Which Is Right for Your Home?',
    'Security and Safety Window Film 101: What It Actually Does in a Break-In',
    'Patio Doors and Ground-Floor Glass: Where Security Film Matters Most',
    'Gradient and Patterned Window Films: A Designer\'s Guide for Denver Homes',
    'One-Way Privacy Film: How the Daytime-vs-Nighttime Effect Really Works',
  ],
  'Commercial Storefront Tint': [
    'Commercial Storefront Window Tint: Cutting Heat, Glare, and Cooling Costs in Denver',
    'Office Window Film: Reducing Screen Glare Without Losing Natural Light',
    'Frosted Privacy Film for Conference Rooms and Clinics',
    'Anti-Graffiti Film for Denver Storefronts: How the Sacrificial Layer Works',
    'Storefront Window Graphics 101: Turning Blank Glass Into a Customer Magnet',
    'Perforated Window Film vs. Frosted Vinyl for Storefronts',
    'Scheduling Commercial Window Film Around Business Hours',
    'Security Window Film for Ground-Floor Retail Glass',
  ],
};

const CATEGORY_ORDER = [
  'Residential Window Tint',
  'Window Film Basics',
  'Residential Window Tint',
  'Privacy & Decorative Film',
  'Residential Window Tint',
  'Commercial Storefront Tint',
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


/**
 * Constant-time secret comparison.
 * ADDED 2026-07-21: `!==` on a secret leaks length and prefix through timing. Not
 * practically exploitable across the public internet, but this is one line.
 */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
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
  // HEADER ONLY (2026-07-21 security audit). The ?secret= path was removed: a secret in
  // a URL lands in Vercel access logs, browser history, and any Referer sent by the
  // rendered page. Vercel cron sends Authorization: Bearer $CRON_SECRET automatically.
  const authHeader = (req.headers['authorization'] as string) || '';
  const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!provided || !secretMatches(provided, cronSecret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!geminiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not set' });
  if (!process.env.UPSTASH_REDIS_REST_URL) return res.status(500).json({ error: 'UPSTASH_REDIS_REST_URL not set' });

  // TOPIC SELECTION — never write the same subject twice. Every post records the
  // exact topic string it came from (see `topic` on `draft` below); we read those
  // back and only pick from what's left. If every topic is exhausted we DO NOT
  // generate — we email instead, because the right response to "nothing new to
  // say" is to add new topics, not to duplicate an old post's subject.
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

  // CATEGORY ROTATION — today's category is fixed by the UTC date so consecutive
  // posts alternate through CATEGORY_ORDER (Architectural Window Film -> Signage ->
  // Wayfinding Signage -> Window Tint -> Storefront Graphics -> repeat) instead of
  // landing wherever chance puts them.
  // If today's category has no unused topics left, move to the next category in
  // the rotation that still has one; only give up once every category is dry.
  const daysSinceEpoch = Math.floor(Date.now() / 86_400_000);
  const startIndex = daysSinceEpoch % CATEGORY_ORDER.length;

  let category = '';
  let topic = '';
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const candidate = CATEGORY_ORDER[(startIndex + i) % CATEGORY_ORDER.length];
    const remaining = TOPICS_BY_CATEGORY[candidate].filter((t) => !usedTopics.has(t));
    if (remaining.length) {
      category = candidate;
      topic = remaining[Math.floor(Math.random() * remaining.length)];
      break;
    }
  }

  if (!topic) {
    console.warn('auto-blog-generate: every topic is used — not generating a duplicate');
    try {
      await new Resend(resendKey).emails.send({
        from: 'ikonic303 Blog <blog@ikonicmarketing303.com>',
        to: 'info@ikonic303.com',
        subject: 'Blog generator paused — the topic list is used up',
        html: `<p>The daily blog generator ran but every topic in its list has already been
               published, so it did not write anything rather than duplicate an existing post.</p>
               <p><strong>To restart it:</strong> add new topics to <code>TOPICS_BY_CATEGORY</code> in
               <code>api/_lib/blog/auto-blog-generate.ts</code>.</p>
               <p>${usedTopics.size} topics used.</p>`,
      });
    } catch (err) {
      console.error('auto-blog-generate: exhausted-notice email failed:', err);
    }
    return res.status(200).json({ ok: true, skipped: 'all topics used', used: usedTopics.size });
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey });
  const prompt = `You are a professional content writer for ikonic303, a Denver-based company that SPECIALIZES IN RESIDENTIAL WINDOW TINTING — home window film for heat and glare reduction, UV and fade protection, daytime privacy, comfort, energy savings, and decorative and security film. As a SECONDARY service, ikonic also does commercial storefront window tint and window graphics. Keep the large majority of posts focused on residential/home window film; only write about commercial storefronts when the given category is "Commercial Storefront Tint". ikonic does NOT offer vehicle services of any kind (no vehicle wraps, no automotive window tint, no paint protection film, no ceramic coating) — never write about vehicles, cars, trucks, fleets, or automotive tint law (VLT). ikonic does NOT offer digital marketing, SEO, paid ads, CRM, websites, lead generation, business signage, channel letters, monument signs, or ADA/wayfinding signage — never write about any of those.

Write a high-quality, SEO-optimized blog post on this topic: "${topic}"
This post belongs to the "${category}" category.

Return ONLY a single valid JSON object — no markdown, no code fences, just the JSON:
{
  "title": "compelling SEO title (60 chars max)",
  "slug": "url-friendly-slug-with-hyphens-only",
  "excerpt": "2-3 sentence compelling description for the blog listing page",
  "content": "full article as clean HTML (use h2, h3, p, ul, li, strong tags; 900-1300 words; no outer html/body/head tags; no inline styles; no class attributes)",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Make it genuinely helpful and relevant to Denver business owners. Include real actionable advice. Write at an 8th-grade reading level. Mention Denver or Colorado where natural.`;

  let postData: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
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
    category,
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
      to: 'info@ikonic303.com',
      subject: `✅ New Blog Post Live: "${draft.title}"`,
      html: emailHtml,
    });
  } catch (emailErr: unknown) {
    const msg = emailErr instanceof Error ? emailErr.message : 'Unknown';
    return res.status(500).json({ error: 'Draft saved but email failed: ' + msg });
  }

  return res.status(200).json({ success: true, slug, title: draft.title, topic });
}
