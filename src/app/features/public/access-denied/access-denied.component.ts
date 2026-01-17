/**
 * Access Denied Component
 * 
 * Displayed when a user attempts to access a route they don't have permission for.
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, ButtonComponent, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <!-- Lock Icon -->
        <div class="mb-6 flex justify-center">
          <div class="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          {{ 'accessDenied.title' | translate }}
        </h1>

        <!-- Message -->
        <p class="text-gray-600 mb-8">
          {{ 'accessDenied.message' | translate }}
        </p>

        <!-- Attempted Route (if available) -->
        @if (attemptedRoute) {
          <div class="mb-6 p-3 bg-gray-50 rounded-md">
            <p class="text-sm text-gray-500 mb-1">{{ 'accessDenied.attemptedRoute' | translate }}</p>
            <p class="text-sm font-mono text-gray-700">{{ attemptedRoute }}</p>
          </div>
        }

        <!-- Action Button -->
        <app-button variant="primary" (onClick)="goHome()" [fullWidth]="true">
          <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {{ 'accessDenied.goHome' | translate }}
        </app-button>
      </div>
    </div>
  `,
  styles: []
})
export class AccessDeniedComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  attemptedRoute: string | null = null;

  ngOnInit(): void {
    // Get attempted route from query params
    this.route.queryParams.subscribe(params => {
      this.attemptedRoute = params['attemptedRoute'] || null;
    });
  }

  goHome(): void {
    // Try to go to returnUrl if available, otherwise go to dashboard or root
    this.route.queryParams.subscribe(params => {
      const returnUrl = params['returnUrl'];
      if (returnUrl && returnUrl !== '/access-denied') {
        // Try to navigate to returnUrl, but if it fails, go to root
        this.router.navigateByUrl(returnUrl).catch(() => {
          this.router.navigate(['/']);
        });
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}

