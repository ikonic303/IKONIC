/**
 * blog.ts — single entry point for every blog operation.
 *
 * WHY ONE FILE: Vercel's Hobby plan allows a maximum of 12 Serverless Functions per
 * deployment, and EVERY file directly under api/ is one function. The project hit that
 * ceiling and deploys began failing with `exceeded_serverless_functions_per_deployment`.
 * Files under api/_lib/ are NOT counted (leading-underscore directories are excluded),
 * so the five blog handlers now live there and this dispatcher is the only function.
 * 5 functions -> 1.
 *
 * THE HANDLERS THEMSELVES ARE UNCHANGED. Each was moved verbatim into api/_lib/blog/
 * with only `export default async function handler` renamed to `export async function
 * handler`. No logic was rewritten — this is a packaging change, not a behaviour change.
 *
 * ROUTING: old public paths are preserved by rewrites in vercel.json, which cost zero
 * functions and pass query strings through. Anything already pointing at
 * /api/blog-posts, /api/blog-post?slug=…, /api/publish-blog?token=…&slug=… or
 * /api/generate-post keeps working — including publish links already sitting in
 * Josh's inbox, which would otherwise have broken.
 *
 * AUTH IS PER-ACTION, never at the door. These five endpoints have four different auth
 * models (cron secret, public read, URL token, none), so each handler keeps doing its
 * own check exactly as before. Do not hoist an auth check up here — that is how a
 * public read path accidentally inherits, or bypasses, someone else's gate.
 *
 * maxDuration is per-FILE, so it is set here for all actions. 60 is what the daily
 * generator needs; a fast read is unaffected by being allowed to take longer.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handler as list } from './_lib/blog/blog-posts.js';
import { handler as post } from './_lib/blog/blog-post.js';
import { handler as publish } from './_lib/blog/publish-blog.js';
import { handler as generatePost } from './_lib/blog/generate-post.js';
import { handler as autoGenerate } from './_lib/blog/auto-blog-generate.js';
import { handler as unpublish } from './_lib/blog/unpublish.js';

export const maxDuration = 60;

type Action = 'list' | 'post' | 'publish' | 'generate-post' | 'auto-generate' | 'unpublish';

const ROUTES: Record<Action, (req: VercelRequest, res: VercelResponse) => Promise<unknown>> = {
  list,
  post,
  publish,
  'generate-post': generatePost,
  'auto-generate': autoGenerate,
  unpublish,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = ((req.query?.action as string) || (req.body?.action as string) || 'list') as Action;

  const route = ROUTES[action];
  if (!route) {
    return res.status(400).json({
      error: `Unknown blog action "${action}". Expected one of: ${Object.keys(ROUTES).join(', ')}.`,
    });
  }

  return route(req, res);
}
