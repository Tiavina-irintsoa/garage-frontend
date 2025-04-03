import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      [@fadeInOut]
      [class]="getToastClass()"
      role="alert"
      (click)="close()"
    >
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <i [class]="getIconClass()"></i>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">{{ message }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        z-index: 1000;
        right: 1rem;
        top: 1rem;
      }
    `,
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(-20px)' })
        ),
      ]),
    ]),
  ],
})
export class ToastComponent {
  @Input() message: string = '';
  @Input() type: ToastType = 'info';
  @Input() show: boolean = false;
  @Output() closed = new EventEmitter<void>();

  getToastClass(): string {
    const baseClasses = 'p-4 rounded-lg shadow-lg cursor-pointer max-w-xs';
    switch (this.type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  }

  getIconClass(): string {
    switch (this.type) {
      case 'success':
        return 'fas fa-check-circle text-green-600';
      case 'error':
        return 'fas fa-times-circle text-red-600';
      case 'warning':
        return 'fas fa-exclamation-circle text-yellow-600';
      default:
        return 'fas fa-info-circle text-blue-600';
    }
  }

  close(): void {
    this.closed.emit();
  }
}
