import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NewSurveyButtonComponent } from '../new-survey-button/new-survey-button.component';

@Component({
  imports: [RouterLink, NewSurveyButtonComponent],
  selector: 'app-header',
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly light = input(false);
}
