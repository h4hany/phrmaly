import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { TrainingModule, Certification } from '../models/hr.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';
import { PharmacyContextService } from './pharmacy-context.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private pharmacyContextService = inject(PharmacyContextService);

  private modules: TrainingModule[] = [
    {
      id: 'TM001',
      pharmacyId: 'ph1',
      title: 'Pharmacy Safety Protocols',
      description: 'Essential safety procedures for handling medications',
      category: 'safety',
      difficulty: 'beginner',
      estimatedDuration: 30,
      videoUrl: 'https://example.com/video1',
      content: '<p>Learn about proper medication handling, storage, and disposal procedures.</p>',
      quiz: {
        questions: [
          {
            id: 'Q1',
            question: 'What is the proper temperature for storing most medications?',
            type: 'multiple_choice',
            options: ['Room temperature (20-25°C)', 'Refrigerated (2-8°C)', 'Frozen (-20°C)', 'Any temperature'],
            correctAnswer: 0,
            points: 10
          },
          {
            id: 'Q2',
            question: 'Expired medications should be disposed of immediately.',
            type: 'true_false',
            correctAnswer: 1,
            points: 10
          }
        ],
        passingScore: 70
      },
      isRequired: true,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    {
      id: 'TM002',
      pharmacyId: 'ph1',
      title: 'Customer Service Excellence',
      description: 'Best practices for customer interactions',
      category: 'customer_service',
      difficulty: 'intermediate',
      estimatedDuration: 45,
      content: '<p>Learn how to provide exceptional customer service in a pharmacy setting.</p>',
      isRequired: false,
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin'
    }
  ];

  private certifications: Certification[] = [
    {
      id: 'CERT001',
      pharmacyId: 'ph1',
      staffId: 'ST001',
      staffName: 'Sarah Johnson',
      moduleId: 'TM001',
      moduleTitle: 'Pharmacy Safety Protocols',
      status: 'completed',
      startedAt: new Date('2024-11-01'),
      completedAt: new Date('2024-11-01'),
      score: 90,
      maxScore: 100,
      passingScore: 70,
      passed: true,
      attempts: 1,
      lastAttemptAt: new Date('2024-11-01'),
      certificateUrl: 'https://example.com/cert1.pdf',
      createdAt: new Date('2024-11-01'),
      updatedAt: new Date('2024-11-01')
    },
    {
      id: 'CERT002',
      pharmacyId: 'ph1',
      staffId: 'ST002',
      staffName: 'Michael Chen',
      moduleId: 'TM001',
      moduleTitle: 'Pharmacy Safety Protocols',
      status: 'in_progress',
      startedAt: new Date('2024-11-20'),
      attempts: 1,
      lastAttemptAt: new Date('2024-11-20'),
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-20')
    }
  ];

  getModules(params?: PaginationParams & { category?: string; isRequired?: boolean }): Observable<PaginatedResponse<TrainingModule>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.modules.filter(m => m.pharmacyId === pharmacyId && m.isActive);

    if (params?.category) {
      filtered = filtered.filter(m => m.category === params.category);
    }

    if (params?.isRequired !== undefined) {
      filtered = filtered.filter(m => m.isRequired === params.isRequired);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  getModuleById(id: string): Observable<TrainingModule | null> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of(null).pipe(delay(300));
    }

    const module = this.modules.find(m => m.id === id && m.pharmacyId === pharmacyId);
    return of(module || null).pipe(delay(300));
  }

  getCertifications(params?: PaginationParams & { staffId?: string; status?: string }): Observable<PaginatedResponse<Certification>> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }).pipe(delay(300));
    }

    let filtered = this.certifications.filter(c => c.pharmacyId === pharmacyId);

    if (params?.staffId) {
      filtered = filtered.filter(c => c.staffId === params.staffId);
    }

    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    return of({
      data: paginated,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(500));
  }

  startTraining(staffId: string, moduleId: string): Observable<Certification> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      throw new Error('No pharmacy selected');
    }

    // Check if certification already exists
    let certification = this.certifications.find(c => 
      c.pharmacyId === pharmacyId && 
      c.staffId === staffId && 
      c.moduleId === moduleId
    );

    if (certification) {
      certification.status = 'in_progress';
      certification.updatedAt = new Date();
      return of(certification).pipe(delay(300));
    }

    const module = this.modules.find(m => m.id === moduleId && m.pharmacyId === pharmacyId);
    if (!module) {
      throw new Error('Training module not found');
    }

    certification = {
      id: `CERT${Date.now()}`,
      pharmacyId,
      staffId,
      moduleId,
      moduleTitle: module.title,
      status: 'in_progress',
      startedAt: new Date(),
      attempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.certifications.push(certification);
    return of(certification).pipe(delay(500));
  }

  completeTraining(certificationId: string, score: number, maxScore: number): Observable<Certification> {
    const certification = this.certifications.find(c => c.id === certificationId);
    if (!certification) {
      throw new Error('Certification not found');
    }

    const module = this.modules.find(m => m.id === certification.moduleId);
    const passingScore = module?.quiz?.passingScore || 70;
    const percentage = (score / maxScore) * 100;
    const passed = percentage >= passingScore;

    certification.status = passed ? 'completed' : 'failed';
    certification.completedAt = new Date();
    certification.score = score;
    certification.maxScore = maxScore;
    certification.passingScore = passingScore;
    certification.passed = passed;
    certification.attempts = (certification.attempts || 0) + 1;
    certification.lastAttemptAt = new Date();
    certification.updatedAt = new Date();

    if (passed) {
      certification.certificateUrl = `https://example.com/certificates/${certificationId}.pdf`;
    }

    return of(certification).pipe(delay(500));
  }

  getStaffCertifications(staffId: string): Observable<Certification[]> {
    const pharmacyId = this.pharmacyContextService.getCurrentPharmacy()?.id;
    if (!pharmacyId) {
      return of([]).pipe(delay(300));
    }

    const filtered = this.certifications.filter(c => 
      c.pharmacyId === pharmacyId && 
      c.staffId === staffId
    );

    return of(filtered).pipe(delay(300));
  }
}

