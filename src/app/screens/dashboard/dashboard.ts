import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast/toast.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  imports: [],
  providers: [provideAnimations()],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  user: any = localStorage.getItem('user_data');
  toastService = inject(ToastService);
  isCollapsed = signal(false); // Auto-collapsed by default

  notifications = { unread: 1 };

  constructor() {
    // this.validateUser();
  }

  validateUser() {
    if (!this.user) {
      this.toastService.show({ message: 'Unauthorized access. Please login again.', type: 'error' });
      document.location.href = '/login';
    } else {
      this.user = JSON.parse(this.user);
    }
  }
}

