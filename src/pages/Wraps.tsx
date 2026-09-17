import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';
import PhotoFrame from '../components/PhotoFrame';
import LazyVideo from '../components/LazyVideo';
import { wrapImages, wrapVideos } from '../data/wrapGallery';

export default function Wraps() {
  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Vehicle Wraps Gallery Denver"
        description="Completed vehicle wrap photos and videos from ikonic — full wraps, partial wraps, and fleet graphics for Denver-area vehicles."
        canonical="/vehicle-wraps"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR WORK</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-6 leading-tight text-balance">
            Vehicle Wraps
          </h1>
          <p className="text-lg text-offwhite-dark">
            Completed wraps from the shop — {wrapImages.length} photos and {wrapVideos.length} videos.
          </p>
        </div>
      </section>

      {/* Photos */}
      <section className="px-[6vw] pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-6">
            Photos ({wrapImages.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {wrapImages.map((img) => (
              <PhotoFrame key={img.id} src={img.src} alt="Completed vehicle wrap" />
            ))}
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="px-[6vw] pb-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-offwhite mb-6">
            Videos ({wrapVideos.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {wrapVideos.map((vid) => (
              <LazyVideo key={vid.id} src={vid.src} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Want a Wrap Like This?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Tell us about your vehicle and what you have in mind, and we'll follow up with next
            steps.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get in Touch
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
