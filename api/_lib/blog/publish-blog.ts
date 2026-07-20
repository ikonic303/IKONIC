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
  const { token, slug } = req.query as { token?: string; slug?: string };

  if (!token || !slug) {
    return res.status(400).send(page('Missing Parameters', 'Token and slug are required.', 'error'));
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

  return res.status(200).send(page(post.title, 'Your blog post is now live on ikonicmarketing303.com/blogs', 'success', post.slug));
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
  <title>${heading} | Ikonic Blog</title>
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
      ? `<a class="btn" href="https://ikonicmarketing303.com/post/${slug}" target="_blank">View Post →</a>
         <a class="btn-outline" href="https://ikonicmarketing303.com/blogs">All Posts</a>`
      : `<a class="btn-outline" href="https://ikonicmarketing303.com/blogs">Go to Blog</a>`}
  </div>
</body>
</html>`;
}
