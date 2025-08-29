import { Component, inject, signal } from '@angular/core';
import { ToastService } from '../../core/toast/toast.service';
import { provideAnimations } from '@angular/platform-browser/animations';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  imports: [],
  providers: [provideAnimations()],
  animations: [
    trigger('slideInOut', [
      state('void', style({ width: '0px' })),
      state('*', style({ width: '*' })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    // ...other animations...
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  user: any = localStorage.getItem('user_data');
  toastService = inject(ToastService);
  isCollapsed = signal(false); // Auto-collapsed by default

  notifications = { unread: 1 };

  menuItems = [
    { label: 'Dashboard', icon: 'i-home', link: '/dashboard' },
    { label: 'Projects', icon: 'i-briefcase', link: '/projects' },
    { label: 'Messages', icon: 'i-inbox', link: '/messages' },
    { label: 'Settings', icon: 'i-cog', link: '/settings' },
  ];
  constructor() {
    this.validateUser();
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  validateUser() {
    if (!this.user) {
      this.toastService.show({ message: 'Unauthorized access. Please login again.', type: 'error' });
      document.location.href = '/login';
    } else {
      this.user = JSON.parse(this.user);
    }
  }

  private checkScreenSize() {
    // Auto-collapse on small screens
    this.isCollapsed.set(window.innerWidth < 1024);
  }
}

