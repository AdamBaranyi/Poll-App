import { inject, Injectable } from '@angular/core';

import { UUID_PATTERN } from '../constants/poll.constants';
import { SurveyDraft } from '../models/survey-draft.model';
import { Survey, SurveyDetail, SurveyDetailRow, SurveyRow } from '../models/survey.model';
import { toNewSurvey, toSurvey, toSurveyDetail } from '../utils/survey-mappers';
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

  /**
   * Saves a new survey with its questions and answers in one step and returns its id. The
   * database function checks the rules again, and a failure leaves nothing half saved behind.
   */
  async createSurvey(draft: SurveyDraft): Promise<string> {
    const { data, error } = await this.supabase.rpc('create_survey', {
      survey: toNewSurvey(draft),
    });
    if (error) throw error;
    if (typeof data !== 'string') throw new Error('create_survey returned no survey id.');
    return data;
  }
}
