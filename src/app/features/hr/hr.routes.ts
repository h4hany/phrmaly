import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'attendance',
    loadComponent: () => import('./attendance/attendance.component').then(m => m.AttendanceComponent)
  },
  {
    path: 'payroll',
    loadComponent: () => import('./payroll/payroll.component').then(m => m.PayrollComponent)
  },
  {
    path: 'performance',
    loadComponent: () => import('./performance/performance.component').then(m => m.PerformanceComponent)
  },
  {
    path: 'training',
    loadComponent: () => import('./training/training.component').then(m => m.TrainingComponent)
  }
];



