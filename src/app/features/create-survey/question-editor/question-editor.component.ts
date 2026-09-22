import { Component, inject, input, output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';

import { MAX_ANSWERS, MIN_ANSWERS } from '../../../core/constants/poll.constants';
import { letterOf } from '../../../core/utils/results';
import { AnswerControl, createAnswer, QuestionForm } from '../survey-form';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-question-editor',
  styleUrl: './question-editor.component.scss',
  templateUrl: './question-editor.component.html',
})
export class QuestionEditorComponent {
  readonly question = input.required<QuestionForm>();
  readonly number = input.required<number>();
  readonly removed = output<void>();
  private readonly builder = inject(NonNullableFormBuilder);
  protected readonly maxAnswers = MAX_ANSWERS;
  protected readonly minAnswers = MIN_ANSWERS;
  protected readonly letterOf = letterOf;

  /** Returns the answer fields of the question. */
  get answers(): FormArray<AnswerControl> {
    return this.question().controls.answers;
  }

  /** Clears the first question and removes every other question. */
  deleteQuestion(): void {
    if (this.number() > 1) return this.removed.emit();
    this.question().reset();
    while (this.answers.length > MIN_ANSWERS) this.answers.removeAt(this.answers.length - 1);
  }

  /** Clears answer A or B and removes the answers from C on. */
  deleteAnswer(index: number): void {
    if (index < MIN_ANSWERS) return this.answers.at(index).reset();
    this.answers.removeAt(index);
  }

  /** Adds an empty answer field, up to six. */
  addAnswer(): void {
    if (this.answers.length < MAX_ANSWERS) this.answers.push(createAnswer(this.builder));
  }

  /** Checks whether a field should show its error, that is after the user has left it. */
  showError(control: AbstractControl): boolean {
    return control.invalid && control.touched;
  }
}
