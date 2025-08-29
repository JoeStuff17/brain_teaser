import { CommonModule } from '@angular/common';
import { Component, DOCUMENT, Inject, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  router = inject(Router);
  menuItems: any = [
    { label: 'Dashboard', icon: 'assets/svgs/dashboard_icon.svg', link: '/dashboard', isSelected: true },
    {
      label: 'Quiz', icon: 'assets/svgs/exam_clock.svg', isSelected: false, submenu: [
        { label: 'Play', icon: 'assets/svgs/play_icon.svg', link: '/quiz/play', isSelected: false },
        { label: 'Management', icon: 'assets/svgs/manage_icon.svg', link: '/quiz/management', isSelected: false }
      ]
    },
  ];
  selectedMenu = signal('');
  isLoginPage = false;
  constructor(
     @Inject(DOCUMENT) public readonly document: Document,
  ) { 
    this.isLoginPage = this.document.location.pathname === '/login';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart || event instanceof NavigationEnd) {
        this.isLoginPage = event.url === '/login';
      }
    });
  }

  selectMenu(index: number) {
    this.selectedMenu = this.menuItems[index];
    this.menuItems.forEach((m: any, i: number) => {
      if (i === index) {
        m.isSelected = true;
      } else {
        m.isSelected = false;
      }
    })
    console.log(this.selectedMenu);
    this.router.navigate([this.menuItems[index].link]).then();
  }
}

