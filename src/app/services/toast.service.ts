import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastType } from '../components/shared/toast/toast.component';

interface Toast {
  message: string;
  type: ToastType;
  show: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private defaultDuration = 3000;
  private toastState = new BehaviorSubject<Toast>({
    message: '',
    type: 'info',
    show: false,
  });

  toast$ = this.toastState.asObservable();

  show(
    message: string,
    type: ToastType = 'info',
    duration: number = this.defaultDuration
  ): void {
    this.toastState.next({ message, type, show: true });

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.toastState.next({ ...this.toastState.value, show: false });
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}
