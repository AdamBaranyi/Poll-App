import { inject, Injectable } from '@angular/core';

import { Answers, Vote, VoteRow } from '../models/vote.model';
import { toVote, toVoteInserts } from '../utils/survey-mappers';
import { SupabaseClientService } from './supabase-client.service';

const VOTE_COLUMNS = 'id, question_id, option_id';

@Injectable({ providedIn: 'root' })
export class VoteService {
  private readonly supabase = inject(SupabaseClientService).client;

  /** Loads all votes of a survey. */
  async loadVotes(surveyId: string): Promise<Vote[]> {
    const { data, error } = await this.supabase
      .from('votes')
      .select(VOTE_COLUMNS)
      .eq('survey_id', surveyId)
      .overrideTypes<VoteRow[], { merge: false }>();
    if (error) throw error;
    return data.map(toVote);
  }

  /** Saves one vote per chosen answer, all with the same submission id. */
  async submitVotes(surveyId: string, answers: Answers): Promise<Vote[]> {
    const rows = toVoteInserts(surveyId, crypto.randomUUID(), answers);
    const { data, error } = await this.supabase
      .from('votes')
      .insert(rows)
      .select(VOTE_COLUMNS)
      .overrideTypes<VoteRow[], { merge: false }>();
    if (error) throw error;
    return data.map(toVote);
  }
}
