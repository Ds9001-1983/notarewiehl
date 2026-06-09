// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Notare Wiehl – statische Astro-Site.
// Original-URL-Struktur 1:1 erhalten (Trailing-Slash + Directory-Format) für SEO.
export default defineConfig({
  site: 'https://www.notare-wiehl.de',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Original-Startseiten-URL auf die Wurzel umleiten (SEO-Kontinuität).
  redirects: {
    '/HOME': '/',
  },
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  image: {
    // Standard-Sharp-Service; responsive AVIF/WebP über <Image>/<Picture>.
    responsiveStyles: true,
  },
});
