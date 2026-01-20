import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Ticket, TicketMessage } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private tickets: Ticket[] = [
    {
      id: 'T001',
      subject: 'Unable to add new drug',
      description: 'I am having trouble adding a new drug to the system. The form keeps showing an error.',
      screen: '/drugs/new',
      status: 'open',
      priority: 'high',
      createdAt: new Date('2024-12-01'),
      updatedAt: new Date('2024-12-01'),
      userId: '1'
    },
    {
      id: 'T002',
      subject: 'Invoice printing issue',
      description: 'The invoice is not printing correctly. The layout seems broken.',
      screen: '/invoices',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date('2024-11-28'),
      updatedAt: new Date('2024-11-30'),
      userId: '1'
    },
    {
      id: 'T003',
      subject: 'Report generation slow',
      description: 'The reports page takes too long to load. It seems to be stuck.',
      screen: '/reports',
      status: 'resolved',
      priority: 'low',
      createdAt: new Date('2024-11-25'),
      updatedAt: new Date('2024-11-27'),
      userId: '1'
    }
  ];

  private messages: TicketMessage[] = [
    {
      id: 'M001',
      ticketId: 'T001',
      message: 'I am having trouble adding a new drug to the system. The form keeps showing an error.',
      isFromSupport: false,
      createdAt: new Date('2024-12-01T10:00:00')
    },
    {
      id: 'M002',
      ticketId: 'T001',
      message: 'Thank you for reporting this issue. We are looking into it and will get back to you soon.',
      isFromSupport: true,
      createdAt: new Date('2024-12-01T11:30:00')
    },
    {
      id: 'M003',
      ticketId: 'T002',
      message: 'The invoice is not printing correctly. The layout seems broken.',
      isFromSupport: false,
      createdAt: new Date('2024-11-28T09:00:00')
    },
    {
      id: 'M004',
      ticketId: 'T002',
      message: 'We have identified the issue and are working on a fix. This should be resolved in the next update.',
      isFromSupport: true,
      createdAt: new Date('2024-11-29T14:00:00')
    }
  ];

  getAll(): Observable<Ticket[]> {
    return of([...this.tickets]).pipe(delay(300));
  }

  getById(id: string): Observable<Ticket | null> {
    const ticket = this.tickets.find(t => t.id === id);
    return of(ticket || null).pipe(delay(200));
  }

  create(ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Observable<Ticket> {
    const newTicket: Ticket = {
      ...ticket,
      id: `T${String(this.tickets.length + 1).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tickets.unshift(newTicket);
    
    // Add initial message
    const initialMessage: TicketMessage = {
      id: `M${String(this.messages.length + 1).padStart(3, '0')}`,
      ticketId: newTicket.id,
      message: ticket.description,
      isFromSupport: false,
      createdAt: new Date()
    };
    this.messages.push(initialMessage);
    
    return of(newTicket).pipe(delay(500));
  }

  getMessages(ticketId: string): Observable<TicketMessage[]> {
    const ticketMessages = this.messages.filter(m => m.ticketId === ticketId);
    return of(ticketMessages).pipe(delay(200));
  }

  addMessage(ticketId: string, message: string, isFromSupport: boolean = false): Observable<TicketMessage> {
    const newMessage: TicketMessage = {
      id: `M${String(this.messages.length + 1).padStart(3, '0')}`,
      ticketId,
      message,
      isFromSupport,
      createdAt: new Date()
    };
    this.messages.push(newMessage);
    
    // Update ticket updatedAt
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.updatedAt = new Date();
    }
    
    return of(newMessage).pipe(delay(300));
  }

  updateStatus(ticketId: string, status: Ticket['status']): Observable<Ticket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
    }
    return of(ticket!).pipe(delay(200));
  }
}







