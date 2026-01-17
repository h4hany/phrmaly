import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformContextService } from '../../../core/services/platform-context.service';
import { RbacService } from '../../../core/security/rbac.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `<div></div>`,
  styles: []
})
export class RedirectComponent implements OnInit {
  private router = inject(Router);
  private platformContext = inject(PlatformContextService);
  private rbacService = inject(RbacService);

  ngOnInit(): void {
    // Redirect based on platform mode
    if (this.platformContext.isPlatformMode()) {
      this.router.navigate(['/system/dashboard']);
      return;
    }

    // Get role-based home route
    const homeRoute = this.rbacService.getHomeRoute();
    this.router.navigate([homeRoute]);
  }
}

