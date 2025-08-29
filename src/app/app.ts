import { Component, DOCUMENT, inject, Inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './core/api.service';
import { LoaderService } from './core/loader.service';
import { StorageService } from './core/storage.service';
import { Toast } from "./core/toast/toast";
import { ScreenLoader } from "./core/screen-loader/screen-loader";
import { Home } from "./screens/home/home";

@Component({
  selector: 'app-root',
  imports: [Toast, ScreenLoader, Home],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('brain_teaser');
  isLoginPage = signal(false);
  apiService = inject(ApiService);
  loaderService = inject(LoaderService);
  storageService = inject(StorageService);

  constructor(private router: Router,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    this.isLoginPage.set(this.document.location.pathname === '/login');
  }
}
