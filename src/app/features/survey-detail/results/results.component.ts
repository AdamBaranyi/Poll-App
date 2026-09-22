import { Component, computed, input, signal } from '@angular/core';

import { QuestionResult } from '../../../core/utils/results';

@Component({
  selector: 'app-results',
  styleUrl: './results.component.scss',
  templateUrl: './results.component.html',
})
export class ResultsComponent {
  readonly results = input.required<QuestionResult[]>();
  protected readonly isOpen = signal(true);
  protected readonly voteCount = computed(() =>
    this.results().reduce((sum, result) => sum + result.votes, 0),
  );
}
