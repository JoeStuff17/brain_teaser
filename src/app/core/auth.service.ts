import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = Inject(Router);
  storageService = Inject(StorageService);

  constructor() {
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user_data');
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('user_data', 'your-role');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('user_data');
  }

  getUser(): string | null {
    return localStorage.getItem('user_data');
  }
}
