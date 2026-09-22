import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { daysUntil } from '../../core/utils/survey-filters';

@Pipe({ name: 'deadline' })
export class DeadlinePipe implements PipeTransform {
  /** Turns an end date into a short text like "Ends in 3 days". */
  transform(endDate: Date | null, now: Date = new Date()): string {
    if (!endDate) return 'No end date';
    if (endDate <= now) return `Ended on ${formatDate(endDate, 'dd.MM.yyyy', 'en-US')}`;
    const days = daysUntil(endDate, now);
    return days === 1 ? 'Ends in 1 day' : `Ends in ${days} days`;
  }
}
