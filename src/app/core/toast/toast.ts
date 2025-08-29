import {Component} from '@angular/core';
import {ToastService} from './toast.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  toast: any = null;
  visible = false;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe(toast => {
      if (toast) {
        this.toast = toast;
        this.visible = true;

        // Hide after duration
        setTimeout(() => {
          this.visible = false;
        }, toast.duration || 3000);

        // Remove from DOM after fade-out
        setTimeout(() => {
          this.toast = null;
        }, (toast.duration || 3000) + 500); // 500ms = fade-out duration
      }
    });
  }

  getBorderColor(type: string) {
    return {
      success: 'border-green-500',
      error: 'border-red-500',
      warning: 'border-yellow-500',
      info: 'border-blue-500'
    }[type] || 'border-gray-300';
  }


  getBgColor(type = 'info') {
    return {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
      warning: 'bg-orange-500/90 backdrop-blur-sm shadow-lg'
    }[type] || 'bg-gray-800';
  }
}
