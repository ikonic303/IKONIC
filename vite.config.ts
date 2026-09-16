import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import Sitemap from "vite-plugin-sitemap"

// vite dev has no equivalent of vercel.json's rewrites, so /service-areas and
// /service-areas/:slug 404 into the SPA's own 404 route in dev. This mirrors the
// production rewrite locally so `npm run dev` matches deployed behavior.
function serviceAreaCleanUrls() {
  return {
    name: 'service-area-clean-urls',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const pathname = req.url.split('?')[0];
        if (pathname === '/service-areas' || pathname === '/service-areas/') {
          req.url = '/service-areas/index.html';
        } else {
          const m = pathname.match(/^\/service-areas\/([a-z0-9-]+)\/?$/);
          if (m) req.url = `/service-areas/${m[1]}.html`;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    serviceAreaCleanUrls(),
    react(),
    Sitemap({
      hostname: 'https://ikonic303.com',
      // Serve public/robots.txt verbatim (Josh's AI-crawler rules); don't let the
      // plugin overwrite it with its minimal auto-generated robots.txt.
      generateRobotsTxt: false,
      // marketing.html still ships in dist/ (the page is kept, just unlinked and
      // 301-redirected) — keep the plugin from auto-adding it back to the sitemap.
      exclude: ['/marketing', '/marketing.html'],
      // 2026-08-29 — site refocused on architectural window film & graphics. The
      // digital-marketing, AI, print, and book routes were removed from the sitemap
      // (their pages are unrouted and 301-redirect to /services; see vercel.json).
      dynamicRoutes: [
        '/',
        '/about',
        '/contact',
        '/services',
        '/learn-more',
        '/careers',
        '/blogs',
        '/gallery',
        '/window-tint',
        '/window-tint/films-and-pricing',
        '/window-tint/solar-heat',
        '/window-tint/uv-protection',
        '/window-tint/privacy',
        '/window-tint/decorative-privacy',
        '/window-tint/security-film',
        '/window-tint/office',
        '/window-tint/storefront',
        '/storefront-graphics',
        '/service-areas/wheat-ridge',
        '/service-areas/arvada',
        '/service-areas/lakewood',
        '/service-areas/golden',
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'gsap-vendor': ['gsap'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
  server: {
    // proxy not needed when using vercel dev (handles /api internally)
  },
});
