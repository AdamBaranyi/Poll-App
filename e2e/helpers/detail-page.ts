import { Locator, Page } from '@playwright/test';

import { surveyId } from '../fixtures/test-ids';

export const RUNNING_SURVEY = 1;
export const SURVEY_WITHOUT_VOTES = 5;
export const ENDED_SURVEY = 7;

/** Opens the detail view of a test survey. */
export async function openSurvey(page: Page, survey: number): Promise<void> {
  await page.goto(`/survey/${surveyId(survey)}`);
}

/** Returns the result row of an answer, found by the answer text. */
export function resultRow(page: Page, answer: string): Locator {
  return page
    .getByRole('region', { name: 'Survey results LIVE' })
    .getByRole('listitem')
    .filter({ hasText: `${answer}:` });
}

/** Answers both questions of the running test survey. */
export async function answerRunningSurvey(page: Page): Promise<void> {
  await page.getByRole('radio', { name: 'B. Saturday' }).check();
  await page.getByRole('checkbox', { name: 'A. Bowling' }).check();
  await page.getByRole('checkbox', { name: 'C. Escape room' }).check();
}
