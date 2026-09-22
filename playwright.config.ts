import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;
const IS_CI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  reporter: IS_CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // A wide screen shows the same layout as 1440 px, so only the layout itself is checked here.
      name: 'wide-1920',
      testMatch: /layout\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: `npx ng serve --configuration production --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !IS_CI,
  },
});
