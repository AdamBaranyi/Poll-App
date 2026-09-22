import { Page, Route } from '@playwright/test';

import type { VoteRow } from '../../src/app/core/models/vote.model';
import { environment } from '../../src/environments/environment';
import { mockRealtime } from './realtime-mock';
import { answerNewVotes, answerSurveys, answerVotes, SavedVote } from './rest-answers';

const SERVER_ERROR = 500;
const CREATED = 201;
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};

export interface SupabaseMock {
  failRequests: boolean;
  failVotes: boolean;
  savedVotes: SavedVote[];
  unexpectedRequests: string[];
  pushVote: (vote: VoteRow) => void;
}

/** Answers every request to Supabase with test data, so no test reaches the real database. */
export async function mockSupabase(page: Page): Promise<SupabaseMock> {
  const mock: SupabaseMock = {
    failRequests: false,
    failVotes: false,
    savedVotes: [],
    unexpectedRequests: [],
    pushVote: await mockRealtime(page),
  };
  await page.route(`${environment.supabaseUrl}/**`, (route) => answer(route, mock));
  return mock;
}

/** Answers the known table requests and blocks all others. */
async function answer(route: Route, mock: SupabaseMock): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());
  const call = `${request.method()} ${url.pathname}`;
  if (request.method() === 'OPTIONS') return route.fulfill({ headers: CORS_HEADERS });
  if (mock.failRequests) return route.fulfill({ status: SERVER_ERROR, headers: CORS_HEADERS });
  if (call === 'GET /rest/v1/surveys') return fulfill(route, answerSurveys(url));
  if (call === 'GET /rest/v1/votes') return fulfill(route, answerVotes(url));
  if (call === 'POST /rest/v1/votes') return answerPost(route, mock);
  return block(route, mock);
}

/** Saves posted votes, or fails when the test asks for it. */
async function answerPost(route: Route, mock: SupabaseMock): Promise<void> {
  if (mock.failVotes) return route.fulfill({ status: SERVER_ERROR, headers: CORS_HEADERS });
  const json = answerNewVotes(route.request(), mock.savedVotes);
  return route.fulfill({ status: CREATED, headers: CORS_HEADERS, json });
}

/** Sends test data back to the page. */
async function fulfill(route: Route, json: object[]): Promise<void> {
  return route.fulfill({ headers: CORS_HEADERS, json });
}

/** Records a request without test data and blocks it. */
async function block(route: Route, mock: SupabaseMock): Promise<void> {
  const url = new URL(route.request().url());
  mock.unexpectedRequests.push(`${route.request().method()} ${url.pathname}`);
  return route.abort();
}
