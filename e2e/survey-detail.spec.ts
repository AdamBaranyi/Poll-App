import {
  ENDED_SURVEY,
  openSurvey,
  resultRow,
  RUNNING_SURVEY,
  SURVEY_WITHOUT_VOTES,
} from './helpers/detail-page';
import { expect, test } from './helpers/test';

const DESKTOP_WIDTH = 900;
const ANSWERS_PER_QUESTION = 3;

test('the detail view shows status, dates, category, title and all answers', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await expect(page.getByText('Published', { exact: true })).toBeVisible();
  await expect(page.getByText(/Ends on \d{2}\.\d{2}\.\d{4}/)).toBeVisible();
  await expect(page.getByText('Category: Team Activities')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plan the team event');
  const firstQuestion = page.getByRole('group', { name: '1. Which day suits you best?' });
  await expect(firstQuestion.getByRole('radio')).toHaveCount(ANSWERS_PER_QUESTION);
  const secondQuestion = page.getByRole('group', { name: '2. Which activities do you like?' });
  await expect(secondQuestion.getByRole('checkbox')).toHaveCount(ANSWERS_PER_QUESTION);
  await expect(secondQuestion).toContainText('More than one answer is possible.');
});

test('the results show the share of every answer and add up to 100 percent', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await expect(resultRow(page, 'Friday')).toContainText('25%');
  await expect(resultRow(page, 'Saturday')).toContainText('50%');
  await expect(resultRow(page, 'Sunday')).toContainText('25%');
  await expect(resultRow(page, 'Bowling')).toContainText('67%');
  await expect(resultRow(page, 'Cooking class')).toContainText('33%');
  await expect(resultRow(page, 'Escape room')).toContainText('0%');
});

test('rounded results of a question add up to exactly 100 percent', async ({ page }) => {
  await openSurvey(page, ENDED_SURVEY);
  await expect(resultRow(page, 'Train')).toContainText('34%');
  await expect(resultRow(page, 'Bus')).toContainText('33%');
  await expect(resultRow(page, 'Bike')).toContainText('33%');
});

test('a survey without votes says that there are no answers yet', async ({ page }) => {
  await openSurvey(page, SURVEY_WITHOUT_VOTES);
  await expect(page.getByText('There are no answers yet.')).toBeVisible();
  await expect(page.getByText('No end date')).toBeVisible();
});

test('an ended survey shows everything but cannot be answered', async ({ page }) => {
  await openSurvey(page, ENDED_SURVEY);
  await expect(page.getByText('Ended', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'A. Lake' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Complete survey' })).toHaveCount(0);
  await expect(resultRow(page, 'Lake')).toContainText('75%');
  await expect(
    page.getByText('This survey has ended, so answers are no longer possible.'),
  ).toBeVisible();
});

test('an unknown survey shows a message with a way back', async ({ page }) => {
  await page.goto('/survey/unknown');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Survey not found');
  await page.getByRole('link', { name: 'Back to all surveys' }).click();
  await expect(page).toHaveURL('/');
});

test('a message appears when the survey cannot be loaded', async ({ page, supabase }) => {
  supabase.failRequests = true;
  await openSurvey(page, RUNNING_SURVEY);
  await expect(page.getByRole('alert')).toHaveText(
    'The survey could not be loaded. Please try again later.',
  );
});

test('on large screens the results stand right of the survey', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < DESKTOP_WIDTH, 'Small screens show the results below.');
  await openSurvey(page, RUNNING_SURVEY);
  const survey = await page.getByRole('article').boundingBox();
  const results = await page.getByRole('region', { name: 'Survey results LIVE' }).boundingBox();
  expect(results?.x ?? 0).toBeGreaterThan((survey?.x ?? 0) + (survey?.width ?? 0));
});

test('on small screens the results can be closed and opened again', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) >= DESKTOP_WIDTH, 'Large screens always show the results.');
  await openSurvey(page, RUNNING_SURVEY);
  const heading = page.getByRole('heading', { name: 'Survey results LIVE' });
  await page.getByRole('button', { name: 'Close results' }).click();
  await expect(heading).toBeHidden();
  await page.getByRole('button', { name: 'See results' }).click();
  await expect(heading).toBeVisible();
});
