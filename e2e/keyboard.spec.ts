import { surveyId } from './fixtures/test-ids';
import { openSurvey, SURVEY_WITHOUT_VOTES } from './helpers/detail-page';
import { openPage } from './helpers/page-checks';
import { expect, test } from './helpers/test';

/** Safari only steps to links and buttons with Tab when full keyboard access is switched on. */
function skipWithoutTabOrder(browserName: string): void {
  test.skip(browserName === 'webkit', 'Safari needs full keyboard access for this tab order.');
}

test('the first tab steps lead through header and hero', async ({ page, browserName }) => {
  skipWithoutTabOrder(browserName);
  await openPage(page, '/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Poll App' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'New survey' })).toBeFocused();
});

test('a survey opens with the keyboard', async ({ page }) => {
  await openPage(page, '/');
  await page.getByRole('link', { name: 'Coffee or tea' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(`/survey/${surveyId(SURVEY_WITHOUT_VOTES)}`);
});

test('the category filter can be used with the keyboard', async ({ page, browserName }) => {
  skipWithoutTabOrder(browserName);
  await openPage(page, '/');
  const toggle = page.getByRole('button', { name: 'Sort by categories' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  const firstOption = page.getByRole('button', { name: 'All Surveys' });
  await expect(firstOption).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(firstOption).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('a survey can be answered with the keyboard', async ({ page, supabase }) => {
  await openSurvey(page, SURVEY_WITHOUT_VOTES);
  const answer = page.getByRole('radio', { name: 'A. Coffee' });
  await answer.focus();
  await page.keyboard.press('Space');
  await expect(answer).toBeChecked();
  const complete = page.getByRole('button', { name: 'Complete survey' });
  await expect(complete).toBeEnabled();
  await complete.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Thank you for taking part!')).toBeVisible();
  expect(supabase.savedVotes).toHaveLength(1);
});
