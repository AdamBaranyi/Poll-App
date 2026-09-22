import { environment } from '../src/environments/environment';
import { surveyId } from './fixtures/test-ids';
import { expect, test } from './helpers/test';
import {
  findAccessibilityViolations,
  findSmallTexts,
  hasHorizontalScroll,
  watchPageProblems,
} from './helpers/page-checks';

const MIN_FONT_SIZE = 16;
const RUNNING_SURVEY = 1;
const ENDED_SURVEY = 7;
const PAGES = [
  '/',
  `/survey/${surveyId(RUNNING_SURVEY)}`,
  `/survey/${surveyId(ENDED_SURVEY)}`,
  '/survey/unknown',
];

test('header links back to the home page', async ({ page }) => {
  await page.goto(`/survey/${surveyId(RUNNING_SURVEY)}`);
  await page.getByRole('link', { name: 'Poll App' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Collect Feedback, Unlock Ideas',
  );
});

test('unknown address leads to the home page', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page).toHaveURL('/');
});

for (const path of PAGES) {
  test(`${path} fits the screen without horizontal scrolling`, async ({ page }) => {
    await page.goto(path);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test(`${path} uses no text smaller than 16 px`, async ({ page }) => {
    await page.goto(path);
    expect(await findSmallTexts(page, MIN_FONT_SIZE)).toEqual([]);
  });

  test(`${path} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    expect(await findAccessibilityViolations(page)).toEqual([]);
  });

  test(`${path} loads without errors or third-party requests`, async ({ page, baseURL }) => {
    const problems = watchPageProblems(page, [baseURL ?? '', environment.supabaseUrl]);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(problems).toEqual([]);
  });
}
