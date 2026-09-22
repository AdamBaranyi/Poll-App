import { Component, computed, input, signal } from '@angular/core';

import { Category, Survey } from '../../../core/models/survey.model';
import { filterSurveys } from '../../../core/utils/survey-filters';
import { CategoryDropdownComponent } from '../../../shared/category-dropdown/category-dropdown.component';
import { SurveyCardComponent } from '../../../shared/survey-card/survey-card.component';

@Component({
  imports: [CategoryDropdownComponent, SurveyCardComponent],
  selector: 'app-survey-list',
  styleUrl: './survey-list.component.scss',
  templateUrl: './survey-list.component.html',
})
export class SurveyListComponent {
  readonly surveys = input.required<Survey[]>();
  protected readonly showPast = signal(false);
  protected readonly category = signal<Category | null>(null);
  protected readonly visibleSurveys = computed(() =>
    filterSurveys(this.surveys(), this.showPast(), this.category(), new Date()),
  );
}
