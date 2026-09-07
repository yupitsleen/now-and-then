import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // Exclude E2E tests (Playwright tests)
    exclude: ['**/node_modules/**', '**/e2e/**'],
    pool: 'forks',
    // Four, not "as many as possible". Each fork carries its own jsdom, so
    // oversubscribing thrashes: on a 12-core machine 8 workers ran the suite in
    // 4m59 and failed 0-6 tests at random (always timeouts, always green when
    // re-run alone), while 4 workers ran it in 2m21 with nothing failing.
    // Raise this only with timings to back it up.
    maxWorkers: 4,
    isolate: true, // Keep isolation to prevent test failures
    // Reduce overhead
    deps: {
      optimizer: {
        client: {
          enabled: true,
        },
      },
    },
    // Code coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'e2e/',
        'dist/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/test-utils/**',
        '**/__tests__/**',
        'vitest.setup.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'playwright.config.ts',
        'server/**', // Backend code (separate coverage needed)
        'database/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
})
