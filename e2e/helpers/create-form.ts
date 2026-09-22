import { expect, Locator, Page } from '@playwright/test';

import { ANSWER_LETTERS } from '../../src/app/core/constants/poll.constants';
import { openPage } from './page-checks';

const DAY_IN_MS = 86_400_000;
const DATE_PART_LENGTH = 2;
const SECOND_QUESTION = 2;

/** Returns a local date some days from today in the format of a date field. */
export function dateFromToday(days: number): string {
  const date = new Date(Date.now() + days * DAY_IN_MS);
  const month = String(date.getMonth() + 1).padStart(DATE_PART_LENGTH, '0');
  const day = String(date.getDate()).padStart(DATE_PART_LENGTH, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Opens the start page and the form for a new survey. */
export async function openForm(page: Page): Promise<Locator> {
  await openPage(page, '/');
  await page.getByRole('button', { name: 'New survey' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create new survey' });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Fills in the text and the answers of one question. */
export async function fillQuestion(
  dialog: Locator,
  number: number,
  text: string,
  answers: string[],
): Promise<void> {
  const question = dialog.getByRole('group', { name: `Question ${number}` });
  await question.getByRole('textbox', { name: `${number}. Question` }).fill(text);
  for (const [index, answer] of answers.entries()) {
    await question.getByRole('textbox', { name: `Answer ${ANSWER_LETTERS[index]}` }).fill(answer);
  }
}

/** Fills in a complete survey with two questions, the first one with more than one answer. */
export async function fillSurvey(dialog: Locator, endDate: string): Promise<void> {
  await dialog.getByRole('textbox', { name: 'Survey name' }).fill('Team lunch');
  await dialog.getByRole('combobox', { name: 'Category' }).selectOption('Team Activities');
  await dialog.getByLabel('Set end date').fill(endDate);
  await dialog.getByRole('textbox', { name: 'Describing text' }).fill('Where should we eat?');
  await fillQuestion(dialog, 1, 'Which place do you like?', ['Pizza', 'Sushi']);
  await dialog.getByRole('checkbox', { name: 'Allow multiple answers' }).check();
  await dialog.getByRole('button', { name: 'Add next question' }).click();
  await fillQuestion(dialog, SECOND_QUESTION, 'Which day suits you?', ['Monday', 'Friday']);
}
