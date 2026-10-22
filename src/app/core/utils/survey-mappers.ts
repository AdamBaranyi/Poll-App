import { AnswerOption, Question, QuestionRow } from '../models/question.model';
import { NewQuestion, NewSurvey, QuestionDraft, SurveyDraft } from '../models/survey-draft.model';
import { Survey, SurveyDetail, SurveyDetailRow, SurveyRow } from '../models/survey.model';
import { Answers, Vote, VoteInsert, VoteRow } from '../models/vote.model';

/** Sorts questions or answers by their position. */
export function byPosition(first: { position: number }, second: { position: number }): number {
  return first.position - second.position;
}

/** Turns a database row into a survey with real dates. */
export function toSurvey(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    endDate: row.end_date ? new Date(row.end_date) : null,
    createdAt: new Date(row.created_at),
  };
}

/** Turns a database row into a question with its answers in order A to F. */
export function toQuestion(row: QuestionRow): Question {
  const options: AnswerOption[] = [...row.answer_options].sort(byPosition);
  return {
    id: row.id,
    position: row.position,
    text: row.text,
    allowMultiple: row.allow_multiple,
    options,
  };
}

/** Turns a database row into a survey with its questions in order. */
export function toSurveyDetail(row: SurveyDetailRow): SurveyDetail {
  return { ...toSurvey(row), questions: row.questions.map(toQuestion).sort(byPosition) };
}

/** Turns a database row into a vote. */
export function toVote(row: VoteRow): Vote {
  return { id: row.id, questionId: row.question_id, optionId: row.option_id };
}

/** Turns the chosen answers into one database row per answer, all with the same submission id. */
export function toVoteInserts(
  surveyId: string,
  submissionId: string,
  answers: Answers,
): VoteInsert[] {
  return Object.entries(answers).flatMap(([questionId, optionIds]) =>
    optionIds.map((optionId) => ({
      survey_id: surveyId,
      question_id: questionId,
      option_id: optionId,
      submission_id: submissionId,
    })),
  );
}

/** Turns a new survey from the form into the one piece that create_survey saves. */
export function toNewSurvey(draft: SurveyDraft): NewSurvey {
  return {
    title: draft.title,
    category: draft.category,
    end_date: draft.endDate?.toISOString() ?? null,
    description: draft.description,
    questions: draft.questions.map(toNewQuestion),
  };
}

/** Turns a new question from the form into the shape create_survey expects, A first. */
function toNewQuestion(question: QuestionDraft): NewQuestion {
  return { text: question.text, allow_multiple: question.allowMultiple, answers: question.answers };
}
