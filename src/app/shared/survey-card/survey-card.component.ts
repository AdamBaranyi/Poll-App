import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Survey } from '../../core/models/survey.model';
import { DeadlinePipe } from '../pipes/deadline.pipe';

@Component({
  imports: [RouterLink, DeadlinePipe],
  selector: 'app-survey-card',
  styleUrl: './survey-card.component.scss',
  templateUrl: './survey-card.component.html',
})
export class SurveyCardComponent {
  readonly survey = input.required<Survey>();
  readonly highlight = input(false);
}
