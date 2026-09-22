import { formatDate } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Returns today's date in the format of a date field, like 2026-09-22. */
export function todayAsInputValue(): string {
  return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
}

/** Fails for an empty text and for a text that only has spaces. */
export function requiredText(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

/** Fails when a chosen date lies before today. */
export function notInPast(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  return control.value < todayAsInputValue() ? { pastDate: true } : null;
}
