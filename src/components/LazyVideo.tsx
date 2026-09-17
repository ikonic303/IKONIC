import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Mounts a real <video> only once it's near the viewport. wrap-gallery has 57 clips
 * (400MB+ total) — an eager <video preload="metadata"> per item would fire that many
 * network requests on page load. IntersectionObserver defers each one until scroll
 * brings it close.
 */
export default function LazyVideo({
  src,
  className = '',
  aspect = 'aspect-[9/16]',
}: {
  src: string;
  className?: string;
  aspect?: string;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-light ${className}`}
    >
      {visible ? (
        <video
          src={src}
          controls
          preload="metadata"
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-lighter/40 via-navy-light to-navy">
          <Play className="h-8 w-8 text-mint/50" />
        </div>
      )}
    </div>
  );
}
