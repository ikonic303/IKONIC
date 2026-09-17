import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';

gsap.registerPlugin(ScrollTrigger);

const LAST_UPDATED = 'September 16, 2026';

const sections: { heading: string; body: React.ReactNode }[] = [
  {
    heading: '1. Agreement to These Terms',
    body: (
      <p>
        These Terms &amp; Conditions ("Terms," also referred to as our "Terms of Service") govern
        your use of ikonic303's website at ikonic303.com (the "Site") and any residential or
        commercial window film, window graphics, or related services you request from ikonic
        ("ikonic," "we," "us," or "our"). By browsing the Site, submitting a form, requesting an
        estimate, or engaging us for a project, you agree to these Terms. If you do not agree,
        please do not use the Site or request our services.
      </p>
    ),
  },
  {
    heading: '2. Our Services',
    body: (
      <p>
        ikonic provides residential and commercial window film installation — including
        solar/heat-rejection, UV and fade-protection, privacy, decorative, and security film — as
        well as commercial storefront window graphics and related branding and promotional
        graphics for customers in the Denver, Colorado metro area. Specific film products, glass
        compatibility, scope of work, and pricing for your project are set out in your written
        quote, which is incorporated into these Terms by reference for that project.
      </p>
    ),
  },
  {
    heading: '3. Estimates & Quotes',
    body: (
      <>
        <p>
          Estimates are typically provided free of charge after an in-home or on-site visit where
          we inspect your windows or glass. A written quote reflects the film, scope, and price
          for the work described in it. Quotes are based on the conditions observed at the time of
          the estimate; unforeseen conditions discovered once work begins (for example, damaged or
          non-standard glass, inaccessible windows, or a change in the scope you request) may
          require a revised quote before we continue.
        </p>
        <p>
          Quotes are valid for a limited time as stated on the quote itself. Pricing, film
          availability, and scheduling are not guaranteed until a quote is accepted.
        </p>
      </>
    ),
  },
  {
    heading: '4. Scheduling, Access & Site Conditions',
    body: (
      <p>
        You agree to provide reasonable access to the property and the windows or glass to be
        serviced, and to clear the immediate work area of furniture, blinds, window treatments, or
        obstructions where requested. Installation timing can be affected by weather, glass
        condition, or access issues outside our control; when that happens we will contact you to
        reschedule as soon as reasonably possible.
      </p>
    ),
  },
  {
    heading: '5. Payment',
    body: (
      <p>
        Payment terms — including any deposit, progress payment, or balance due on completion —
        are set out in your written quote or invoice. Amounts not paid according to those terms
        may be subject to a late payment charge or collection costs to the extent permitted by
        Colorado law. Accepting a quote is your agreement to pay for the work described in it.
      </p>
    ),
  },
  {
    heading: '6. Cancellations & Rescheduling',
    body: (
      <p>
        We ask for as much notice as possible if you need to cancel or reschedule a scheduled
        estimate or installation. Any cancellation or rescheduling terms specific to your project —
        including whether a deposit is refundable — will be stated in your written quote. Absent a
        different written agreement, ikonic may charge for materials already cut or ordered
        specifically for your project if you cancel after work has begun.
      </p>
    ),
  },
  {
    heading: '7. Film & Workmanship Warranty',
    body: (
      <>
        <p>
          Window film we install typically carries a manufacturer warranty against defects such as
          peeling, bubbling, cracking, or discoloration under normal use — often a lifetime
          warranty on residential film, though coverage varies by product and is issued by the film
          manufacturer, not ikonic. We will tell you what warranty applies to the specific film
          recommended for your windows.
        </p>
        <p>
          Separately, ikonic provides a workmanship guarantee on our installation for the period
          stated in your quote or invoice. Neither the manufacturer warranty nor our workmanship
          guarantee covers damage from misuse, improper cleaning, acts of nature, glass breakage
          unrelated to installation, or pre-existing conditions of the glass or frame.
        </p>
      </>
    ),
  },
  {
    heading: '8. Glass Compatibility & Pre-Existing Conditions',
    body: (
      <p>
        Not every film is safe for every type of glass — factors like single- versus dual-pane
        construction, existing low-E coatings, pane size, and shading can affect whether a given
        film is appropriate. We check your glass before quoting and will tell you if a film is not
        recommended for your windows. ikonic is not responsible for pre-existing glass defects,
        failing seals, prior coatings, or conditions not disclosed to us that contribute to thermal
        stress, seal failure, or breakage after film is installed on glass we did not identify as
        unsuitable at the time of the estimate.
      </p>
    ),
  },
  {
    heading: '9. Website Use & Content',
    body: (
      <p>
        The text, images, graphics, and design of the Site are owned by ikonic or used with
        permission and are protected by applicable intellectual property laws. You may view and
        share pages of the Site for personal, non-commercial reference, but you may not copy,
        republish, or use our content, photos, or graphics for commercial purposes without our
        written permission. Project photos on the Site may depict actual completed work; results
        can vary by building, glass, and film selected.
      </p>
    ),
  },
  {
    heading: '10. Third-Party Links & Embedded Forms',
    body: (
      <p>
        The Site may link to, or embed forms and chat widgets hosted by, third-party services
        (including our customer relationship platform) to let you request an estimate or contact
        us. Those third parties operate under their own terms and privacy practices, which we do
        not control. Submitting information through an embedded form is subject to that provider's
        terms in addition to these Terms.
      </p>
    ),
  },
  {
    heading: '11. Disclaimers',
    body: (
      <p>
        The Site and its content are provided "as is" without warranties of any kind, express or
        implied, except as expressly stated in a written quote, invoice, or warranty document we
        provide for a specific project. We do not guarantee that the Site will be uninterrupted,
        error-free, or free of inaccuracies, though we work to keep it accurate and up to date.
      </p>
    ),
  },
  {
    heading: '12. Limitation of Liability',
    body: (
      <p>
        To the fullest extent permitted by Colorado law, ikonic's total liability for any claim
        arising from the Site or from services we perform is limited to the amount you actually
        paid ikonic for the specific project giving rise to the claim. ikonic is not liable for
        indirect, incidental, consequential, or special damages, including lost time or lost use of
        a room or building, arising from the Site or from our services.
      </p>
    ),
  },
  {
    heading: '13. Governing Law',
    body: (
      <p>
        These Terms are governed by the laws of the State of Colorado, without regard to its
        conflict-of-law principles. Any dispute arising from these Terms or from services we
        perform will be resolved in the state or federal courts located in Colorado, and you
        consent to jurisdiction and venue there.
      </p>
    ),
  },
  {
    heading: '14. Changes to These Terms',
    body: (
      <p>
        We may update these Terms from time to time to reflect changes in our services, the Site,
        or applicable law. The "Last updated" date below shows when these Terms were last revised.
        Continued use of the Site or continued engagement of our services after an update means
        you accept the revised Terms.
      </p>
    ),
  },
  {
    heading: '15. Contact Us',
    body: (
      <p>
        Questions about these Terms? Contact ikonic303 at{' '}
        <a href="mailto:info@ikonic303.com" className="text-mint hover:underline">
          info@ikonic303.com
        </a>
        , call{' '}
        <a href="tel:+17206791230" className="text-mint hover:underline">
          (720) 679-1230
        </a>
        , or write to ikonic303, Wheat Ridge, Colorado.
      </p>
    ),
  },
];

export default function Terms() {
  const headerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Terms & Conditions | ikonic303"
        description="Terms and conditions (terms of service) governing use of the ikonic303 website and our residential and commercial window film and window graphics services in the Denver metro."
        canonical="/terms"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-[6vw] relative z-10">
        <div ref={headerRef} className="max-w-3xl mx-auto">
          <p className="text-micro text-mint mb-4">LEGAL</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-offwhite mb-4 leading-tight">
            Terms &amp; <span className="text-mint">Conditions</span>
          </h1>
          <p className="text-offwhite-dark">
            Also referred to as our Terms of Service. Last updated: {LAST_UPDATED}.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="pb-16 px-[6vw] relative z-10">
        <div className="max-w-3xl mx-auto space-y-10">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-xl font-bold text-mint mb-3">{s.heading}</h2>
              <div className="space-y-4 text-offwhite-dark leading-relaxed text-sm">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
