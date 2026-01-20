import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketsService } from '../../../core/services/tickets.service';
import { Ticket, TicketMessage } from '../../../core/models/ticket.model';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { DateFormatPipe } from '../../../core/pipes/date-format.pipe';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalComponent,
    BadgeComponent,
    DateFormatPipe
  ],
  template: `
    <div class="flex h-[calc(100vh-300px)] gap-4">
      <!-- Left Sidebar - Ticket List -->
      <div class="w-1/3 border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <app-button variant="primary" (onClick)="createModal.open()" [fullWidth]="true">
            <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Ticket
          </app-button>
        </div>
        <div class="flex-1 overflow-y-auto">
          @if (loading) {
            <div class="p-4 text-center text-gray-500">Loading tickets...</div>
          } @else if (tickets().length === 0) {
            <div class="p-4 text-center text-gray-500">No tickets yet. Create your first ticket!</div>
          } @else {
            <div class="divide-y divide-gray-200">
              @for (ticket of tickets(); track ticket.id) {
                <div
                  (click)="selectTicket(ticket.id)"
                  [class.bg-blue-50]="selectedTicketId() === ticket.id"
                  [class.bg-white]="selectedTicketId() !== ticket.id"
                  class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-semibold text-gray-900 text-sm">{{ ticket.subject }}</h3>
                    <app-badge [variant]="getStatusVariant(ticket.status)">{{ ticket.status }}</app-badge>
                  </div>
                  <p class="text-xs text-gray-500 mb-2 line-clamp-2">{{ ticket.description }}</p>
                  <div class="flex items-center justify-between text-xs text-gray-400">
                    <span>{{ ticket.screen }}</span>
                    <span>{{ ticket.updatedAt | dateFormat }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Right Side - Ticket Details -->
      <div class="flex-1 flex flex-col">
        @if (selectedTicket()) {
          <div class="flex-1 flex flex-col">
            <!-- Ticket Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h2 class="text-xl font-bold text-gray-900">{{ selectedTicket()!.subject }}</h2>
                  <p class="text-sm text-gray-500 mt-1">{{ selectedTicket()!.screen }}</p>
                </div>
                <app-badge [variant]="getStatusVariant(selectedTicket()!.status)">
                  {{ selectedTicket()!.status }}
                </app-badge>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
              @for (message of messages(); track message.id) {
                <div [class.flex-row-reverse]="message.isFromSupport" class="flex gap-3">
                  <div [class.bg-blue-50]="message.isFromSupport" [class.bg-gray-100]="!message.isFromSupport" class="max-w-[70%] rounded-lg p-3">
                    <p class="text-sm text-gray-900">{{ message.message }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ message.createdAt | dateFormat }}</p>
                  </div>
                </div>
              }
            </div>

            <!-- Message Input -->
            <div class="p-4 border-t border-gray-200">
              <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="flex gap-2">
                <input
                  type="text"
                  formControlName="message"
                  placeholder="Type your message..."
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]"
                />
                <app-button type="submit" variant="primary" [disabled]="messageForm.invalid || sending()">
                  Send
                </app-button>
              </form>
            </div>
          </div>
        } @else {
          <div class="flex-1 flex items-center justify-center text-gray-500">
            Select a ticket to view details
          </div>
        }
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <app-modal
      #createModal
      title="Create New Ticket"
      [showFooter]="true"
      [confirmText]="'Create Ticket'"
      [confirmLoading]="creating()"
      (confirmed)="createTicket()"
    >
      <form [formGroup]="ticketForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Subject <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            formControlName="subject"
            class="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Screen/Page <span class="text-red-500">*</span>
          </label>
          <select
            formControlName="screen"
            class="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]"
          >
            <option value="">Select Screen</option>
            <option value="/dashboard">Dashboard</option>
            <option value="/drugs">Drugs</option>
            <option value="/drugs/new">Add Drug</option>
            <option value="/patients">Patients</option>
            <option value="/invoices">Invoices</option>
            <option value="/purchases">Purchases</option>
            <option value="/suppliers">Suppliers</option>
            <option value="/payments">Payments</option>
            <option value="/bundles">Bundles</option>
            <option value="/inventory/alerts">Inventory Alerts</option>
            <option value="/pharmacy-staff">Pharmacy Staff</option>
            <option value="/settings">Settings</option>
            <option value="/reports">Reports</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            formControlName="description"
            rows="5"
            class="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]"
            placeholder="Describe the issue you're facing..."
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Screenshot (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            (change)="onFileSelected($event)"
            class="w-full px-4 py-2 border border-gray-300 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-bg)]"
          />
          @if (selectedFile()) {
            <p class="mt-1 text-sm text-gray-600">{{ selectedFile()!.name }}</p>
          }
        </div>
      </form>
    </app-modal>
  `,
  styles: []
})
export class TicketsComponent implements OnInit {
  private ticketsService = inject(TicketsService);
  private fb = inject(FormBuilder);

  tickets = signal<Ticket[]>([]);
  selectedTicketId = signal<string | null>(null);
  selectedTicket = signal<Ticket | null>(null);
  messages = signal<TicketMessage[]>([]);
  loading = false;
  sending = signal(false);
  creating = signal(false);
  selectedFile = signal<File | null>(null);

  ticketForm!: FormGroup;
  messageForm!: FormGroup;

  @ViewChild('createModal') createModal!: ModalComponent;

  ngOnInit(): void {
    this.ticketForm = this.fb.group({
      subject: ['', Validators.required],
      screen: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });

    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketsService.getAll().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading = false;
        if (tickets.length > 0 && !this.selectedTicketId()) {
          this.selectTicket(tickets[0].id);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectTicket(ticketId: string): void {
    this.selectedTicketId.set(ticketId);
    this.ticketsService.getById(ticketId).subscribe({
      next: (ticket) => {
        if (ticket) {
          this.selectedTicket.set(ticket);
          this.loadMessages(ticketId);
        }
      }
    });
  }

  loadMessages(ticketId: string): void {
    this.ticketsService.getMessages(ticketId).subscribe({
      next: (messages) => {
        this.messages.set(messages);
      }
    });
  }

  createTicket(): void {
    if (this.ticketForm.valid) {
      this.creating.set(true);
      const ticketData = {
        ...this.ticketForm.value,
        status: 'open' as const,
        priority: 'medium' as const,
        userId: '1'
      };

      this.ticketsService.create(ticketData).subscribe({
        next: (ticket) => {
          this.loadTickets();
          this.selectTicket(ticket.id);
          this.ticketForm.reset();
          this.selectedFile.set(null);
          this.createModal.close();
          this.creating.set(false);
        },
        error: () => {
          this.creating.set(false);
        }
      });
    }
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedTicketId()) {
      this.sending.set(true);
      this.ticketsService.addMessage(this.selectedTicketId()!, this.messageForm.value.message).subscribe({
        next: () => {
          this.messageForm.reset();
          this.loadMessages(this.selectedTicketId()!);
          this.sending.set(false);
        },
        error: () => {
          this.sending.set(false);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  getStatusVariant(status: Ticket['status']): 'success' | 'warning' | 'danger' | 'default' {
    const statusMap: { [key: string]: 'success' | 'warning' | 'danger' | 'default' } = {
      'open': 'danger',
      'in_progress': 'warning',
      'resolved': 'success',
      'closed': 'default'
    };
    return statusMap[status] || 'default';
  }
}

