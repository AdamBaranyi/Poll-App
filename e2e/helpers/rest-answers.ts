import { Request } from '@playwright/test';

import type { VoteRow } from '../../src/app/core/models/vote.model';
import { buildSurveyDetailRow, buildVoteRows } from '../fixtures/survey-details';
import { buildSurveyRows } from '../fixtures/survey-rows';
import { surveyNumberOf, testId, VOTE_ID_KIND } from '../fixtures/test-ids';

const NEW_VOTE_BLOCK = 9000;

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
