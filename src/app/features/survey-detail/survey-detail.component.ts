import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyDetail } from '../../core/models/survey.model';
import { Answers, Vote } from '../../core/models/vote.model';
import { ParticipationService } from '../../core/services/participation.service';
import { ResultsService } from '../../core/services/results.service';
import { SurveyService } from '../../core/services/survey.service';
import { VoteService } from '../../core/services/vote.service';
import { buildResults } from '../../core/utils/results';
import { isSurveyClosed } from '../../core/utils/survey-filters';
import { HeaderComponent } from '../../shared/header/header.component';
import { QuestionListComponent } from './question-list/question-list.component';
import { ResultsComponent } from './results/results.component';
import { SurveyInfoComponent } from './survey-info/survey-info.component';

type LoadStatus = 'loading' | 'ready' | 'missing' | 'failed';

@Component({
  imports: [
    RouterLink,
    HeaderComponent,
    SurveyInfoComponent,
    QuestionListComponent,
    ResultsComponent,
  ],
  selector: 'app-survey-detail',
  styleUrl: './survey-detail.component.scss',
  templateUrl: './survey-detail.component.html',
})
export class SurveyDetailComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly surveyService = inject(SurveyService);
  private readonly voteService = inject(VoteService);
  private readonly resultsService = inject(ResultsService);
  private readonly participation = inject(ParticipationService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly survey = signal<SurveyDetail | null>(null);
  protected readonly votes = signal<Vote[]>([]);
  protected readonly status = signal<LoadStatus>('loading');
  protected readonly hasAnswered = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly isClosed = computed(() => {
    const survey = this.survey();
    return survey !== null && isSurveyClosed(survey, new Date());
  });
  protected readonly results = computed(() =>
    buildResults(this.survey()?.questions ?? [], this.votes()),
  );

  /** Loads the survey when the page opens. */
  async ngOnInit(): Promise<void> {
    try {
      await this.load(this.id());
    } catch {
      this.status.set('failed');
    }
  }

  /** Saves the answers and shows the survey read-only afterwards. */
  async complete(answers: Answers): Promise<void> {
    const survey = this.survey();
    if (!survey) return;
    this.isSaving.set(true);
    try {
      await this.save(survey.id, answers);
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.isSaving.set(false);
    }
  }

  /** Loads survey and votes and starts to watch new votes, or marks the survey as missing. */
  private async load(id: string): Promise<void> {
    const survey = await this.surveyService.loadSurvey(id);
    if (!survey) return this.status.set('missing');
    this.survey.set(survey);
    this.hasAnswered.set(this.participation.hasAnswered(survey.id));
    this.votes.set(await this.voteService.loadVotes(survey.id));
    const stopWatching = this.resultsService.watchVotes(survey.id, (vote) => this.addVotes([vote]));
    this.destroyRef.onDestroy(stopWatching);
    this.status.set('ready');
  }

  /** Stores the votes and remembers that this browser has answered the survey. */
  private async save(surveyId: string, answers: Answers): Promise<void> {
    this.saveFailed.set(false);
    this.addVotes(await this.voteService.submitVotes(surveyId, answers));
    this.participation.rememberAnswer(surveyId);
    this.hasAnswered.set(true);
  }

  /** Adds votes that are not known yet, so no vote is counted twice. */
  private addVotes(newVotes: Vote[]): void {
    this.votes.update((votes) => {
      const known = new Set(votes.map((vote) => vote.id));
      return [...votes, ...newVotes.filter((vote) => !known.has(vote.id))];
    });
  }
}
