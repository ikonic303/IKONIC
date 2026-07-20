import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@vercel/kv';

// This project's Redis creds live under UPSTASH_* (Vercel KV is Upstash underneath),
// while @vercel/kv's default `kv` export reads KV_REST_API_*. Those are unset here, so
// the default export threw on every request and ingest returned 500. Accept either.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const kv = REDIS_URL && REDIS_TOKEN ? createClient({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

export async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // FAIL CLOSED: an unset OPS_INGEST_KEY made this `undefined !== undefined` — false —
  // so auth PASSED for anyone. A missing key must lock the door, not remove it.
  const ingestKey = process.env.OPS_INGEST_KEY || '';
  if (!ingestKey || req.headers['x-ops-key'] !== ingestKey) {
    return res.status(401).json({ error: 'Invalid ingest key' });
  }
  if (!kv) return res.status(503).json({ error: 'Store not configured' });

  try {
    const e = req.body;
    e.id = 'evt-' + Date.now();
    e.ts = e.ts || new Date().toISOString();

    await kv.lpush('ops_feed', JSON.stringify(e));
    await kv.ltrim('ops_feed', 0, 299);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to ingest event' });
  }
}
