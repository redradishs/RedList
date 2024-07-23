import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  getCurrentDate(): string {
    const now = new Date();
    return this.formatDate(now);
  }
}
