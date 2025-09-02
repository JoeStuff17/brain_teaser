import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  mode: 'signup' | 'signin' = 'signin';
  authForm: FormGroup;
  apiService = inject(ApiService);
  toastService = inject(ToastService);
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.updateFormValidity();
  }

  setMode(mode: 'signup' | 'signin') {
    this.mode = mode;
    this.updateFormValidity();
  }

  toggleMode() {
    this.mode = this.mode === 'signup' ? 'signin' : 'signup';
    this.updateFormValidity();
  }

  updateFormValidity() {
    const required = this.mode === 'signup';
    const firstName = this.authForm.get('firstName')!;
    const lastName = this.authForm.get('lastName')!;

    if (required) {
      firstName.setValidators(Validators.required);
      lastName.setValidators(Validators.required);
    } else {
      firstName.clearValidators();
      lastName.clearValidators();
    }

    firstName.updateValueAndValidity();
    lastName.updateValueAndValidity();
  }

  getMobileError(): string {
    const mobile = this.authForm.get('mobile');
    if (mobile?.hasError('required')) return 'Mobile number is required.';
    if (mobile?.hasError('pattern')) return 'Enter a valid 10-digit Indian mobile number (e.g., 9876543210).';
    return '';
  }

  onSubmit() {
    this.authForm.markAllAsTouched();
    if (this.authForm.invalid) return;
    const { firstName, lastName, mobile, password } = this.authForm.value;
    const userData = {
      ...(this.mode === 'signup' && { firstName, lastName }),
      mobile: mobile,
      password
    };
    if (this.mode === 'signin') {
      this.apiService.loginAdmin(userData).subscribe((res: any[]) => {
      const user = res.find(
        (u: any) => u.mobile == mobile && u.password == password
      );
      if (user) {
        this.toastService.show({ message: 'Login successful!', type: 'success' });
        localStorage.setItem('user_data', JSON.stringify(user));
        this.router.navigate(['/dashboard']).then();
      } else {
        this.authForm.get('password')?.reset();
        this.toastService.show({ message: 'Invalid mobile number or password.', type: 'error' });
      }
    });

    } else if (this.mode === 'signup') {
      this.apiService.createAdmin(userData).subscribe((res: any) => {
        if (res.success) {
          this.toastService.show({ message: res.message, type: 'success' });
          return;
        } else {
          this.toastService.show({ message: res.message, type: 'error' });
          return;
        }
      });
    }
  }
}
