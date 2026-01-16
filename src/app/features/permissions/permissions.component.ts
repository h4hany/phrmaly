import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableColumn } from '../../shared/components/table/table.component';
import { TabsComponent, TabComponent } from '../../shared/components/tabs/tabs.component';
import { PermissionEngineService } from '../../core/engines/permission-engine.service';
import { Role, Permission } from '../../core/models/permission.model';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, TableComponent, TabsComponent, TabComponent, TranslatePipe],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">{{ 'permissions.title' | translate }}</h2>

      <app-tabs>
        <app-tab [title]="'permissions.roles' | translate" [active]="true">
          <div class="p-6">
            <app-table
              [columns]="roleColumns"
              [data]="roles"
              [emptyMessage]="'permissions.noRoles'"
            ></app-table>
          </div>
        </app-tab>
        <app-tab [title]="'permissions.permissions' | translate" [active]="false">
          <div class="p-6">
            <app-table
              [columns]="permissionColumns"
              [data]="permissions"
              [emptyMessage]="'permissions.noPermissions'"
            ></app-table>
          </div>
        </app-tab>
      </app-tabs>
    </div>
  `,
  styles: []
})
export class PermissionsComponent implements OnInit {
  private permissionEngine = inject(PermissionEngineService);

  roles: Role[] = [];
  permissions: any[] = []; // Using any[] because we're adding roleName and actionsDisplay

  roleColumns: TableColumn[] = [
    { key: 'name', label: 'permissions.roleName' },
    { key: 'description', label: 'permissions.description' },
    { key: 'permissionCount', label: 'permissions.permissionCount' }
  ];

  permissionColumns: TableColumn[] = [
    { key: 'roleName', label: 'permissions.role' },
    { key: 'resource', label: 'permissions.resource' },
    { key: 'actionsDisplay', label: 'permissions.actions' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.permissionEngine.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles.map(role => ({
          ...role,
          permissionCount: role.permissions.length
        }));
        // Flatten permissions from all roles
        this.permissions = roles.flatMap(role => 
          role.permissions.map(p => ({
            ...p,
            roleName: role.name,
            actionsDisplay: p.actions.join(', ')
          }))
        );
      }
    });
  }
}
