import { Locator, Page } from '@playwright/test';

import { surveyId } from './fixtures/test-ids';
import { expect, test } from './helpers/test';

const SURVEY_WITHOUT_END_DATE = 5;

/** Returns the titles of the cards in the list below the tabs. */
function listTitles(page: Page): Locator {
  return page.getByRole('region', { name: 'All surveys' }).getByRole('heading', { level: 4 });
}

/** Opens the category dropdown and picks one entry. */
async function chooseCategory(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Sort by categories' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('ending soon shows the three running surveys that end first', async ({ page }) => {
  await page.goto('/');
  const endingSoon = page.getByRole('region', { name: 'Ending soon surveys' });
  await expect(endingSoon.getByRole('heading', { level: 4 })).toHaveText([
    'Plan the team event',
    'Fitness habits',
    'Favorite games',
  ]);
});

test('ending soon stands above the list of all surveys', async ({ page }) => {
  await page.goto('/');
  const endingSoon = page.getByRole('region', { name: 'Ending soon surveys' });
  const list = page.getByRole('region', { name: 'All surveys' });
  await expect(endingSoon).toBeVisible();
  const endingSoonTop = (await endingSoon.boundingBox())?.y ?? 0;
  const listTop = (await list.boundingBox())?.y ?? 0;
  expect(endingSoonTop).toBeLessThan(listTop);
});

test('the list shows running surveys with category, title and deadline', async ({ page }) => {
  await page.goto('/');
  await expect(listTitles(page)).toHaveText([
    'Plan the team event',
    'Fitness habits',
    'Favorite games',
    'Learning formats',
    'Coffee or tea',
  ]);
  const firstCard = page.getByRole('region', { name: 'All surveys' }).getByRole('article').first();
  await expect(firstCard).toContainText('Team Activities');
  await expect(firstCard).toContainText('Ends in 1 day');
});

test('the past tab shows only ended surveys, the latest first', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Past survey' }).click();
  await expect(listTitles(page)).toHaveText(['Remote work', 'Summer outing']);
  const firstCard = page.getByRole('region', { name: 'All surveys' }).getByRole('article').first();
  await expect(firstCard).toContainText('Ended on');
});

test('the category filter works in both tabs and All Surveys resets it', async ({ page }) => {
  await page.goto('/');
  await chooseCategory(page, 'Team Activities');
  await expect(listTitles(page)).toHaveText(['Plan the team event']);
  await page.getByRole('button', { name: 'Past survey' }).click();
  await expect(listTitles(page)).toHaveText(['Summer outing']);
  await chooseCategory(page, 'All Surveys');
  await expect(listTitles(page)).toHaveText(['Remote work', 'Summer outing']);
});

test('the dropdown closes with Escape and gives the focus back', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Sort by categories' });
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
});

test('a survey card opens the detail page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Coffee or tea' }).click();
  await expect(page).toHaveURL(`/survey/${surveyId(SURVEY_WITHOUT_END_DATE)}`);
});

test('a message appears when the surveys cannot be loaded', async ({ page, supabase }) => {
  supabase.failRequests = true;
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText(
    'The surveys could not be loaded. Please try again later.',
  );
});
