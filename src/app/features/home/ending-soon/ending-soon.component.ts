import { Component, computed, input } from '@angular/core';

import { Survey } from '../../../core/models/survey.model';
import { findEndingSoon } from '../../../core/utils/survey-filters';
import { SurveyCardComponent } from '../../../shared/survey-card/survey-card.component';

@Component({
  imports: [SurveyCardComponent],
  selector: 'app-ending-soon',
  styleUrl: './ending-soon.component.scss',
  templateUrl: './ending-soon.component.html',
})
export class EndingSoonComponent {
  readonly surveys = input.required<Survey[]>();
  protected readonly endingSoon = computed(() => findEndingSoon(this.surveys(), new Date()));
}
