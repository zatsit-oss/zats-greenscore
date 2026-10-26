// @ts-check
import { defineConfig } from 'astro/config';

import AstroPWA from '@vite-pwa/astro';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Public site URL, used to build absolute URLs for Open Graph / social tags.
  site: 'https://greenscore.zatsit.fr',
  integrations: [
    AstroPWA({
      devOptions: {
        enabled: false
      },
      injectRegister: false,
      registerType: 'prompt',
      // The manifest is kept in public/ so the shared layout controls its
      // link tags explicitly, including the Apple-specific metadata.
      manifest: false,
      includeAssets: [
        'favicon.svg',
        'app-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'apple-touch-icon.png'
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{html,js,css,svg,webmanifest}'],
        ignoreURLParametersMatching: [
          /^projectId$/,
          /^id$/,
          /^evaluationType$/
        ],
        // Disable the integration's default fallback to the home page. Each
        // generated route has its own precached HTML entry.
        navigateFallback: undefined
      }
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});