import { Component, ElementRef, inject, input, viewChild } from '@angular/core';

import { SurveyDialogService } from '../../core/services/survey-dialog.service';

@Component({
  selector: 'app-new-survey-button',
  styleUrl: './new-survey-button.component.scss',
  templateUrl: './new-survey-button.component.html',
})
export class NewSurveyButtonComponent {
  readonly label = input('New survey');
  private readonly dialog = inject(SurveyDialogService);
  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  /**
   * Opens the form to create a new survey. Safari does not focus a button when it is clicked, so
   * the button takes the focus itself and gets it back when the form closes.
   */
  open(): void {
    this.button().nativeElement.focus();
    this.dialog.open();
  }
}
