import { openPage } from './helpers/page-checks';
import { expect, test } from './helpers/test';

const DESKTOP_WIDTH = 900;

test('the illustration moves when the pointer is over it', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < DESKTOP_WIDTH, 'Phones and tablets show no motion.');
  await openPage(page, '/');
  const star = page.locator('app-hero .star');
  await expect(star).toHaveCSS('transform', 'none');
  await page.locator('app-hero .visual').hover();
  await expect(star).not.toHaveCSS('transform', 'none');
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the illustration stays still', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) < DESKTOP_WIDTH, 'Phones and tablets show no motion.');
    await openPage(page, '/');
    await page.locator('app-hero .visual').hover();
    await expect(page.locator('app-hero .star')).toHaveCSS('transform', 'none');
  });
});
