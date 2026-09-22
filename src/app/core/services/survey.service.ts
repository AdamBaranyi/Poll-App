import { inject, Injectable } from '@angular/core';

import { Survey, SurveyRow } from '../models/survey.model';
import { SupabaseClientService } from './supabase-client.service';

const SURVEY_COLUMNS = 'id, title, description, category, end_date, created_at';

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
    return data.map((row) => this.toSurvey(row));
  }

  /** Turns a database row into a survey with real dates. */
  private toSurvey(row: SurveyRow): Survey {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      endDate: row.end_date ? new Date(row.end_date) : null,
      createdAt: new Date(row.created_at),
    };
  }
}
