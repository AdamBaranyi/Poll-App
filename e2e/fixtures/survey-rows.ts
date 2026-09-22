import type { Category, SurveyRow } from '../../src/app/core/models/survey.model';

const DAY_IN_MS = 86_400_000;
const HOUR_IN_MS = 3_600_000;
const CREATED_DAYS_AGO = -30;

interface TestSurvey {
  title: string;
  category: Category;
  endsInDays: number | null;
}

export const TEST_SURVEYS: TestSurvey[] = [
  { title: 'Plan the team event', category: 'Team Activities', endsInDays: 1 },
  { title: 'Fitness habits', category: 'Health & Wellness', endsInDays: 2 },
  { title: 'Favorite games', category: 'Gaming & Entertainment', endsInDays: 3 },
  { title: 'Learning formats', category: 'Education & Learning', endsInDays: 5 },
  { title: 'Coffee or tea', category: 'Lifestyle & Preferences', endsInDays: null },
  { title: 'Remote work', category: 'Technology & Innovation', endsInDays: -2 },
  { title: 'Summer outing', category: 'Team Activities', endsInDays: -10 },
];

/** Returns an ISO date that lies the given number of days (plus one hour) from now. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_IN_MS + HOUR_IN_MS).toISOString();
}

/** Turns the test surveys into rows the way Supabase returns them. */
export function buildSurveyRows(): SurveyRow[] {
  return TEST_SURVEYS.map((survey, index) => ({
    id: `survey-${index + 1}`,
    title: survey.title,
    description: null,
    category: survey.category,
    end_date: survey.endsInDays === null ? null : daysFromNow(survey.endsInDays),
    created_at: daysFromNow(CREATED_DAYS_AGO),
  }));
}
