import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertComponent,
    RouterLink
  ],
  template: `
    <div class="login-container">
      <div class="container">
        <div class="left-panel">
          <div class="pill pill-1"></div>
          <div class="pill pill-2"></div>
          <div class="pill pill-3"></div>
          
          <div class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 9h-4v4h-4v-4H6v-4h4V8h4v4h4v4z"/>
              </svg>
            </div>
            <span class="logo-text">Pharmly</span>
          </div>

          <div class="welcome-text">
            <h1>Welcome to Your Pharmacy Management System</h1>
            <p>Streamline operations, enhance patient care, and manage your pharmacy with cutting-edge technology.</p>
            <p>Access your dashboard to monitor inventory, prescriptions, and analytics in real-time.</p>
          </div>

          <div class="features">
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Real-time inventory tracking</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Prescription management</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Patient records & analytics</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon"></div>
              <span>Secure & compliant platform</span>
            </div>
          </div>
        </div>

        <div class="right-panel">
          <div class="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          @if (errorMessage()) {
            <div class="error-alert">
              <app-alert type="error" [title]="errorMessage()!" />
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="identifier">Username / Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input 
                  type="text" 
                  id="identifier" 
                  formControlName="identifier"
                  placeholder="Enter your username or email" 
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  id="password" 
                  formControlName="password"
                  placeholder="Enter your password" 
                  required
                >
                <button 
                  type="button" 
                  class="password-toggle" 
                  (click)="togglePassword()"
                  tabindex="-1"
                >
                  <svg *ngIf="!showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg *ngIf="showPassword()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" formControlName="rememberMe">
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-password" (click)="$event.preventDefault()">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              class="login-btn"
              [disabled]="loginForm.invalid || loading()"
            >
              @if (loading()) {
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
              }
            </button>
          </form>

          <div class="divider">
            <span>Admin Access?</span>
          </div>

          <div class="signup-link">
            <a [routerLink]="['/admin-login']">System Console Login</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .login-container {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #001a1b 0%, #003032 50%, #004d4f 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
    }

    .login-container::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%);
      border-radius: 50%;
      animation: float 10s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      50% {
        transform: translate(-30px, 30px) scale(1.1);
      }
    }

    .container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 1000px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .left-panel {
      background: #003032;
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      position: relative;
      overflow: hidden;
    }

    .left-panel::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 300px;
      height: 300px;
      background: url('data:image/svg+xml,<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="pill-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="3" fill="rgba(0,212,170,0.15)"/><rect x="25" y="10" width="20" height="10" rx="5" fill="rgba(0,212,170,0.1)"/><path d="M 5 35 Q 15 30, 25 35" stroke="rgba(0,212,170,0.1)" fill="none" stroke-width="2"/></pattern></defs><rect width="300" height="300" fill="url(%23pill-pattern)"/></svg>') repeat;
      opacity: 0.3;
      animation: patternMove 20s linear infinite;
    }

    @keyframes patternMove {
      from {
        transform: translate(0, 0);
      }
      to {
        transform: translate(60px, 60px);
      }
    }

    .pill {
      position: absolute;
      border-radius: 20px;
      opacity: 0.1;
    }

    .pill-1 {
      width: 100px;
      height: 40px;
      background: #00d4aa;
      top: 20%;
      left: 10%;
      transform: rotate(-25deg);
      animation: float 6s ease-in-out infinite;
    }

    .pill-2 {
      width: 80px;
      height: 35px;
      background: #00d4aa;
      bottom: 25%;
      right: 15%;
      transform: rotate(15deg);
      animation: float 8s ease-in-out infinite reverse;
    }

    .pill-3 {
      width: 60px;
      height: 25px;
      background: #00d4aa;
      top: 60%;
      left: 20%;
      transform: rotate(-45deg);
      animation: float 7s ease-in-out infinite;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 40px;
      animation: fadeInLeft 0.8s ease-out 0.2s both;
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .logo-icon {
      width: 60px;
      height: 60px;
      background: #00d4aa;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(0, 212, 170, 0.3);
    }

    .logo-icon svg {
      width: 35px;
      height: 35px;
      fill: #ffffff;
    }

    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
    }

    .welcome-text {
      position: relative;
      z-index: 1;
    }

    .welcome-text h1 {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 20px;
      line-height: 1.2;
      animation: fadeInLeft 0.8s ease-out 0.4s both;
    }

    .welcome-text p {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin-bottom: 15px;
      animation: fadeInLeft 0.8s ease-out 0.6s both;
    }

    .features {
      margin-top: 40px;
      animation: fadeInLeft 0.8s ease-out 0.8s both;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 15px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
    }

    .feature-icon {
      width: 24px;
      height: 24px;
      background: #00d4aa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .feature-icon::before {
      content: '✓';
      color: #ffffff;
      font-weight: 600;
      font-size: 12px;
    }

    .right-panel {
      padding: 60px 50px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .error-alert {
      margin-bottom: 20px;
      animation: fadeIn 0.6s ease-out both;
    }

    .login-header {
      margin-bottom: 40px;
      animation: fadeIn 0.8s ease-out 0.4s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .login-header h2 {
      font-size: 28px;
      font-weight: 700;
      color: #003032;
      margin-bottom: 8px;
    }

    .login-header p {
      color: #6c757d;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 24px;
      animation: fadeInUp 0.6s ease-out both;
    }

    .form-group:nth-child(1) {
      animation-delay: 0.5s;
    }

    .form-group:nth-child(2) {
      animation-delay: 0.6s;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #003032;
      font-weight: 600;
      font-size: 14px;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      width: 20px;
      height: 20px;
    }

    input {
      width: 100%;
      padding: 16px 18px 16px 50px;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 15px;
      font-family: 'Poppins', sans-serif;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }

    input:focus {
      outline: none;
      border-color: #00d4aa;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.3);
    }

    .password-toggle {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #6c757d;
      padding: 5px;
      transition: color 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .password-toggle:hover {
      color: #003032;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      font-size: 14px;
      animation: fadeInUp 0.6s ease-out 0.7s both;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #6c757d;
    }

    .remember-me input[type="checkbox"] {
      width: auto;
      padding: 0;
      margin: 0;
      cursor: pointer;
    }

    .forgot-password {
      color: #00d4aa;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.3s ease;
    }

    .forgot-password:hover {
      opacity: 0.8;
    }

    .login-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #003032 0%, #004d4f 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Poppins', sans-serif;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 48, 50, 0.3);
      animation: fadeInUp 0.6s ease-out 0.8s both;
      position: relative;
      overflow: hidden;
    }

    .login-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .login-btn:hover::before {
      left: 100%;
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 48, 50, 0.4);
    }

    .login-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .divider {
      text-align: center;
      margin: 30px 0;
      position: relative;
      animation: fadeIn 0.6s ease-out 0.9s both;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
    }

    .divider span {
      background: #ffffff;
      padding: 0 15px;
      color: #6c757d;
      font-size: 14px;
      position: relative;
      z-index: 1;
    }

    .signup-link {
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      animation: fadeIn 0.6s ease-out 1s both;
    }

    .signup-link a {
      color: #00d4aa;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.3s ease;
    }

    .signup-link a:hover {
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
      }

      .left-panel {
        padding: 40px 30px;
      }

      .right-panel {
        padding: 40px 30px;
      }

      .welcome-text h1 {
        font-size: 32px;
      }

      .logo-text {
        font-size: 24px;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);

  loginForm = this.fb.group({
    identifier: ['manager@pharmly.com', [Validators.required]],
    password: ['password', [Validators.required]],
    rememberMe: [false]
  });

  togglePassword(): void {
    this.showPassword.update(val => !val);
  }

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

