export interface Ticket {
  id: string;
  subject: string;
  description: string;
  screen: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromSupport: boolean;
  attachments?: string[];
  createdAt: Date;
}







