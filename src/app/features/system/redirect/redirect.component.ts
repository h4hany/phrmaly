import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformContextService } from '../../../core/services/platform-context.service';

@Component({
  selector: 'app-redirect',
  standalone: true,
  template: `<div></div>`,
  styles: []
})
export class RedirectComponent implements OnInit {
  private router = inject(Router);
  private platformContext = inject(PlatformContextService);

  ngOnInit(): void {
    // Redirect based on platform mode
    if (this.platformContext.isPlatformMode()) {
      this.router.navigate(['/system/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}

