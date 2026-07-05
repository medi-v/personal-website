// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from "@astrojs/cloudflare";

// PLACEHOLDER: when you have a real domain, replace the `site` value below,
// e.g. site: 'https://sergeyvoelker.com'
// It is used to build correct links in the RSS feed and the sitemap.
export default defineConfig({
  site: 'https://sergeyvoelker.pages.dev',
  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare()
});