import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (req.headers['x-ops-key'] !== process.env.OPS_INGEST_KEY) {
    return res.status(401).json({ error: 'Invalid ingest key' });
  }

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
