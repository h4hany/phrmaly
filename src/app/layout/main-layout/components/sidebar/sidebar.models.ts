/**
 * Sidebar Navigation Models
 * 
 * Defines the structure for config-driven sidebar navigation
 * with permission-ready role-based visibility.
 */

export interface SidebarItem {
  path: string;
  label: string; // Translation key
  icon: string; // Semantic icon name (e.g., 'layout-grid', 'receipt', 'pill-bottle')
  roles?: string[]; // Optional: roles that can see this item
  exact?: boolean; // Optional: exact route matching
}

export interface SidebarGroup {
  key: string; // Unique identifier for the group
  label: string; // Translation key
  icon: string; // Semantic icon name
  items: SidebarItem[];
  collapsedByDefault?: boolean; // Default collapse state
  roles?: string[]; // Optional: roles that can see this group
  order?: number; // Optional: display order
}



