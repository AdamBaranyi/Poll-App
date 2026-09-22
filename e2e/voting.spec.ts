import { Page } from '@playwright/test';

import type { VoteRow } from '../src/app/core/models/vote.model';
import { surveyId, testId, VOTE_ID_KIND } from './fixtures/test-ids';
import { answerRunningSurvey, openSurvey, resultRow, RUNNING_SURVEY } from './helpers/detail-page';
import { SavedVote } from './helpers/rest-answers';
import { expect, test } from './helpers/test';

const CHOSEN_ANSWERS = ['B. Saturday', 'A. Bowling', 'C. Escape room'];
const OTHER_VOTE_NUMBER = 999;

/** Checks that one row per chosen answer was saved, all with the same submission id. */
function expectSavedVotes(savedVotes: SavedVote[], chosenIds: string[]): void {
  expect(savedVotes.map((vote) => vote.option_id).sort()).toEqual(chosenIds.sort());
  expect(new Set(savedVotes.map((vote) => vote.submission_id)).size).toBe(1);
  expect(savedVotes.every((vote) => vote.survey_id === surveyId(RUNNING_SURVEY))).toBe(true);
}

/** Builds the vote of another visitor for the answer with the given label. */
async function voteFor(page: Page, label: string): Promise<VoteRow> {
  const input = page.getByLabel(label);
  const questionId = (await input.getAttribute('name')) ?? '';
  return {
    id: testId(VOTE_ID_KIND, OTHER_VOTE_NUMBER),
    question_id: questionId,
    option_id: await input.inputValue(),
  };
}

test('Complete survey stays disabled until every question has an answer', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  const complete = page.getByRole('button', { name: 'Complete survey' });
  await expect(complete).toBeDisabled();
  await page.getByRole('radio', { name: 'B. Saturday' }).check();
  await expect(complete).toBeDisabled();
  await page.getByRole('checkbox', { name: 'A. Bowling' }).check();
  await expect(complete).toBeEnabled();
});

test('a single choice question keeps only one answer', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await page.getByRole('radio', { name: 'A. Friday' }).check();
  await page.getByRole('radio', { name: 'B. Saturday' }).check();
  await expect(page.getByRole('radio', { name: 'A. Friday' })).not.toBeChecked();
});

test('voting saves each answer under one id and updates results', async ({ page, supabase }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await answerRunningSurvey(page);
  const chosenIds = await Promise.all(
    CHOSEN_ANSWERS.map((name) => page.getByLabel(name).inputValue()),
  );
  await page.getByRole('button', { name: 'Complete survey' }).click();
  await expect(page.getByText('Thank you for taking part! Your answers are saved.')).toBeVisible();
  expectSavedVotes(supabase.savedVotes, chosenIds);
  await expect(resultRow(page, 'Saturday')).toContainText('60%');
  await expect(resultRow(page, 'Escape room')).toContainText('20%');
});

test('after voting the survey stays read-only, also when it is opened again', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  await answerRunningSurvey(page);
  await page.getByRole('button', { name: 'Complete survey' }).click();
  await expect(page.getByRole('radio', { name: 'A. Friday' })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'A. Friday' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Complete survey' })).toHaveCount(0);
});

test('the results change live when someone else votes, a vote counts once', async ({
  page,
  supabase,
}) => {
  await openSurvey(page, RUNNING_SURVEY);
  await expect.poll(() => supabase.realtime.openChannels()).toBe(1);
  const vote = await voteFor(page, 'A. Friday');
  supabase.realtime.pushVote(vote);
  await expect(resultRow(page, 'Friday')).toContainText('40%');
  supabase.realtime.pushVote(vote);
  await expect(resultRow(page, 'Friday')).toContainText('40%');
});

test('a message appears when the answers cannot be saved', async ({ page, supabase }) => {
  supabase.failVotes = true;
  await openSurvey(page, RUNNING_SURVEY);
  await answerRunningSurvey(page);
  await page.getByRole('button', { name: 'Complete survey' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Your answers could not be saved. Please try again.',
  );
  await expect(page.getByRole('button', { name: 'Complete survey' })).toBeEnabled();
});
