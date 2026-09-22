import { Component, inject, input } from '@angular/core';

import { SurveyDialogService } from '../../core/services/survey-dialog.service';

@Component({
  selector: 'app-new-survey-button',
  styleUrl: './new-survey-button.component.scss',
  templateUrl: './new-survey-button.component.html',
})
export class NewSurveyButtonComponent {
  readonly label = input('New survey');
  private readonly dialog = inject(SurveyDialogService);

  /** Opens the form to create a new survey. */
  open(): void {
    this.dialog.open();
  }
}
