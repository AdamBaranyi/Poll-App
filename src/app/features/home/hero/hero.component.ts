import { Component } from '@angular/core';

import { NewSurveyButtonComponent } from '../../../shared/new-survey-button/new-survey-button.component';

@Component({
  imports: [NewSurveyButtonComponent],
  selector: 'app-hero',
  styleUrl: './hero.component.scss',
  templateUrl: './hero.component.html',
})
export class HeroComponent {}
