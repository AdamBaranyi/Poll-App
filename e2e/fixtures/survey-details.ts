import type { QuestionRow } from '../../src/app/core/models/question.model';
import type { SurveyDetailRow } from '../../src/app/core/models/survey.model';
import type { VoteRow } from '../../src/app/core/models/vote.model';
import { buildSurveyRows } from './survey-rows';
import { OPTION_ID_KIND, QUESTION_ID_KIND, testId, VOTE_ID_KIND } from './test-ids';

const SURVEY_BLOCK = 100;
const QUESTION_BLOCK = 10;
const VOTE_BLOCK = 1000;

interface TestQuestion {
  text: string;
  allowMultiple: boolean;
  options: { label: string; votes: number }[];
}

/** Questions of the test surveys 1 (running), 5 (without votes) and 7 (ended). */
const TEST_QUESTIONS: Record<number, TestQuestion[]> = {
  1: [
    {
      text: 'Which day suits you best?',
      allowMultiple: false,
      options: [
        { label: 'Friday', votes: 1 },
        { label: 'Saturday', votes: 2 },
        { label: 'Sunday', votes: 1 },
      ],
    },
    {
      text: 'Which activities do you like?',
      allowMultiple: true,
      options: [
        { label: 'Bowling', votes: 2 },
        { label: 'Cooking class', votes: 1 },
        { label: 'Escape room', votes: 0 },
      ],
    },
  ],
  5: [
    {
      text: 'Coffee or tea?',
      allowMultiple: false,
      options: [
        { label: 'Coffee', votes: 0 },
        { label: 'Tea', votes: 0 },
      ],
    },
  ],
  7: [
    {
      text: 'Where should we go?',
      allowMultiple: false,
      options: [
        { label: 'Lake', votes: 3 },
        { label: 'Mountains', votes: 1 },
      ],
    },
  ],
};

/** Returns the id of an answer of a test survey. */
export function optionId(survey: number, question: number, option: number): string {
  return testId(OPTION_ID_KIND, survey * SURVEY_BLOCK + question * QUESTION_BLOCK + option);
}

/** Returns the id of a question of a test survey. */
export function questionId(survey: number, question: number): string {
  return testId(QUESTION_ID_KIND, survey * QUESTION_BLOCK + question);
}

/** Turns one test question into a row with its answers. */
function toQuestionRow(survey: number, question: TestQuestion, index: number): QuestionRow {
  const position = index + 1;
  return {
    id: questionId(survey, position),
    position,
    text: question.text,
    allow_multiple: question.allowMultiple,
    answer_options: question.options.map((option, optionIndex) => ({
      id: optionId(survey, position, optionIndex + 1),
      position: optionIndex + 1,
      label: option.label,
    })),
  };
}

/** Returns a test survey with its questions and answers, or null if it has none. */
export function buildSurveyDetailRow(survey: number): SurveyDetailRow | null {
  const row = buildSurveyRows()[survey - 1];
  const questions = TEST_QUESTIONS[survey];
  if (!row || !questions) return null;
  return {
    ...row,
    questions: questions.map((question, index) => toQuestionRow(survey, question, index)),
  };
}

/** Lists question and answer position of every single vote of a test survey. */
function listChoices(survey: number): { question: number; option: number }[] {
  return (TEST_QUESTIONS[survey] ?? []).flatMap((question, index) =>
    question.options.flatMap((option, optionIndex) =>
      Array.from({ length: option.votes }, () => ({
        question: index + 1,
        option: optionIndex + 1,
      })),
    ),
  );
}

/** Returns the votes of a test survey, as many per answer as the test data says. */
export function buildVoteRows(survey: number): VoteRow[] {
  return listChoices(survey).map((choice, count) => ({
    id: testId(VOTE_ID_KIND, survey * VOTE_BLOCK + count),
    question_id: questionId(survey, choice.question),
    option_id: optionId(survey, choice.question, choice.option),
  }));
}
