import { defineConfig, devices } from '@playwright/test';

import baseConfig from './playwright.config';

/**
 * Runs the same tests in Safari and Firefox. These browsers are slower to start, so they are not
 * part of the pipeline. Run `npm run test:e2e:browsers` by hand before a deployment.
 */
export default defineConfig({
  ...baseConfig,
  projects: [
    { name: 'iphone-safari', use: { ...devices['iPhone 15'] } },
    { name: 'ipad-safari', use: { ...devices['iPad (gen 7)'] } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'] } },
    { name: 'desktop-firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
