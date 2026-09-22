import { expect, test } from './helpers/test';

const OK = 200;

const EXPECTED_HEADERS: Record<string, string> = {
  'content-security-policy': "script-src 'self'",
  'referrer-policy': 'strict-origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

test('the live version sends the security headers', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response?.headers() ?? {};
  for (const [name, part] of Object.entries(EXPECTED_HEADERS)) {
    expect(headers[name] ?? '', name).toContain(part);
  }
});

test('an address of the app works when it is opened directly', async ({ page }) => {
  const response = await page.goto('/survey/00000000-0000-4000-8000-000000000001');
  expect(response?.status()).toBe(OK);
  await expect(page.getByRole('heading', { name: 'Plan the team event' })).toBeVisible();
});

test('the policy blocks a script that someone smuggles into the page', async ({ page }) => {
  const blocked: string[] = [];
  await page.goto('/');
  page.on('console', (message) => blocked.push(message.text()));
  await page.evaluate(() => {
    document.body.insertAdjacentHTML('beforeend', '<img src="x" onerror="window.hacked = true">');
  });
  await expect.poll(() => blocked.join(' ')).toContain('Content Security Policy');
  expect(await page.evaluate(() => 'hacked' in window)).toBe(false);
});
