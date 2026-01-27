import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./referrals-list/referrals-list.component').then(m => m.ReferralsListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./referral-detail/referral-detail.component').then(m => m.ReferralDetailComponent)
  }
];





