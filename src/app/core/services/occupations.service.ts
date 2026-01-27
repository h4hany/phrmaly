import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Occupation } from '../models/occupation.model';

@Injectable({
  providedIn: 'root'
})
export class OccupationsService {
  private occupations: Occupation[] = [
    { id: '1', name: 'Engineer', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '2', name: 'Doctor', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '3', name: 'Teacher', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '4', name: 'Nurse', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '5', name: 'Lawyer', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') }
  ];

  getAll(): Observable<Occupation[]> {
    return of([...this.occupations]).pipe(delay(300));
  }

  getById(id: string): Observable<Occupation | null> {
    const occupation = this.occupations.find(o => o.id === id);
    return of(occupation || null).pipe(delay(200));
  }

  create(occupation: Omit<Occupation, 'id' | 'createdAt' | 'updatedAt'>): Observable<Occupation> {
    const newOccupation: Occupation = {
      ...occupation,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.occupations.push(newOccupation);
    return of(newOccupation).pipe(delay(300));
  }

  update(id: string, occupation: Partial<Occupation>): Observable<Occupation> {
    const index = this.occupations.findIndex(o => o.id === id);
    if (index === -1) {
      throw new Error('Occupation not found');
    }
    this.occupations[index] = {
      ...this.occupations[index],
      ...occupation,
      id,
      updatedAt: new Date()
    };
    return of(this.occupations[index]).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.occupations.findIndex(o => o.id === id);
    if (index === -1) {
      return of(false).pipe(delay(200));
    }
    this.occupations.splice(index, 1);
    return of(true).pipe(delay(300));
  }

  search(query: string): Observable<Occupation[]> {
    const lowerQuery = query.toLowerCase();
    return of(this.occupations.filter(o => o.name.toLowerCase().includes(lowerQuery))).pipe(delay(200));
  }
}











