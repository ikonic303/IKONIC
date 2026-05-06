import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, User, Loader2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

interface BlogPost {
  title: string;
  excerpt: string;
  slug: string;
  link: string;
  date: string;
  author: string;
  category: string;
  image: string;
}

export default function Blogs() {
  const heroRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/blog-posts')
      .then(r => r.json())
      .then(data => {
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, []);

  // Animate cards whenever posts load
  useLayoutEffect(() => {
    if (!posts.length) return;
    const ctx = gsap.context(() => {
      const cards = postsRef.current?.querySelectorAll('.blog-card');
      if (cards) {
        gsap.fromTo(cards,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: {
              trigger: postsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
    return () => ctx.revert();
  }, [posts]);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Digital Marketing Blog | Tips for Denver Businesses | Ikonic Marketing"
        description="Marketing tips, GoHighLevel guides, and growth strategies for Denver-area businesses. Learn how to automate leads, improve your reputation, and scale your business."
        canonical="/blogs"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">INSIGHTS AND UPDATES</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6">
            Our <span className="text-mint">Blog</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-10">
            Get business growth tips, marketing strategies, and automation insights
            straight from the Ikonic team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="btn-primary inline-flex items-center gap-2">
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/services" className="btn-outline">
              View Services
            </a>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-offwhite-dark">
              <Loader2 className="w-5 h-5 animate-spin text-mint" />
              Loading posts...
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-20 text-offwhite-dark">
              <p className="text-lg mb-2">Could not load blog posts.</p>
              <p className="text-sm">Check that the GHL RSS feed is configured correctly.</p>
            </div>
          )}

          {!loading && !error && (
            <div ref={postsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <Link
                  key={index}
                  to={post.slug ? `/post/${post.slug}` : post.link}
                  className="blog-card group bg-charcoal border border-white/10 rounded-xl overflow-hidden hover:border-mint/30 transition-all duration-300 block"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-charcoal-light">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-mint/10 to-charcoal">
                        <span className="text-mint/40 text-4xl font-display font-bold">IK</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-mint text-charcoal text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="font-display text-lg font-bold text-offwhite mb-3 line-clamp-2 group-hover:text-mint transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-offwhite-dark text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-offwhite-dark">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-mint text-sm font-medium">
                      Read More <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4">
            Stay Connected
          </h2>
          <p className="text-offwhite-dark mb-8">
            Subscribe to our newsletter and get business growth tips and strategies
            straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
