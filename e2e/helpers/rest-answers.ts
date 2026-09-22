import { Request } from '@playwright/test';

import type { VoteRow } from '../../src/app/core/models/vote.model';
import { buildSurveyDetailRow, buildVoteRows } from '../fixtures/survey-details';
import { buildSurveyRows } from '../fixtures/survey-rows';
import {
  QUESTION_ID_KIND,
  surveyId,
  surveyNumberOf,
  testId,
  VOTE_ID_KIND,
} from '../fixtures/test-ids';

const NEW_VOTE_BLOCK = 9000;
const NEW_SURVEY_NUMBER = 900;

export const NEW_SURVEY_ID = surveyId(NEW_SURVEY_NUMBER);

export interface SavedVote {
  survey_id: string;
  question_id: string;
  option_id: string;
  submission_id: string;
}

/** Returns the survey list, or the one survey that the request asks for. */
export function answerSurveys(url: URL): object[] {
  const id = url.searchParams.get('id')?.replace('eq.', '');
  if (!id) return buildSurveyRows();
  const detail = buildSurveyDetailRow(surveyNumberOf(id));
  return detail ? [detail] : [];
}

/** Returns the votes of the survey that the request asks for. */
export function answerVotes(url: URL): VoteRow[] {
  const id = url.searchParams.get('survey_id')?.replace('eq.', '') ?? '';
  return buildVoteRows(surveyNumberOf(id));
}

/** Keeps the posted votes and returns them with new ids, like the database does. */
export function answerNewVotes(request: Request, saved: SavedVote[]): VoteRow[] {
  const posted = request.postDataJSON() as SavedVote[];
  saved.push(...posted);
  return posted.map((vote, index) => ({
    id: testId(VOTE_ID_KIND, NEW_VOTE_BLOCK + saved.length + index),
    question_id: vote.question_id,
    option_id: vote.option_id,
  }));
}

export interface CreatedSurvey {
  survey: Record<string, unknown> | null;
  questions: Record<string, unknown>[];
  answers: Record<string, unknown>[];
}

/** Keeps the posted survey and returns its new id. */
export function answerNewSurvey(request: Request, created: CreatedSurvey): { id: string } {
  created.survey = request.postDataJSON() as Record<string, unknown>;
  return { id: NEW_SURVEY_ID };
}

/** Keeps the posted questions and returns them with new ids. */
export function answerNewQuestions(request: Request, created: CreatedSurvey): object[] {
  created.questions = request.postDataJSON() as Record<string, unknown>[];
  return created.questions.map((question) => ({
    id: testId(QUESTION_ID_KIND, NEW_SURVEY_NUMBER + Number(question['position'])),
    position: question['position'],
  }));
}

/** Keeps the posted answers. */
export function answerNewAnswers(request: Request, created: CreatedSurvey): object[] {
  created.answers = request.postDataJSON() as Record<string, unknown>[];
  return [];
}
