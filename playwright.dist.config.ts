import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.config';

const PORT = 4310;

/**
 * Runs the tests against the built app behind the headers of the live version, so the settings in
 * public/.htaccess are checked instead of only written down.
 */
export default defineConfig({
  ...baseConfig,
  testIgnore: undefined,
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'dist', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: `npx ng build && node scripts/serve-dist.mts`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
});
