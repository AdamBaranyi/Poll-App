import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { CATEGORIES } from '../../../core/constants/poll.constants';
import { todayAsInputValue } from '../../../core/utils/form-validators';
import { SurveyForm } from '../survey-form';

type FieldName = 'title' | 'category' | 'endDate' | 'description';

const ERROR_TEXTS: Record<FieldName, Record<string, string>> = {
  title: {
    required: 'Please enter a survey name.',
    minlength: 'The survey name needs at least 3 characters.',
  },
  category: { required: 'Please choose a category.' },
  endDate: { pastDate: 'The end date cannot be in the past.' },
  description: { maxlength: 'The text can have at most 500 characters.' },
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-survey-fields',
  styleUrl: './survey-fields.component.scss',
  templateUrl: './survey-fields.component.html',
})
export class SurveyFieldsComponent {
  readonly form = input.required<SurveyForm>();
  protected readonly categories = CATEGORIES;
  protected readonly today = todayAsInputValue();

  /** Returns the error text of a field once the user has left it, otherwise null. */
  errorOf(name: FieldName): string | null {
    const control = this.form().controls[name];
    if (!control.touched || control.valid) return null;
    const firstError = Object.keys(control.errors ?? {})[0];
    return ERROR_TEXTS[name][firstError] ?? null;
  }

  /** Empties one field. */
  clear(name: FieldName): void {
    this.form().controls[name].reset();
  }
}
