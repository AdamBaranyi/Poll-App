const ID_DIGITS = 12;

export const SURVEY_ID_KIND = '8';
export const QUESTION_ID_KIND = '9';
export const OPTION_ID_KIND = 'a';
export const VOTE_ID_KIND = 'b';

/** Returns the uuid a test object gets from its kind and number. */
export function testId(kind: string, number: number): string {
  return `00000000-0000-4000-${kind}000-${String(number).padStart(ID_DIGITS, '0')}`;
}

/** Returns the uuid of the test survey with the given number. */
export function surveyId(number: number): string {
  return testId(SURVEY_ID_KIND, number);
}

/** Returns the number of a test survey from its uuid. */
export function surveyNumberOf(id: string): number {
  return Number(id.slice(-ID_DIGITS));
}
