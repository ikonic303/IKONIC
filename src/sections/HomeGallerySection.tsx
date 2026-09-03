import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PhotoFrame from '../components/PhotoFrame';

// Residential projects preview. Drop real install photos into public/photos/ and
// add `src` to each item (e.g. src: '/photos/living-room-solar-film.jpg').
const projects = [
  { label: 'Living room · solar-control film', alt: 'Living room with solar-control window film reducing afternoon heat and glare' },
  { label: 'Primary bedroom · privacy film', alt: 'Primary bedroom window with daytime privacy film' },
  { label: 'Sunroom · heat-rejection film', alt: 'Sunroom windows treated with heat-rejection film' },
  { label: 'Kitchen · UV-blocking film', alt: 'Kitchen window with near-invisible UV-blocking film protecting cabinetry' },
  { label: 'Front entry · decorative frosted film', alt: 'Front entry sidelights with decorative frosted film' },
  { label: 'Stairwell · low-E winter film', alt: 'Tall stairwell window with low-E film for winter warmth retention' },
];

export default function HomeGallerySection() {
  return (
    <section id="gallery" className="relative z-20 py-20 lg:py-28">
      <div className="px-[6vw] max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-2xl">
            <p className="text-micro text-mint mb-4">OUR WORK</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-offwhite mb-3">
              Completed Residential Projects
            </h2>
            <p className="text-offwhite-dark">
              Homes across Wheat Ridge, Arvada, Lakewood, Golden, and greater Denver — living
              rooms, bedrooms, sunrooms, and entryways treated with the right film for each window.
            </p>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-mint font-medium hover:gap-3 transition-all whitespace-nowrap"
          >
            View full gallery <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <PhotoFrame key={p.label} alt={p.alt} label={p.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
