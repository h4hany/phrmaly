import { Component, Input, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [hidden]="!active" class="tab-content">
      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class TabComponent {
  @Input() title: string = '';
  @Input() active: boolean = false;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabs-container">
      <div class="border-b border-gray-200">
        <nav class="flex space-x-8" aria-label="Tabs">
          @for (tab of tabsArray; track $index) {
            <button
              type="button"
              (click)="selectTab($index)"
              [class]="getTabClasses($index)"
            >
              {{ tab.title }}
            </button>
          }
        </nav>
      </div>
      <div class="mt-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      width: 100%;
    }
    .tab-button {
      border: 1px solid #e5e7eb;
      border-bottom: none;
      border-radius: 0.5rem 0.5rem 0 0;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6b7280;
      background-color: #f9fafb;
      transition: all 0.2s;
      cursor: pointer;
      position: relative;
      margin-right: 0.25rem;
    }
    .tab-button:hover {
      color: #374151;
      background-color: #f3f4f6;
      border-color: #d1d5db;
    }
    .tab-button.active {
      color: var(--primary-text);
      background-color: white;
      border-color: #e5e7eb;
      border-bottom-color: white;
      z-index: 1;
    }
    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background-color: white;
      z-index: 2;
    }
  `]
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
  tabsArray: TabComponent[] = [];

  ngAfterContentInit(): void {
    this.tabsArray = this.tabs.toArray();
    if (this.tabsArray.length > 0 && !this.tabsArray.some(t => t.active)) {
      this.tabsArray[0].active = true;
    }
  }

  selectTab(index: number): void {
    this.tabsArray.forEach((tab, i) => {
      tab.active = i === index;
    });
  }

  getTabClasses(index: number): string {
    const tab = this.tabsArray[index];
    const base = 'tab-button';
    return tab?.active ? `${base} active` : base;
  }
}

