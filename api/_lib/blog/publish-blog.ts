import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  const q = req.query as { token?: string; slug?: string };
  const b = (req.body ?? {}) as { token?: string; slug?: string };
  const token = b.token || q.token;
  const slug = b.slug || q.slug;

  if (!token || !slug) {
    return res.status(400).send(page('Missing Parameters', 'Token and slug are required.', 'error'));
  }

  // CONFIRMATION STEP (2026-07-21 security audit). This used to publish on GET, so any
  // mail-client link scanner, corporate URL prefetcher or chat-app unfurler that touched
  // a publish link in Josh's inbox published the post — silently, with no human involved.
  // Making it POST-only would break the emailed link (a link is a GET), so GET now renders
  // a confirm page and only the POST actually publishes. Scanners issue GET and change
  // nothing; Josh clicks once more and it goes live.
  if (req.method !== 'POST') {
    return res.status(200).send(confirmPage(slug, token));
  }

  const data = await upstash(['GET', `blog:post:${slug}`]);
  if (!data.result) {
    return res.status(404).send(page('Not Found', 'This draft was not found. It may have already been deleted.', 'error'));
  }

  const post = JSON.parse(data.result);

  if (post.token !== token) {
    return res.status(403).send(page('Invalid Link', 'This publish link is not valid.', 'error'));
  }

  if (post.status === 'published') {
    return res.status(200).send(page(post.title, 'This post is already live on the blog!', 'already', post.slug));
  }

  post.status = 'published';
  post.publishedAt = new Date().toISOString();
  await upstash(['SET', `blog:post:${slug}`, JSON.stringify(post)]);

  return res.status(200).send(page(post.title, 'Your blog post is now live on ikonic303.com/blogs', 'success', post.slug));
}


/** Interstitial shown on GET so a link prefetch cannot publish. Publishing needs the POST. */
function confirmPage(slug: string, token: string) {
  const esc = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Publish this post? | ikonic303 Blog</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #0B0D10; color: white;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; padding: 20px; }
    .card { background: #1a1a1a; border: 1px solid #00FF9D; border-radius: 16px;
            padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; }
    h1 { font-size: 22px; margin-bottom: 12px; }
    p { color: #9aa0a6; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
    code { color: #00FF9D; font-size: 13px; word-break: break-all; }
    button { background: #00FF9D; color: #0B0D10; border: 0; border-radius: 10px;
             padding: 14px 28px; font-size: 16px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size:52px;margin-bottom:20px;">📝</div>
    <h1>Publish this post?</h1>
    <p>This will make <code>${esc(slug)}</code> live on ikonic303.com/blogs.</p>
    <form method="POST">
      <input type="hidden" name="slug" value="${esc(slug)}">
      <input type="hidden" name="token" value="${esc(token)}">
      <button type="submit">Publish now</button>
    </form>
  </div>
</body>
</html>`;
}

function page(title: string, message: string, state: 'success' | 'already' | 'error', slug?: string) {
  const color = state === 'error' ? '#ff4444' : '#00FF9D';
  const icon = state === 'error' ? '❌' : '✅';
  const heading = state === 'error' ? 'Error' : state === 'already' ? 'Already Live' : 'Published!';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${heading} | ikonic303 Blog</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #0B0D10; color: white;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; padding: 20px; }
    .card { background: #1a1a1a; border: 1px solid ${color}; border-radius: 16px;
            padding: 48px 40px; max-width: 520px; width: 100%; text-align: center; }
    .icon { font-size: 52px; margin-bottom: 20px; }
    h1 { color: ${color}; font-size: 28px; margin-bottom: 10px; }
    .post-title { color: rgba(255,255,255,0.7); font-size: 15px; margin-bottom: 14px;
                  font-style: italic; }
    p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
    .btn { display: inline-block; background: #00FF9D; color: #0B0D10; font-weight: bold;
           padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; }
    .btn-outline { display: inline-block; border: 1px solid rgba(255,255,255,0.2);
                   color: rgba(255,255,255,0.6); padding: 12px 28px; border-radius: 8px;
                   text-decoration: none; font-size: 14px; margin-left: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${heading}</h1>
    <p class="post-title">"${title}"</p>
    <p>${message}</p>
    ${slug
      ? `<a class="btn" href="https://ikonic303.com/post/${slug}" target="_blank">View Post →</a>
         <a class="btn-outline" href="https://ikonic303.com/blogs">All Posts</a>`
      : `<a class="btn-outline" href="https://ikonic303.com/blogs">Go to Blog</a>`}
  </div>
</body>
</html>`;
}
