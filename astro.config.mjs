// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The live domain. Used to build absolute links in the RSS feed, sitemap,
// canonical tags, and social-share metadata.
// NOTE: sergeyvoelker.com is the intended domain (purchase pending). Until DNS
// points here, Cloudflare also serves the site at a free *.pages.dev address.
export default defineConfig({
  site: 'https://sergeyvoelker.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
