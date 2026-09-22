import { Component, ElementRef, inject, model, signal, viewChild } from '@angular/core';

import { CATEGORIES } from '../../core/constants/poll.constants';
import { Category } from '../../core/models/survey.model';

@Component({
  host: {
    '(document:click)': 'closeOnOutsideClick($event)',
    '(keydown.escape)': 'closeWithEscape()',
  },
  selector: 'app-category-dropdown',
  styleUrl: './category-dropdown.component.scss',
  templateUrl: './category-dropdown.component.html',
})
export class CategoryDropdownComponent {
  readonly selected = model<Category | null>(null);
  protected readonly categories = CATEGORIES;
  protected readonly isOpen = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggleButton');

  /** Opens or closes the list of categories. */
  toggle(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  /** Shows only the surveys of one category, or all surveys for null. */
  choose(category: Category | null): void {
    this.selected.set(category);
    this.isOpen.set(false);
  }

  /** Closes the list when the user clicks somewhere else on the page. */
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.isOpen.set(false);
  }

  /** Closes the list and puts the focus back on the button. */
  closeWithEscape(): void {
    this.isOpen.set(false);
    this.toggleButton().nativeElement.focus();
  }
}
