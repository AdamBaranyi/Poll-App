import { inject, Injectable } from '@angular/core';

import { UUID_PATTERN } from '../constants/poll.constants';
import { QuestionDraft, SurveyDraft } from '../models/survey-draft.model';
import { Survey, SurveyDetail, SurveyDetailRow, SurveyRow } from '../models/survey.model';
import {
  byPosition,
  toAnswerInserts,
  toQuestionInsert,
  toSurvey,
  toSurveyDetail,
  toSurveyInsert,
} from '../utils/survey-mappers';
import { SupabaseClientService } from './supabase-client.service';

const SURVEY_COLUMNS = 'id, title, description, category, end_date, created_at';
const QUESTION_COLUMNS =
  'questions (id, position, text, allow_multiple, answer_options (id, position, label))';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private readonly supabase = inject(SupabaseClientService).client;

  /** Loads all surveys without their questions. */
  async loadSurveys(): Promise<Survey[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(SURVEY_COLUMNS)
      .overrideTypes<SurveyRow[], { merge: false }>();
    if (error) throw error;
    return data.map(toSurvey);
  }

  /** Loads one survey with its questions and answers, or null if there is no such survey. */
  async loadSurvey(id: string): Promise<SurveyDetail | null> {
    if (!UUID_PATTERN.test(id)) return null;
    const { data, error } = await this.supabase
      .from('surveys')
      .select(`${SURVEY_COLUMNS}, ${QUESTION_COLUMNS}`)
      .eq('id', id)
      .maybeSingle()
      .overrideTypes<SurveyDetailRow, { merge: false }>();
    if (error) throw error;
    return data ? toSurveyDetail(data) : null;
  }

  /** Saves a new survey with its questions and answers and returns its id. */
  async createSurvey(draft: SurveyDraft): Promise<string> {
    const surveyId = await this.insertSurvey(draft);
    const questionIds = await this.insertQuestions(surveyId, draft.questions);
    await this.insertAnswers(draft.questions, questionIds);
    return surveyId;
  }

  /** Saves the survey itself and returns its new id. */
  private async insertSurvey(draft: SurveyDraft): Promise<string> {
    const { data, error } = await this.supabase
      .from('surveys')
      .insert(toSurveyInsert(draft))
      .select('id')
      .single()
      .overrideTypes<{ id: string }, { merge: false }>();
    if (error) throw error;
    return data.id;
  }

  /** Saves the questions and returns their new ids in the order of the questions. */
  private async insertQuestions(surveyId: string, questions: QuestionDraft[]): Promise<string[]> {
    const rows = questions.map((question, index) =>
      toQuestionInsert(surveyId, question, index + 1),
    );
    const { data, error } = await this.supabase
      .from('questions')
      .insert(rows)
      .select('id, position')
      .overrideTypes<{ id: string; position: number }[], { merge: false }>();
    if (error) throw error;
    return [...data].sort(byPosition).map((row) => row.id);
  }

  /** Saves the answers of all questions. */
  private async insertAnswers(questions: QuestionDraft[], questionIds: string[]): Promise<void> {
    const rows = questions.flatMap((question, index) =>
      toAnswerInserts(questionIds[index], question.answers),
    );
    const { error } = await this.supabase.from('answer_options').insert(rows);
    if (error) throw error;
  }
}
