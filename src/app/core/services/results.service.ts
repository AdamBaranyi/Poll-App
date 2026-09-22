import { inject, Injectable } from '@angular/core';

import { Vote, VoteRow } from '../models/vote.model';
import { toVote } from '../utils/survey-mappers';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly supabase = inject(SupabaseClientService).client;

  /** Reports every new vote of the survey until the returned function is called. */
  watchVotes(surveyId: string, onVote: (vote: Vote) => void): () => void {
    const channel = this.supabase
      .channel(`votes-${surveyId}`)
      .on<VoteRow>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'votes', filter: `survey_id=eq.${surveyId}` },
        (payload) => onVote(toVote(payload.new)),
      )
      .subscribe();
    return () => void this.supabase.removeChannel(channel);
  }
}
