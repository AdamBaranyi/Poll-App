export const CATEGORIES = [
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preferences',
  'Technology & Innovation',
] as const;

export const ENDING_SOON_COUNT = 3;
export const DAY_IN_MS = 86_400_000;
export const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const FULL_PERCENT = 100;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MIN_ANSWERS = 2;
export const MAX_ANSWERS = ANSWER_LETTERS.length;
export const MAX_QUESTIONS = 20;
export const MIN_TEXT_LENGTH = 3;
export const MAX_TITLE_LENGTH = 120;
export const MAX_QUESTION_LENGTH = 200;
export const MAX_ANSWER_LENGTH = 120;
export const MAX_DESCRIPTION_LENGTH = 500;
