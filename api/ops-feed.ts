import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Basic auth check
  const auth = (req.headers.authorization || '');
  const [, b64] = auth.split(' ');
  const [user, pass] = b64 ? Buffer.from(b64, 'base64').toString().split(':') : ['', ''];
  const okUser = process.env.OPS_USER || 'ikonic';

  if (user !== okUser || pass !== process.env.OPS_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Ikonic Ops"');
    return res.status(401).json({ error: 'Auth required' });
  }

  try {
    const raw = await kv.lrange('ops_feed', 0, 299);
    const events = raw.map((r: string) => JSON.parse(r));

    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json({ updated: new Date().toISOString(), events });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to fetch feed' });
  }
}
