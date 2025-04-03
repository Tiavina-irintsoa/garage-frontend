import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="show"
      [@fadeInOut]
      class="fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg"
      [ngClass]="getToastClasses()"
    >
      <div class="flex items-center">
        <span class="mr-2">{{ message }}</span>
        <button
          (click)="onClose()"
          class="ml-auto text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    </div>
  `,
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
  @Input() type: 'success' | 'error' | 'info' = 'info';
  @Input() show: boolean = false;
  @Output() closed = new EventEmitter<void>();

  getToastClasses(): { [key: string]: boolean } {
    return {
      'bg-green-500 text-white': this.type === 'success',
      'bg-red-500 text-white': this.type === 'error',
      'bg-blue-500 text-white': this.type === 'info',
    };
  }

  onClose(): void {
    this.closed.emit();
  }
}
