import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  retries: 0,
  workers: 4,
  use: {
    baseURL: 'http://localhost:3111',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'node ../../examples/server.cjs',
    port: 3111,
    reuseExistingServer: !process.env.CI,
    env: { PORT: '3111' },
  },
});
