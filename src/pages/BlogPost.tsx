import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

interface Post {
  title: string;
  description: string;
  content: string;
  urlSlug: string;
  image: string;
  imageAlt: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readTime: number | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/blog-post?slug=${encodeURIComponent(slug)}&_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setPost(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formattedDate = post?.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title={post ? `${post.title} | Ikonic Marketing Blog` : 'Blog | Ikonic Marketing'}
        description={post ? post.description : 'Digital marketing tips and strategies for Denver businesses from the Ikonic Marketing team.'}
        canonical={post ? `/post/${post.urlSlug}` : undefined}
        ogType="article"
        ogImage={post?.image || undefined}
      />
      <MatrixBackground />
      <Navigation />

      <main className="relative z-10 pt-28 pb-20 px-[6vw]">
        <div className="max-w-3xl mx-auto">

          <Link to="/blogs" className="inline-flex items-center gap-2 text-offwhite-dark hover:text-mint transition-colors text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>

          {loading && (
            <div className="flex items-center justify-center py-32 gap-3 text-offwhite-dark">
              <Loader2 className="w-5 h-5 animate-spin text-mint" />
              Loading post...
            </div>
          )}

          {notFound && !loading && (
            <div className="text-center py-32">
              <p className="text-offwhite text-2xl font-bold mb-4">Post not found</p>
              <Link to="/blogs" className="btn-primary">Back to Blogs</Link>
            </div>
          )}

          {post && !loading && (
            <>
              {/* Category */}
              <span className="px-3 py-1 bg-mint text-charcoal text-xs font-semibold rounded-full capitalize">
                {post.category}
              </span>

              {/* Title */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-offwhite mt-6 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-offwhite-dark mb-8 pb-8 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-mint to-mint-dark rounded-full flex items-center justify-center">
                    <span className="text-charcoal font-bold text-xs">{post.author.charAt(0)}</span>
                  </div>
                  <span>{post.author}</span>
                </div>
                {formattedDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formattedDate}
                  </div>
                )}
                {post.readTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readTime} min read
                  </div>
                )}
              </div>

              {/* Cover Image */}
              {post.image && (
                <div className="rounded-2xl overflow-hidden mb-10 border border-white/10">
                  <img
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              {/* Description / Excerpt */}
              <div className="bg-charcoal-light border border-white/10 rounded-2xl p-8 mb-10">
                <p className="text-offwhite-dark text-lg leading-relaxed italic">{post.description}</p>
              </div>

              {/* Full Article Content */}
              {post.content ? (
                <div
                  className="blog-post-content mb-10"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              ) : (
                <div className="mb-10 text-center py-16 border border-white/10 rounded-2xl">
                  <p className="text-offwhite text-lg font-semibold mb-3">Full content coming soon</p>
                  <p className="text-offwhite-dark text-sm">Our blog system is being updated. Check back shortly.</p>
                </div>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-10">
                  {post.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-offwhite-dark">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-mint/20 to-mint/5 border border-mint/30 rounded-2xl p-8 text-center">
                <p className="text-mint text-sm font-semibold mb-2">READY TO GROW YOUR BUSINESS?</p>
                <h3 className="font-display text-2xl font-bold text-offwhite mb-4">
                  Let's Build Your Lead System
                </h3>
                <p className="text-offwhite-dark mb-6 max-w-md mx-auto">
                  Get a free strategy session with the Ikonic team and see how we can automate your lead flow.
                </p>
                <Link to="/contact" className="btn-primary">
                  Start Now — It's Free
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
