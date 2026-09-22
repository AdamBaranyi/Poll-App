import { Component } from '@angular/core';

import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  imports: [HeaderComponent],
  selector: 'app-survey-detail',
  styleUrl: './survey-detail.component.scss',
  templateUrl: './survey-detail.component.html',
})
export class SurveyDetailComponent {}
