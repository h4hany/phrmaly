/**
 * Platform Endpoint Constants
 * 
 * This is the ONLY place where endpoint paths exist.
 * All services MUST use these constants, never hardcode paths.
 */

export const PLATFORM_ENDPOINTS = {
  // Authentication
  auth: {
    login: 'auth/login',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
    me: 'auth/me'
  },
  
  // Platform Admins
  admins: {
    root: 'admins',
    byId: (id: string) => `admins/${id}`,
    roles: (id: string) => `admins/${id}/roles`
  },
  
  // Subscription Plans
  plans: {
    root: 'subscription-plans',
    byId: (id: string) => `subscription-plans/${id}`
  },
  
  // Subscriptions
  subscriptions: {
    root: 'subscriptions',
    byId: (id: string) => `subscriptions/${id}`
  },
  
  // Invoices
  invoices: {
    root: 'invoices',
    byId: (id: string) => `invoices/${id}`
  },
  
  // Platform Modules
  modules: {
    root: 'modules',
    byId: (id: string) => `modules/${id}`
  },
  
  // Master Data - Countries
  countries: {
    root: 'countries',
    byId: (id: string) => `countries/${id}`
  },
  
  // Master Data - Cities
  cities: {
    root: 'cities',
    byId: (id: string) => `cities/${id}`
  },
  
  // Master Data - Areas
  areas: {
    root: 'areas',
    byId: (id: string) => `areas/${id}`
  },
  
  // Master Data - Occupations
  occupations: {
    root: 'occupations',
    byId: (id: string) => `occupations/${id}`
  },
  
  // Accounts
  accounts: {
    root: 'accounts',
    byId: (id: string) => `accounts/${id}`
  }
} as const;

/**
 * Tenant (Pharmacy) Endpoint Constants
 */
export const TENANT_ENDPOINTS = {
  // Authentication
  auth: {
    login: 'auth/login',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
    me: 'auth/me',
    switchPharmacy: 'auth/switch-pharmacy'
  },
  // Staff
  staff: {
    root: 'staff',
    byId: (id: string) => `staff/${id}`,
    permissions: (id: string) => `staff/${id}/permissions`
  },
  // Pharmacies
  pharmacies: {
    root: 'pharmacies',
    byId: (id: string) => `pharmacies/${id}`
  },
  // Subscriptions
  subscriptions: {
    root: 'subscriptions',
    current: 'subscriptions/current'
  }
} as const;

