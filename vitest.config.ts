import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts']
  }
})
