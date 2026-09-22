import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SurveyDialogService {
  readonly isOpen = signal(false);

  /** Opens the form to create a new survey. */
  open(): void {
    this.isOpen.set(true);
  }

  /** Closes the form to create a new survey. */
  close(): void {
    this.isOpen.set(false);
  }
}
