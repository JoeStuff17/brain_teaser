import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, Inject, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
})
export class Home {
  router = inject(Router);

  menuItems = [
    {
      label: 'Dashboard',
      icon: 'assets/svgs/dashboard_icon.svg',
      link: '/dashboard',
      isSelected: true,
      submenu: [],
    },
    {
      label: 'Quiz',
      icon: 'assets/svgs/exam_clock.svg',
      link: null,
      isSelected: false,
      submenu: [
        {
          label: 'Play',
          icon: 'assets/svgs/play_icon.svg',
          link: '/quiz/play',
          isSelected: false,
        },
        {
          label: 'Management',
          icon: 'assets/svgs/manage_icon.svg',
          link: '/quiz/management',
          isSelected: false,
        },
      ],
    },
  ];

  isLoginPage = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isLoginPage = this.document.location.pathname === '/login';
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = event.urlAfterRedirects || event.url;
        this.isLoginPage = url === '/login';
        this.updateSelection(url);
      });

    this.updateSelection(this.router.url);
  }

  updateSelection(currentUrl: string): void {
    for (const item of this.menuItems) {
      item.isSelected = false;
      for (const sub of item.submenu) {
        sub.isSelected = false;
      }
    }

    for (const item of this.menuItems) {
      if (item.link === currentUrl) {
        item.isSelected = true;
        return;
      }
      for (const sub of item.submenu) {
        if (sub.link === currentUrl) {
          item.isSelected = true;
          sub.isSelected = true;
          return;
        }
      }
    }
  }

  selectMenu(index: number, isSubmenu = false, subIndex: number | null = null): void {
    const item = isSubmenu ? this.menuItems[index].submenu[subIndex!] : this.menuItems[index];

    if (!item?.link) return;

    this.router.navigate([item.link]).then();
  }
}
