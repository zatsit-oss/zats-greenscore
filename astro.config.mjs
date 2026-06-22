// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Public site URL, used to build absolute URLs for Open Graph / social tags.
  site: 'https://greenscore.zatsit.fr',
  vite: {
    plugins: [tailwindcss()]
  }
});