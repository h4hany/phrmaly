import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { FormWrapperComponent } from '../../../shared/components/form-wrapper/form-wrapper.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    AlertComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
              <span class="text-white text-2xl font-bold">P</span>
            </div>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Pharmly
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Pharmacy Management System
          </p>
        </div>

        @if (errorMessage()) {
          <app-alert type="error" [title]="errorMessage()!" />
        }

        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="identifier" class="block text-sm font-medium text-gray-700">
                Email, Username, or Phone
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:z-10 sm:text-sm"
                placeholder="Enter email, username, or phone"
                formControlName="identifier"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] focus:z-10 sm:text-sm"
                placeholder="Enter password"
                formControlName="password"
              />
            </div>
          </div>

          <div>
            <app-button
              type="submit"
              variant="primary"
              [fullWidth]="true"
              [loading]="loading()"
              [disabled]="loginForm.invalid"
            >
              Sign in
            </app-button>
          </div>

          <div class="text-center text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p class="mt-1">
              <span class="font-medium">Owner:</span> owner&#64;pharmly.com / password<br>
              <span class="font-medium">Manager:</span> manager&#64;pharmly.com / password<br>
              <span class="font-medium">Staff:</span> staff&#64;pharmly.com / password
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set(null);

      const { identifier, password } = this.loginForm.value;

      this.authService.login(identifier!, password!).subscribe({
        next: (user) => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Invalid credentials');
          this.loading.set(false);
        }
      });
    }
  }
}

