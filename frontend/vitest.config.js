import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
  },
  coverage: {
    provider: 'c8',
    reporter: ['text', 'lcov'],
  },
})
