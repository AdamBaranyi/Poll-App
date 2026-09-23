import { openForm } from './helpers/create-form';
import { openSurvey, RUNNING_SURVEY } from './helpers/detail-page';
import { findButtonsWithoutTransition, openPage } from './helpers/page-checks';
import { expect, test } from './helpers/test';

test('the buttons of the home page change softly', async ({ page }) => {
  await openPage(page, '/');
  await page.getByRole('button', { name: 'Sort by categories' }).click();
  await expect(page.getByRole('button', { name: 'All Surveys' })).toBeVisible();
  expect(await findButtonsWithoutTransition(page)).toEqual([]);
});

test('the buttons of a survey change softly', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  expect(await findButtonsWithoutTransition(page)).toEqual([]);
});

test('the buttons of the form change softly', async ({ page }) => {
  const dialog = await openForm(page);
  await expect(dialog).toBeVisible();
  expect(await findButtonsWithoutTransition(page)).toEqual([]);
});
