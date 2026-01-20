// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';
import react from '@astrojs/react'
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ybor.ai',
  base: '',

  vite: {
    plugins: [tailwind()]
  },

  integrations: [
    react(),
    sitemap({
      // Customize sitemap for better SEO
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Filter out API routes and other non-page routes
      filter: (page) => !page.includes('/api/'),
      // Customize priority for important pages
      serialize: (item) => {
        // Homepage gets highest priority
        if (item.url === 'https://www.ybor.ai/') {
          item.priority = 1.0;
        }
        // Product pages get high priority
        if (item.url.includes('/products/')) {
          item.priority = 0.9;
        }
        // Contact and careers pages
        if (item.url.includes('/contact') || item.url.includes('/culture-and-careers')) {
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],
  adapter: vercel()
});