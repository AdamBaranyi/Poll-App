import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { SurveyDetail } from '../../../core/models/survey.model';

@Component({
  imports: [DatePipe],
  selector: 'app-survey-info',
  styleUrl: './survey-info.component.scss',
  templateUrl: './survey-info.component.html',
})
export class SurveyInfoComponent {
  readonly survey = input.required<SurveyDetail>();
  readonly closed = input(false);
}
