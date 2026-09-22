import { Component, inject, OnInit, signal } from '@angular/core';

import { Survey } from '../../core/models/survey.model';
import { SurveyService } from '../../core/services/survey.service';
import { EndingSoonComponent } from './ending-soon/ending-soon.component';
import { HeroComponent } from './hero/hero.component';
import { SurveyListComponent } from './survey-list/survey-list.component';

@Component({
  imports: [HeroComponent, EndingSoonComponent, SurveyListComponent],
  selector: 'app-home',
  styleUrl: './home.component.scss',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly surveyService = inject(SurveyService);
  protected readonly surveys = signal<Survey[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly loadFailed = signal(false);

  /** Loads the surveys as soon as the page opens. */
  async ngOnInit(): Promise<void> {
    try {
      this.surveys.set(await this.surveyService.loadSurveys());
    } catch {
      this.loadFailed.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
