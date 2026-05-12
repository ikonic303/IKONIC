import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 30;

const PLATFORM_GUIDES: Record<string, string> = {
  'Twitter / X': 'Max 280 characters. Punchy, direct, hook in the first sentence. Use 1-2 hashtags. No fluff.',
  'LinkedIn':    'Professional tone, 150-300 words. Lead with an insight or bold statement. Use line breaks for readability. 3-5 relevant hashtags at the end.',
  'Instagram':   '100-200 words. Engaging, conversational. Use emojis naturally throughout. End with a call to action. 5-8 hashtags at the end on a new line.',
  'Facebook':    '80-150 words. Friendly and approachable. Ask a question to drive comments. 1-3 hashtags.',
  'TikTok':      '50-100 words. High energy, trending language. Hook in the first line ("POV:", "Nobody talks about this...", etc.). 3-5 trending hashtags.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, tone, platforms } = req.body as {
    topic: string;
    tone: string;
    platforms: string[];
  };

  if (!topic || !platforms?.length) {
    return res.status(400).json({ error: 'topic and platforms are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const platformInstructions = platforms
    .map(p => `### ${p}\n${PLATFORM_GUIDES[p] || 'Write an engaging social media post.'}`)
    .join('\n\n');

  const prompt = `You are a social media expert. Write ${tone} social media posts about the following topic for each platform below.

Topic: "${topic}"
Tone: ${tone}

Return ONLY a valid JSON object with platform names as keys and post text as values. No markdown, no explanation, just the JSON.

Platforms and their requirements:
${platformInstructions}

Example format:
{"Twitter / X": "post text here", "LinkedIn": "post text here"}

Write the posts now:`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const raw = result.text?.trim() || '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const posts = JSON.parse(cleaned);

    return res.status(200).json({ posts });
  } catch (err: any) {
    console.error('generate-post error:', err);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
}
