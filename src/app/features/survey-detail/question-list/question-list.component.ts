import { Component, computed, input, output, signal } from '@angular/core';

import { Question } from '../../../core/models/question.model';
import { Answers } from '../../../core/models/vote.model';
import { letterOf } from '../../../core/utils/results';

/** Returns the new choice of a question after one answer was ticked or unticked. */
function nextChoice(
  question: Question,
  current: string[],
  optionId: string,
  checked: boolean,
): string[] {
  if (!question.allowMultiple) return checked ? [optionId] : [];
  return checked ? [...current, optionId] : current.filter((id) => id !== optionId);
}

@Component({
  selector: 'app-question-list',
  styleUrl: './question-list.component.scss',
  templateUrl: './question-list.component.html',
})
export class QuestionListComponent {
  readonly questions = input.required<Question[]>();
  readonly readOnly = input(false);
  readonly isSaving = input(false);
  readonly completed = output<Answers>();
  protected readonly letterOf = letterOf;
  protected readonly selected = signal<Answers>({});
  protected readonly isComplete = computed(() =>
    this.questions().every((question) => (this.selected()[question.id] ?? []).length > 0),
  );

  /** Checks whether an answer is chosen. */
  isChosen(questionId: string, optionId: string): boolean {
    return (this.selected()[questionId] ?? []).includes(optionId);
  }

  /** Takes over a ticked or unticked answer. */
  choose(question: Question, optionId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected.update((answers) => ({
      ...answers,
      [question.id]: nextChoice(question, answers[question.id] ?? [], optionId, checked),
    }));
  }

  /** Sends the answers once every question is answered. */
  submit(event: SubmitEvent): void {
    event.preventDefault();
    if (this.isComplete() && !this.readOnly()) this.completed.emit(this.selected());
  }
}
