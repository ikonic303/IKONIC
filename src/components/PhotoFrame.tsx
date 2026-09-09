import type { ReactNode } from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * Styled image slot. If `src` is given it renders the photo; otherwise it renders
 * an on-brand placeholder (navy gradient + label) that reads as an intentional
 * design element rather than a broken image.
 *
 * No residential-install photography ships with the repo yet. Drop real photos
 * into `public/photos/…` and pass `src` (e.g. src="/photos/living-room-tint.jpg").
 */
export default function PhotoFrame({
  src,
  alt,
  label,
  aspect = 'aspect-[4/3]',
  className = '',
  children,
}: {
  src?: string;
  alt: string;
  label?: string;
  aspect?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl border border-white/10 bg-navy-light ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-lighter/40 via-navy-light to-navy p-4 text-center"
          role="img"
          aria-label={alt}
        >
          <ImageIcon className="h-7 w-7 text-mint/50" />
          {label && (
            <span className="text-xs font-medium uppercase tracking-wide text-offwhite-dark">
              {label}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
