import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(toast: Toast) {
    this.toastSubject.next(toast);
    setTimeout(() => {
      this.toastSubject.next(null);
    }, toast.duration || 3000);
  }
}
