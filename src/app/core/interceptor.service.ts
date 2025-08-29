import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap, finalize } from 'rxjs/operators';
import { HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { StorageService } from './storage.service';
import { ToastService } from './toast/toast.service';
import { LoaderService } from './loader.service';

export const HttpInterceptorService: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const loaderService = inject(LoaderService);
  const storageService = inject(StorageService);
  const toastService = inject(ToastService);
  const router = inject(Router);
  const user = localStorage.getItem('user_data') || '';
  loaderService.show();
  if (document.location.pathname !== '/login' && !user) {
    localStorage.clear();
    toastService.show({ message: 'Unauthorized access. Please login again.', type: 'error' });
    document.location.href = '/login';
  }
  return next(req).pipe(
    tap({
      error: (err) => {
        console.error('HTTP Error Intercepted:', err);
        if (err.status === 401) {
          localStorage.clear();
          toastService.show({ message: 'Unauthorized access. Please login again.', type: 'error' });
          router.navigate(['/login']);
          storageService.eraseCookie('parentId');
        } else if (err.status === 404) {
          toastService.show({ message: err?.error?.message, type: 'error' });
        } else if (err.status === 500) {
          toastService.show({ message: 'Internal server error.', type: 'error' });
        } else if (err.status === 504) {
          toastService.show({ message: 'Server timeout.', type: 'error' });
        } else if (err.status === 400) {
          toastService.show({ message: err?.error?.description || 'Bad request.', type: 'error' });
        }
      }
    }),
    finalize(() => {
      loaderService.hide();
    })
  );
};
