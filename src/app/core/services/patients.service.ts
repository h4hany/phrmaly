import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Patient } from '../models/patient.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  private patients: Patient[] = [
    {
      id: 'PAT001',
      fullName: 'John Smith',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      phone: '+201116811410',
      email: 'john.smith@example.com',
      address: {
        city: 'New York',
        area: 'Manhattan',
        street: '123 Main St',
        notes: 'Apartment 4B'
      },
      occupation: 'Engineer',
      medicalNotes: 'Allergic to penicillin',
      cardId: 'PC-2024-001234',
      validUntil: new Date('2025-12-31'),
      issuedDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-11-27')
    },
    {
      id: 'PAT002',
      fullName: 'Jane Doe',
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      phone: '+201116811410',
      email: 'jane.doe@example.com',
      address: {
        city: 'Los Angeles',
        area: 'Beverly Hills',
        street: '456 Oak Ave',
        notes: ''
      },
      occupation: 'Teacher',
      medicalNotes: '',
      cardId: 'PC-2024-001235',
      validUntil: new Date('2025-11-30'),
      issuedDate: new Date('2024-02-10'),
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-26')
    },
    {
      id: 'PAT003',
      fullName: 'Michael Johnson',
      dateOfBirth: new Date('1978-12-03'),
      gender: 'male',
      phone: '+201116811410',
      email: 'michael.j@example.com',
      address: {
        city: 'Chicago',
        area: 'Downtown',
        street: '789 Pine Rd',
        notes: ''
      },
      occupation: 'Doctor',
      medicalNotes: 'Diabetes Type 2',
      cardId: 'PC-2024-001236',
      validUntil: new Date('2026-03-20'),
      issuedDate: new Date('2024-03-20'),
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-11-25')
    }
  ];

  getAll(params?: PaginationParams): Observable<PaginatedResponse<Patient>> {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const filtered = [...this.patients];
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getById(id: string): Observable<Patient | null> {
    const patient = this.patients.find(p => p.id === id);
    return of(patient || null).pipe(delay(300));
  }

  create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Observable<Patient> {
    const newPatient: Patient = {
      ...patient,
      id: `PAT${String(this.patients.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.patients.push(newPatient);
    return of(newPatient).pipe(delay(500));
  }

  update(id: string, patient: Partial<Patient>): Observable<Patient> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Patient not found');
    }
    this.patients[index] = {
      ...this.patients[index],
      ...patient,
      id,
      updatedAt: new Date()
    };
    return of(this.patients[index]).pipe(delay(500));
  }

  delete(id: string): Observable<boolean> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }
    this.patients.splice(index, 1);
    return of(true).pipe(delay(500));
  }

  search(query: string): Observable<Patient[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.patients.filter(p =>
      p.fullName.toLowerCase().includes(lowerQuery) ||
      p.email?.toLowerCase().includes(lowerQuery) ||
      p.phone.includes(query)
    );
    return of(results).pipe(delay(300));
  }
}

