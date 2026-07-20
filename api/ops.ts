/**
 * ops.ts — single entry point for the ops dashboard feed + ingest.
 *
 * Same reason as api/blog.ts: Vercel's Hobby plan caps a deployment at 12 Serverless
 * Functions and every file directly under api/ is one. Files under api/_lib/ are not
 * counted, so both handlers moved there and this dispatcher is the only function.
 * 2 functions -> 1.
 *
 * Handlers are UNCHANGED — moved verbatim, with only the default export renamed.
 *
 * Dispatch is by HTTP METHOD rather than an action param, because that is exactly how
 * these two already differed and it keeps existing callers working untouched:
 *   GET  -> ops-feed   (basic auth, OPS_USER / OPS_PASSWORD)
 *   POST -> ops-ingest (x-ops-key header, OPS_INGEST_KEY)
 *
 * Each handler keeps its own auth check. They are different mechanisms guarding
 * different things — reading the feed vs. writing to it — and must not be merged into
 * one gate.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handler as feed } from './_lib/ops/ops-feed.js';
import { handler as ingest } from './_lib/ops/ops-ingest.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') return ingest(req, res);
  if (req.method === 'GET') return feed(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
