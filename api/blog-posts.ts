import type { VercelRequest, VercelResponse } from '@vercel/node';

const GHL_BLOG_URL = 'https://go.ikonicmarketing303.com/blogs';

function resolveNuxtArr(arr: any[], idx: number, depth = 0): any {
  if (depth > 12 || idx === -1 || idx === null || idx === undefined) return null;
  if (idx >= arr.length) return idx;
  const val = arr[idx];
  if (typeof val === 'string' || typeof val === 'boolean' || val === null) return val;
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) return val.map((i: any) => resolveNuxtArr(arr, i, depth + 1));
  if (typeof val === 'object') {
    const obj: any = {};
    for (const [k, v] of Object.entries(val)) {
      obj[k] = typeof v === 'number' ? resolveNuxtArr(arr, v as number, depth + 1) : v;
    }
    return obj;
  }
  return val;
}

async function upstash(command: unknown[]): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { result: null };
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  return res.json();
}

async function getRedisPublishedPosts() {
  try {
    const slugsData = await upstash(['SMEMBERS', 'blog:slugs']);
    const slugs: string[] = slugsData.result || [];
    if (!slugs.length) return [];

    const results = await Promise.all(
      slugs.map(async (slug) => {
        const d = await upstash(['GET', `blog:post:${slug}`]);
        if (!d.result) return null;
        return JSON.parse(d.result);
      }),
    );

    return results
      .filter((p) => p && p.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .map((p) => ({
        title: p.title,
        excerpt: p.excerpt,
        slug: p.slug,
        link: `/post/${p.slug}`,
        date: new Date(p.publishedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        author: p.author,
        category: p.category,
        image: '',
      }));
  } catch {
    return [];
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [redisPosts, ghlHtml] = await Promise.all([
      getRedisPublishedPosts(),
      fetch(GHL_BLOG_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      }).then((r) => r.text()).catch(() => ''),
    ]);

    let ghlPosts: any[] = [];

    if (ghlHtml) {
      const match = ghlHtml.match(/__NUXT_DATA__">\[(.+?)\]<\/script/s);
      if (match) {
        const arr: any[] = JSON.parse('[' + match[1] + ']');
        const stateStr = JSON.stringify(arr);
        const blogKeyMatch = stateStr.match(/"blogPosts-[^"]+":(\d+)/);
        if (blogKeyMatch) {
          const blogRootIdx = parseInt(blogKeyMatch[1]);
          const blogData = resolveNuxtArr(arr, blogRootIdx);
          const rawPosts: any[] = blogData?.blogPosts ?? [];

          ghlPosts = rawPosts.map((p: any) => ({
            title: p.title ?? '',
            excerpt: p.description ?? '',
            slug: p.urlSlug ?? '',
            link: p.canonicalLink ?? `https://go.ikonicmarketing303.com/post/${p.urlSlug}`,
            date: p.publishedAt
              ? new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : '',
            author: p.author?.name ?? 'Ikonic Team',
            category: p.categories?.[0]?.label?.replace(/-/g, ' ') ?? 'Marketing',
            image: p.imageUrl ?? '',
          }));
        }
      }
    }

    const posts = [...redisPosts, ...ghlPosts];
    if (!posts.length) return res.status(502).json({ error: 'Could not load blog posts' });

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ posts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message ?? 'Failed to load blog posts' });
  }
}
