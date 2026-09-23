import { Page } from '@playwright/test';

import { openSurvey, RUNNING_SURVEY } from './helpers/detail-page';
import { expect, test } from './helpers/test';

const NARROWEST = 900;
const WIDEST = 1440;
const STEP = 90;
const MIN_RESULTS_WIDTH = 300;
const SIDE_BY_SIDE_SHARE = 0.7;
const SURVEY_MIDDLE = 0.5;

/** Returns the width of the results and whether they stand next to the survey. */
async function measureResults(page: Page): Promise<{ width: number; besideSurvey: boolean }> {
  const box = await page.getByRole('region', { name: 'Survey results' }).boundingBox();
  const survey = await page.getByRole('article').first().boundingBox();
  const surveyMiddle = (survey?.y ?? 0) + (survey?.height ?? 0) * SURVEY_MIDDLE;
  return { width: Math.round(box?.width ?? 0), besideSurvey: (box?.y ?? 0) < surveyMiddle };
}

test('the results are either wide enough or stand below the survey', async ({ page }) => {
  await openSurvey(page, RUNNING_SURVEY);
  const tooNarrow: string[] = [];
  for (let width = NARROWEST; width <= WIDEST; width += STEP) {
    await page.setViewportSize({ width, height: WIDEST });
    const results = await measureResults(page);
    const enough = results.width >= MIN_RESULTS_WIDTH || results.width > width * SIDE_BY_SIDE_SHARE;
    if (results.besideSurvey && !enough) {
      tooNarrow.push(`${width}px: results only ${results.width}px`);
    }
  }
  expect(tooNarrow).toEqual([]);
});
