import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      [style]="buttonStyles"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() fullWidth = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() loading = false;

  onClick = output<Event>();

  get buttonClasses(): string {
    const base = 'inline-flex items-center justify-center font-medium transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    const radius = 'rounded-[var(--radius-md)]';
    const width = this.fullWidth ? 'w-full' : '';
    const disabledClass = (this.disabled || this.loading) ? 'opacity-50 cursor-not-allowed' : '';
    
    let variantClasses = '';
    if (this.variant === 'outline') {
      variantClasses = 'border-2 bg-white';
    } else if (this.variant === 'ghost') {
      variantClasses = 'bg-transparent';
    } else if (this.variant === 'danger') {
      variantClasses = 'bg-red-600 text-white';
    }
    
    return `${base} ${variantClasses} ${sizes[this.size]} ${radius} ${width} ${disabledClass}`;
  }

  get buttonStyles(): string {
    if (this.variant === 'primary' || this.variant === 'secondary') {
      return `background-color: var(--primary-bg); color: var(--primary-text);`;
    } else if (this.variant === 'outline') {
      return `border-color: var(--primary-bg); color: var(--primary-text);`;
    } else if (this.variant === 'ghost') {
      return `color: var(--primary-text);`;
    }
    return '';
  }
}
