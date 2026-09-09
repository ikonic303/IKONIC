import { Helmet } from 'react-helmet-async';

/**
 * Injects a <script type="application/ld+json"> block into <head> via Helmet.
 * `data` is a plain JSON-LD object (or array). "<" is escaped to < so a stray
 * "</script>" in any string value can't break out of the tag.
 *
 * Schema builders (serviceSchema, faqSchema, LOCAL_BUSINESS) live in ../lib/schema.
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data).replace(/</g, '\\u003c')}
      </script>
    </Helmet>
  );
}
