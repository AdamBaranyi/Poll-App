import { Injectable } from '@angular/core';

const STORAGE_PREFIX = 'poll-app-answered-';

@Injectable({ providedIn: 'root' })
export class ParticipationService {
  /** Checks whether this browser has already answered the survey. */
  hasAnswered(surveyId: string): boolean {
    try {
      return localStorage.getItem(STORAGE_PREFIX + surveyId) !== null;
    } catch {
      return false;
    }
  }

  /** Remembers in this browser that the survey has been answered. */
  rememberAnswer(surveyId: string): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + surveyId, new Date().toISOString());
    } catch {
      // Without storage the survey simply stays open in this browser.
    }
  }
}
