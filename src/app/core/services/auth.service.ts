import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { Pharmacy } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'owner@pharmly.com',
      username: 'owner',
      phone: '+1234567890',
      password: 'password',
      role: UserRole.ACCOUNT_OWNER,
      fullName: 'James Bond',
      avatarUrl: 'https://ui-avatars.com/api/?name=James+Bond',
      pharmacies: [
        {
          id: 'ph1',
          name: 'Main Pharmacy',
          address: '123 Main St',
          phone: '+1234567890',
          email: 'main@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        },
        {
          id: 'ph2',
          name: 'Branch Pharmacy',
          address: '456 Branch Ave',
          phone: '+1234567891',
          email: 'branch@pharmly.com',
          primaryColor: '#166534',
          secondaryColor: '#22c55e',
          sidebarColor: '#14532d',
          rtlEnabled: false
        }
      ]
    },
    {
      id: '2',
      email: 'manager@pharmly.com',
      username: 'manager',
      password: 'password',
      role: UserRole.PHARMACY_MANAGER,
      fullName: 'John Manager',
      pharmacyId: 'ph1'
    },
    {
      id: '3',
      email: 'staff@pharmly.com',
      username: 'staff',
      password: 'password',
      role: UserRole.PHARMACY_STAFF,
      fullName: 'Jane Staff',
      pharmacyId: 'ph1'
    },
    {
      id: '4',
      email: 'admin@pharmly.com',
      username: 'admin',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      fullName: 'Super Admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin'
    }
  ];

  constructor() {
    // Check if user is already logged in (localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(identifier: string, password: string): Observable<User> {
    // Mock login - check email, username, or phone
    const user = this.mockUsers.find(u =>
      (u.email === identifier || u.username === identifier || u.phone === identifier) &&
      u.password === password
    );

    if (user) {
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      const userToStore = { ...user, password: '' };
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      this.currentUserSubject.next(userToStore);
      return of(userToStore).pipe(delay(500));
    }

    throw new Error('Invalid credentials');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }
}







