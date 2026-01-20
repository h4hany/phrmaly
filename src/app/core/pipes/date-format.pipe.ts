import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  transform(value: Date | string | number | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate();
    const month = this.monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day}, ${month}, ${year}`;
  }
}

