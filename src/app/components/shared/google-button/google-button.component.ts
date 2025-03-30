import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-google-button',
  template: `
    <button class="google-btn" (click)="onClick()">
      <img src="assets/google-icon.svg" alt="Google icon" class="google-icon" />
      <span>Sign in with Google</span>
    </button>
  `,
  styles: [`
    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      background-color: white;
      color: #3c4043;
      font-family: 'Roboto', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin: 1rem 0;
    }
    .google-btn:hover {
      background-color: #f8f9fa;
    }
    .google-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
  `]
})
export class GoogleButtonComponent {
  @Output() googleSignIn = new EventEmitter<void>();

  onClick() {
    this.googleSignIn.emit();
  }
} 