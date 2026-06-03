import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import Sitemap from "vite-plugin-sitemap"

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://ikonicmarketing303.com',
      dynamicRoutes: [
        '/',
        '/about',
        '/contact',
        '/services',
        '/services/web-design',
        '/services/crm-automation',
        '/services/reputation',
        '/services/speed-to-lead',
        '/services/marketing',
        '/learn-more',
        '/commercial-wraps',
        '/careers',
        '/blogs',
        '/wrap-calculator',
        '/print-ship',
        '/lost-call-calculator',
        '/branded-to-win',
        '/sticker-builder',
        '/services/paint-protection-film',
        '/services/window-tint',
        '/services/ceramic-coating',
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
