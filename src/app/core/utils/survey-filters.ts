import { DAY_IN_MS, ENDING_SOON_COUNT } from '../constants/poll.constants';
import { Category, Survey } from '../models/survey.model';

/** Checks whether the survey has already ended. */
export function isSurveyClosed(survey: Survey, now: Date): boolean {
  return survey.endDate !== null && survey.endDate <= now;
}

/** Returns the number of started days until the given date. */
export function daysUntil(date: Date, now: Date): number {
  return Math.ceil((date.getTime() - now.getTime()) / DAY_IN_MS);
}

/** Returns the running surveys that end first, the earliest end first. */
export function findEndingSoon(surveys: Survey[], now: Date): Survey[] {
  return surveys
    .filter((survey) => survey.endDate !== null && !isSurveyClosed(survey, now))
    .sort(byEndDate)
    .slice(0, ENDING_SOON_COUNT);
}

/** Returns the running or the ended surveys, optionally of one category only. */
export function filterSurveys(
  surveys: Survey[],
  showPast: boolean,
  category: Category | null,
  now: Date,
): Survey[] {
  const inTab = surveys.filter((survey) => isSurveyClosed(survey, now) === showPast);
  const inCategory = category ? inTab.filter((survey) => survey.category === category) : inTab;
  const sorted = inCategory.sort(byEndDate);
  return showPast ? sorted.reverse() : sorted;
}

/** Sorts by end date, surveys without an end date come last. */
function byEndDate(first: Survey, second: Survey): number {
  if (!first.endDate) return second.endDate ? 1 : 0;
  if (!second.endDate) return -1;
  return first.endDate.getTime() - second.endDate.getTime();
}
