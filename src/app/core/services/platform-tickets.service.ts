import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { SupportTicket } from '../models/platform.model';
import { PaginatedResponse, PaginationParams } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformTicketsService {
  private tickets: SupportTicket[] = [
    {
      id: 'TKT001',
      accountId: 'ACC001',
      subject: 'Unable to process payments',
      description: 'Payment gateway integration is not working',
      priority: 'high',
      status: 'open',
      category: 'technical',
      createdAt: new Date('2024-11-27T10:00:00'),
      updatedAt: new Date('2024-11-27T10:00:00'),
      createdBy: 'user001',
      slaDeadline: new Date('2024-11-28T10:00:00')
    },
    {
      id: 'TKT002',
      accountId: 'ACC002',
      subject: 'Billing question',
      description: 'Need clarification on subscription pricing',
      priority: 'medium',
      status: 'assigned',
      category: 'billing',
      assignedTo: 'admin001',
      createdAt: new Date('2024-11-26T14:30:00'),
      updatedAt: new Date('2024-11-27T09:00:00'),
      createdBy: 'user002',
      slaDeadline: new Date('2024-11-29T14:30:00')
    },
    {
      id: 'TKT003',
      accountId: 'ACC001',
      subject: 'Feature request: Export reports',
      description: 'Would like to export reports to Excel',
      priority: 'low',
      status: 'resolved',
      category: 'feature_request',
      assignedTo: 'admin001',
      resolvedAt: new Date('2024-11-25T16:00:00'),
      createdAt: new Date('2024-11-24T11:00:00'),
      updatedAt: new Date('2024-11-25T16:00:00'),
      createdBy: 'user001'
    }
  ];

  getAll(params?: PaginationParams & { status?: string; priority?: string; category?: string; accountId?: string }): Observable<PaginatedResponse<SupportTicket>> {
    let filtered = [...this.tickets];

    if (params?.status) {
      filtered = filtered.filter(t => t.status === params.status);
    }

    if (params?.priority) {
      filtered = filtered.filter(t => t.priority === params.priority);
    }

    if (params?.category) {
      filtered = filtered.filter(t => t.category === params.category);
    }

    if (params?.accountId) {
      filtered = filtered.filter(t => t.accountId === params.accountId);
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

  getById(id: string): Observable<SupportTicket | null> {
    const ticket = this.tickets.find(t => t.id === id);
    return of(ticket || null).pipe(delay(300));
  }

  assignTicket(ticketId: string, adminId: string): Observable<SupportTicket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    ticket.assignedTo = adminId;
    ticket.status = 'assigned';
    ticket.updatedAt = new Date();
    return of(ticket).pipe(delay(300));
  }

  updateStatus(ticketId: string, status: SupportTicket['status']): Observable<SupportTicket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    ticket.status = status;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();
    }
    ticket.updatedAt = new Date();
    return of(ticket).pipe(delay(300));
  }

  addNote(ticketId: string, note: string): Observable<SupportTicket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    ticket.internalNotes = (ticket.internalNotes || '') + '\n' + new Date().toISOString() + ': ' + note;
    ticket.updatedAt = new Date();
    return of(ticket).pipe(delay(300));
  }
}



