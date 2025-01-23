import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import autoprefixer from 'autoprefixer'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (
            server.config.env.PROD &&
            req.url &&
            !req.url.includes('.') &&
            !req.url.startsWith('/api')
          ) {
            req.url = '/index.html' // Redirect all SPA routes to `index.html`
          }
          next()
        })
      }
    }
  ],
  base: '/',
  css: {
    postcss: {
      plugins: [
        autoprefixer({}) // add options if needed
      ]
    },
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'legacy-js-api']
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000
  }
})
