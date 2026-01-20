/**
 * Can Access Directive
 * 
 * Structural directive for template-level security.
 * Controls visibility and interactivity of elements based on feature permissions.
 * 
 * Usage:
 *   *appCanAccess="'invoice.create'"
 *   *appCanAccess="'invoice.create'; mode: 'disable'"
 *   *appCanAccess="'invoice.create'; mode: 'readonly'"
 * 
 * Modes:
 *   - hide (default): Remove element from DOM
 *   - disable: Keep visible but disable interactions
 *   - readonly: Allow visibility but block click/submit events
 * 
 * Requirements:
 *   - React to input changes
 *   - Clean up embedded views
 *   - SSR-safe
 *   - Not break layouts
 */

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RbacService } from '../../core/security/rbac.service';
import { Subscription } from 'rxjs';

type AccessMode = 'hide' | 'disable' | 'readonly';

@Directive({
  selector: '[appCanAccess]',
  standalone: true
})
export class CanAccessDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private rbacService = inject(RbacService);
  private cdr = inject(ChangeDetectorRef);

  private subscription?: Subscription;
  private embeddedView: any = null;
  private hasAccess = false;

  @Input('appCanAccess') featureKey!: string;
  @Input() mode: AccessMode = 'hide';

  ngOnInit(): void {
    if (!this.featureKey) {
      console.warn('CanAccessDirective: featureKey is required');
      return;
    }

    this.checkAccess();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.clearView();
  }

  private checkAccess(): void {
    const canAccess = this.rbacService.canAccessFeature(this.featureKey);
    
    if (canAccess !== this.hasAccess) {
      this.hasAccess = canAccess;
      this.updateView();
    }
  }

  private updateView(): void {
    if (this.mode === 'hide') {
      // Hide mode: add/remove from DOM
      if (this.hasAccess) {
        if (!this.embeddedView) {
          this.embeddedView = this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else {
        this.clearView();
      }
    } else {
      // Disable/Readonly mode: always render, but control interactivity
      if (!this.embeddedView) {
        this.embeddedView = this.viewContainer.createEmbeddedView(this.templateRef);
      }

      // Apply disabled/readonly state to the element
      if (this.embeddedView.rootNodes && this.embeddedView.rootNodes.length > 0) {
        const element = this.embeddedView.rootNodes[0];
        
        if (this.mode === 'disable') {
          if (this.hasAccess) {
            element.removeAttribute('disabled');
            element.removeAttribute('aria-disabled');
            element.classList.remove('opacity-50', 'pointer-events-none');
          } else {
            element.setAttribute('disabled', 'true');
            element.setAttribute('aria-disabled', 'true');
            element.classList.add('opacity-50', 'pointer-events-none');
          }
        } else if (this.mode === 'readonly') {
          if (this.hasAccess) {
            element.removeAttribute('readonly');
            element.removeAttribute('aria-readonly');
          } else {
            element.setAttribute('readonly', 'true');
            element.setAttribute('aria-readonly', 'true');
            // Block click events
            if (element.addEventListener) {
              element.addEventListener('click', this.blockClick, true);
              element.addEventListener('submit', this.blockSubmit, true);
            }
          }
        }
      }
    }

    this.cdr.markForCheck();
  }

  private blockClick = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  private blockSubmit = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  private clearView(): void {
    if (this.embeddedView) {
      // Clean up event listeners if in readonly mode
      if (this.mode === 'readonly' && this.embeddedView.rootNodes) {
        this.embeddedView.rootNodes.forEach((node: any) => {
          if (node.removeEventListener) {
            node.removeEventListener('click', this.blockClick, true);
            node.removeEventListener('submit', this.blockSubmit, true);
          }
        });
      }
      
      this.viewContainer.clear();
      this.embeddedView = null;
    }
  }
}



