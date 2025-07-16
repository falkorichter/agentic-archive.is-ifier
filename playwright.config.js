import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'chrome-extension://',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        args: [
          '--disable-extensions-except=.',
          '--load-extension=.',
          '--disable-dev-shm-usage',
          '--no-sandbox'
        ],
      },
    },
  ],

  // Global setup for installing browsers
  globalSetup: './tests/playwright/global-setup.js',
});