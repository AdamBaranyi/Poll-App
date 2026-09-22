import { MAX_ANSWERS, MIN_ANSWERS } from '../src/app/core/constants/poll.constants';
import { dateFromToday, fillSurvey, openForm } from './helpers/create-form';
import { openSurvey, RUNNING_SURVEY } from './helpers/detail-page';
import {
  findAccessibilityViolations,
  findSmallTexts,
  hasHorizontalScroll,
} from './helpers/page-checks';
import { CreatedSurvey, NEW_SURVEY_ID } from './helpers/rest-answers';
import { expect, test } from './helpers/test';

const MIN_FONT_SIZE = 16;
const DAYS_UNTIL_END = 7;
const SMALL_SCREEN = 600;
const OPTIONAL_FIELDS = 2;
const EXPECTED_SURVEY = {
  title: 'Team lunch',
  category: 'Team Activities',
  description: 'Where should we eat?',
};
const EXPECTED_QUESTIONS = [
  { position: 1, text: 'Which place do you like?', allow_multiple: true },
  { position: 2, text: 'Which day suits you?', allow_multiple: false },
];
const EXPECTED_ANSWERS = ['Pizza', 'Sushi', 'Monday', 'Friday'];
const REQUIRED_ERRORS = [
  'Please enter a survey name.',
  'Please choose a category.',
  'Please enter the question.',
  'Please fill in answer A.',
  'Please fill in answer B.',
];

/** Checks that survey, questions and answers were sent to the database as filled in. */
function expectCreatedSurvey(created: CreatedSurvey, endDate: string): void {
  const endOfDay = new Date(`${endDate}T23:59:59`).toISOString();
  expect(created.survey).toEqual({ ...EXPECTED_SURVEY, end_date: endOfDay });
  const questions = EXPECTED_QUESTIONS.map((question) => ({
    ...question,
    survey_id: NEW_SURVEY_ID,
  }));
  expect(created.questions).toEqual(questions);
  expect(created.answers.map((answer) => answer['label'])).toEqual(EXPECTED_ANSWERS);
}

test('New survey opens the form as an overlay without a new address', async ({ page }) => {
  const dialog = await openForm(page);
  await expect(dialog.getByRole('heading', { name: 'Create new survey' })).toBeVisible();
  await expect(page).toHaveURL('/');
});

test('Escape and Cancel close the form and give the focus back', async ({ page }) => {
  const dialog = await openForm(page);
  const newSurvey = page.getByRole('button', { name: 'New survey' });
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(newSurvey).toBeFocused();
  await newSurvey.click();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toBeHidden();
  await expect(newSurvey).toBeFocused();
});

test('required fields are marked and checked before anything is saved', async ({
  page,
  supabase,
}) => {
  const dialog = await openForm(page);
  await expect(dialog.getByText('Survey name *')).toBeVisible();
  await expect(dialog.getByText('(optional)')).toHaveCount(OPTIONAL_FIELDS);
  await dialog.getByRole('button', { name: 'Publish' }).click();
  for (const error of REQUIRED_ERRORS) await expect(dialog.getByText(error)).toBeVisible();
  expect(supabase.created.survey).toBeNull();
});

test('a survey name with only spaces counts as empty', async ({ page }) => {
  const dialog = await openForm(page);
  await dialog.getByRole('textbox', { name: 'Survey name' }).fill('   ');
  await dialog.getByLabel('Set end date').focus();
  await expect(dialog.getByText('Please enter a survey name.')).toBeVisible();
});

test('an end date in the past is refused', async ({ page }) => {
  const dialog = await openForm(page);
  await dialog.getByLabel('Set end date').fill(dateFromToday(-1));
  await dialog.getByRole('textbox', { name: 'Survey name' }).focus();
  await expect(dialog.getByText('The end date cannot be in the past.')).toBeVisible();
});

test('answers can be added up to six, then a hint appears', async ({ page }) => {
  const dialog = await openForm(page);
  const addAnswer = dialog.getByRole('button', { name: 'Add answer' });
  for (let count = MIN_ANSWERS; count < MAX_ANSWERS; count++) await addAnswer.click();
  const answers = dialog
    .getByRole('group', { name: 'Question 1' })
    .getByRole('textbox', { name: /^Answer/ });
  await expect(answers).toHaveCount(MAX_ANSWERS);
  await expect(addAnswer).toBeDisabled();
  await expect(dialog.getByText('You can add up to 6 answer fields.')).toBeVisible();
});

test('the trash clears answers A and B and removes answers from C on', async ({ page }) => {
  const dialog = await openForm(page);
  const question = dialog.getByRole('group', { name: 'Question 1' });
  await dialog.getByRole('button', { name: 'Add answer' }).click();
  await question.getByRole('textbox', { name: 'Answer A' }).fill('Pizza');
  await question.getByRole('button', { name: 'Clear answer A' }).click();
  await expect(question.getByRole('textbox', { name: 'Answer A' })).toHaveValue('');
  await question.getByRole('button', { name: 'Remove answer C' }).click();
  await expect(question.getByRole('textbox', { name: /^Answer/ })).toHaveCount(MIN_ANSWERS);
});

test('the trash clears the first question and removes further questions', async ({ page }) => {
  const dialog = await openForm(page);
  await dialog.getByRole('textbox', { name: '1. Question' }).fill('Which place?');
  await dialog.getByRole('button', { name: 'Add next question' }).click();
  await dialog.getByRole('button', { name: 'Clear question 1' }).click();
  await expect(dialog.getByRole('textbox', { name: '1. Question' })).toHaveValue('');
  await dialog.getByRole('button', { name: 'Remove question 2' }).click();
  await expect(dialog.getByRole('group', { name: /^Question/ })).toHaveCount(1);
});

test('publishing saves the survey and opens it after the confirmation', async ({
  page,
  supabase,
}) => {
  const endDate = dateFromToday(DAYS_UNTIL_END);
  await fillSurvey(await openForm(page), endDate);
  await page.getByRole('button', { name: 'Publish' }).click();
  const close = page.getByRole('button', { name: 'Close and open the new survey' });
  await expect(page.getByText('Your survey is now published')).toBeVisible();
  await expect(close).toBeFocused();
  expectCreatedSurvey(supabase.created, endDate);
  await close.click();
  await expect(page).toHaveURL(`/survey/${NEW_SURVEY_ID}`);
});

test('a message appears when the survey cannot be published', async ({ page, supabase }) => {
  supabase.failCreate = true;
  const dialog = await openForm(page);
  await fillSurvey(dialog, dateFromToday(DAYS_UNTIL_END));
  await dialog.getByRole('button', { name: 'Publish' }).click();
  await expect(dialog.getByRole('alert')).toHaveText(
    'The survey could not be published. Please try again.',
  );
});

test('the open form fits the screen with large text and no accessibility issues', async ({
  page,
}) => {
  await openForm(page);
  expect(await hasHorizontalScroll(page)).toBe(false);
  expect(await findSmallTexts(page, MIN_FONT_SIZE)).toEqual([]);
  expect(await findAccessibilityViolations(page)).toEqual([]);
});

test('Create survey in the header of a survey opens the same form', async ({ page, viewport }) => {
  test.skip((viewport?.width ?? 0) < SMALL_SCREEN, 'Small screens hide this button like in Figma.');
  await openSurvey(page, RUNNING_SURVEY);
  await page.getByRole('button', { name: 'Create survey' }).click();
  await expect(page.getByRole('dialog', { name: 'Create new survey' })).toBeVisible();
});
