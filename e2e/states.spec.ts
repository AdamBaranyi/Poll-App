import { Page } from '@playwright/test';

import { answerRunningSurvey, openSurvey, RUNNING_SURVEY } from './helpers/detail-page';
import { openForm } from './helpers/create-form';
import {
  findAccessibilityViolations,
  findSmallTexts,
  hasHorizontalScroll,
  openPage,
} from './helpers/page-checks';
import { expect, test } from './helpers/test';

const MIN_FONT_SIZE = 16;
const DESKTOP_WIDTH = 1100;

/** Checks that a state has no small text, no accessibility violation and no sideways scrolling. */
async function expectCleanState(page: Page): Promise<void> {
  expect(await findSmallTexts(page, MIN_FONT_SIZE)).toEqual([]);
  expect(await findAccessibilityViolations(page)).toEqual([]);
  expect(await hasHorizontalScroll(page)).toBe(false);
}

test('the open category menu stays readable and accessible', async ({ page }) => {
  await openPage(page, '/');
  await page.getByRole('button', { name: 'Sort by categories' }).click();
  await expect(page.getByRole('button', { name: 'All Surveys' })).toBeVisible();
  await expectCleanState(page);
});

test('the survey after voting stays readable and accessible', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await answerRunningSurvey(page);
  await page.getByRole('button', { name: 'Complete survey' }).click();
  await expect(page.getByText('Thank you for taking part!')).toBeVisible();
  await expectCleanState(page);
});

test('the form with error messages stays readable and accessible', async ({ page }) => {
  const dialog = await openForm(page);
  await dialog.getByRole('button', { name: 'Publish' }).click();
  await expect(dialog.getByText('Please enter a survey name.')).toBeVisible();
  await expectCleanState(page);
});

test('the closed results on small screens stay readable and accessible', async ({
  page,
  viewport,
}) => {
  test.skip((viewport?.width ?? 0) >= DESKTOP_WIDTH, 'Large screens always show the results.');
  await openSurvey(page, RUNNING_SURVEY);
  await page.getByRole('button', { name: 'Close results' }).click();
  await expect(page.getByRole('button', { name: 'See results' })).toBeVisible();
  await expectCleanState(page);
});
