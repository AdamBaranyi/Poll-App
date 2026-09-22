import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MAX_QUESTIONS } from '../../core/constants/poll.constants';
import { SurveyDialogService } from '../../core/services/survey-dialog.service';
import { SurveyService } from '../../core/services/survey.service';
import { QuestionEditorComponent } from './question-editor/question-editor.component';
import { SurveyFieldsComponent } from './survey-fields/survey-fields.component';
import { createQuestion, createSurveyForm, toSurveyDraft } from './survey-form';

@Component({
  imports: [ReactiveFormsModule, SurveyFieldsComponent, QuestionEditorComponent],
  selector: 'app-create-survey',
  styleUrl: './create-survey.component.scss',
  templateUrl: './create-survey.component.html',
})
export class CreateSurveyComponent {
  private readonly builder = inject(NonNullableFormBuilder);
  private readonly surveyService = inject(SurveyService);
  private readonly dialogState = inject(SurveyDialogService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly publishedClose = viewChild<ElementRef<HTMLButtonElement>>('publishedClose');
  protected readonly form = createSurveyForm(this.builder);
  protected readonly maxQuestions = MAX_QUESTIONS;
  protected readonly isSaving = signal(false);
  protected readonly saveFailed = signal(false);
  protected readonly publishedId = signal<string | null>(null);

  constructor() {
    effect(() => this.syncDialog(this.dialogState.isOpen()));
  }

  /** Adds an empty question at the end. */
  addQuestion(): void {
    this.form.controls.questions.push(createQuestion(this.builder));
  }

  /** Removes a question, the first one always stays. */
  removeQuestion(index: number): void {
    if (index > 0) this.form.controls.questions.removeAt(index);
  }

  /** Throws away the entries and closes the dialog. */
  cancel(): void {
    this.resetForm();
    this.dialogState.close();
  }

  /** Keeps the dialog service in step when the dialog closed itself, for example with Escape. */
  onDialogClose(): void {
    if (this.publishedId()) void this.openPublished();
    else this.dialogState.close();
  }

  /** Checks the form and saves the new survey. */
  async publish(): Promise<void> {
    if (this.form.invalid) return this.showErrors();
    this.isSaving.set(true);
    this.saveFailed.set(false);
    try {
      await this.save();
    } catch {
      this.saveFailed.set(true);
    } finally {
      this.isSaving.set(false);
    }
  }

  /** Closes the confirmation and opens the new survey. */
  async openPublished(): Promise<void> {
    const id = this.publishedId();
    this.publishedId.set(null);
    this.dialogState.close();
    if (id) await this.router.navigate(['/survey', id]);
  }

  /** Saves the survey, empties the form and shows the confirmation. */
  private async save(): Promise<void> {
    const id = await this.surveyService.createSurvey(toSurveyDraft(this.form));
    this.resetForm();
    this.publishedId.set(id);
    afterNextRender(() => this.publishedClose()?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  /** Shows the errors of all fields and puts the focus on the first wrong field. */
  private showErrors(): void {
    this.form.markAllAsTouched();
    const firstInvalid = this.dialog().nativeElement.querySelector<HTMLElement>(
      '.ng-invalid:not(form, fieldset, div)',
    );
    firstInvalid?.focus();
  }

  /** Empties the form and leaves one empty question. */
  private resetForm(): void {
    this.form.reset();
    this.form.controls.questions.clear();
    this.form.controls.questions.push(createQuestion(this.builder));
  }

  /** Opens or closes the native dialog to match the dialog service. */
  private syncDialog(isOpen: boolean): void {
    const dialog = this.dialog().nativeElement;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }
}
