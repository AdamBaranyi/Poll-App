import { ANSWER_LETTERS, FULL_PERCENT } from '../constants/poll.constants';
import { AnswerOption, Question } from '../models/question.model';
import { Vote } from '../models/vote.model';

export interface OptionResult {
  option: AnswerOption;
  letter: string;
  percent: number;
}

export interface QuestionResult {
  question: Question;
  votes: number;
  options: OptionResult[];
}

/** Returns the letter A to F of an answer position. */
export function letterOf(position: number): string {
  return ANSWER_LETTERS[position - 1] ?? '';
}

/** Rounds the shares to whole percentages that add up to exactly 100. */
export function toPercentages(counts: number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0);
  if (total === 0) return counts.map(() => 0);
  const exact = counts.map((count) => (count / total) * FULL_PERCENT);
  const rounded = exact.map((value) => Math.floor(value));
  const missing = FULL_PERCENT - rounded.reduce((sum, value) => sum + value, 0);
  const byRest = exact.map((value, index) => ({ index, rest: value - rounded[index] }));
  byRest.sort((first, second) => second.rest - first.rest);
  byRest.slice(0, missing).forEach(({ index }) => rounded[index]++);
  return rounded;
}

/** Counts the votes of every answer of one question and turns them into percentages. */
function resultOf(question: Question, votes: Vote[]): QuestionResult {
  const ofQuestion = votes.filter((vote) => vote.questionId === question.id);
  const counts = question.options.map(
    (option) => ofQuestion.filter((vote) => vote.optionId === option.id).length,
  );
  const percents = toPercentages(counts);
  const options = question.options.map((option, index) => ({
    option,
    letter: letterOf(option.position),
    percent: percents[index],
  }));
  return { question, votes: ofQuestion.length, options };
}

/** Returns the results of every question of a survey. */
export function buildResults(questions: Question[], votes: Vote[]): QuestionResult[] {
  return questions.map((question) => resultOf(question, votes));
}
