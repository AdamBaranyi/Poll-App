import { Page, Route } from '@playwright/test';

import { environment } from '../../src/environments/environment';
import { buildSurveyRows } from '../fixtures/survey-rows';

const SERVER_ERROR = 500;
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};

export interface SupabaseMock {
  failRequests: boolean;
  unexpectedRequests: string[];
}

/** Answers every request to Supabase with test data, so no test reaches the real database. */
export async function mockSupabase(page: Page): Promise<SupabaseMock> {
  const mock: SupabaseMock = { failRequests: false, unexpectedRequests: [] };
  await page.route(`${environment.supabaseUrl}/**`, (route) => answer(route, mock));
  return mock;
}

/** Answers known requests and records and blocks all others. */
async function answer(route: Route, mock: SupabaseMock): Promise<void> {
  const request = route.request();
  const path = new URL(request.url()).pathname;
  if (request.method() === 'OPTIONS') return route.fulfill({ headers: CORS_HEADERS });
  if (mock.failRequests) return route.fulfill({ status: SERVER_ERROR, headers: CORS_HEADERS });
  if (request.method() === 'GET' && path === '/rest/v1/surveys') {
    return route.fulfill({ headers: CORS_HEADERS, json: buildSurveyRows() });
  }
  mock.unexpectedRequests.push(`${request.method()} ${path}`);
  return route.abort();
}
