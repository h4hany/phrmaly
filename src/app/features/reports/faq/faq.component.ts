import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
  link?: string;
  linkText?: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4">
      @for (faq of faqs(); track $index) {
        <div class="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ faq.question }}</h3>
          <div class="text-gray-700 leading-relaxed">
            <p class="whitespace-pre-line">{{ faq.answer }}</p>
            @if (faq.link && faq.linkText) {
              <p class="mt-3">
                <a [routerLink]="faq.link" class="text-[var(--primary-bg)] hover:underline font-medium">
                  {{ faq.linkText }} →
                </a>
              </p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class FAQComponent {
  faqs = signal<FAQItem[]>([
    {
      question: 'Where can I sell products?',
      answer: `You can sell products (create invoices) from the Sales/Invoices section of the application.

To create a new invoice:
1. Navigate to the Sales/Invoices page from the sidebar
2. Click on the "Add New Invoice" button
3. Select the patient/customer
4. Add products to the invoice
5. Review and complete the sale

The invoice will be automatically saved and can be viewed or printed later.`,
      link: '/invoices',
      linkText: 'Go to Invoices Page'
    },
    {
      question: 'How do I add a new drug to the system?',
      answer: `To add a new drug:
1. Go to the Drugs section from the sidebar
2. Click on the "Add New Drug" button
3. Fill in the required information:
   - Select a general drug from the list
   - Enter internal barcode (PLU)
   - Set the price and stock quantity
   - Set expiry date if applicable
4. Click "Create Drug" to save

The drug will be immediately available for sale and inventory tracking.`,
      link: '/drugs/new',
      linkText: 'Add New Drug'
    },
    {
      question: 'How do I manage inventory alerts?',
      answer: `Inventory alerts help you track low stock and expiring drugs.

To view alerts:
1. Navigate to Inventory Alerts from the Drugs menu
2. You'll see:
   - Low stock alerts for drugs below threshold
   - Expiring drugs alerts for items nearing expiry date

You can take action by purchasing more stock or managing expiring items.`,
      link: '/inventory/alerts',
      linkText: 'View Inventory Alerts'
    },
    {
      question: 'How do I add a new patient?',
      answer: `To add a new patient:
1. Go to the Patients/Customers section
2. Click on "Add New Patient"
3. Fill in patient information:
   - Full name
   - Contact information (email, phone)
   - Address details
4. Save the patient

Patients can then be selected when creating invoices.`,
      link: '/patients',
      linkText: 'Manage Patients'
    },
    {
      question: 'How do I track purchases from suppliers?',
      answer: `To track purchases:
1. Navigate to Purchases from the Suppliers menu
2. View all purchase invoices
3. Create a new purchase by clicking "Add New Purchase"
4. Select supplier and add items
5. Track payment status and due dates

This helps you manage supplier relationships and inventory restocking.`,
      link: '/purchases',
      linkText: 'View Purchases'
    },
    {
      question: 'How do I customize the theme/appearance?',
      answer: `You can customize the application's appearance from Settings:
1. Go to Settings from the sidebar
2. Click on the "Theme Settings" tab
3. Adjust colors for:
   - Primary colors (buttons, highlights)
   - Sidebar colors
   - Card and page backgrounds
   - Status colors
4. Changes are applied in real-time
5. Click "Save Changes" to persist your theme

Your theme preferences are saved and will be remembered.`,
      link: '/settings',
      linkText: 'Go to Settings'
    },
    {
      question: 'How do I manage pharmacy staff?',
      answer: `To manage staff members:
1. Go to Pharmacy Staff from the sidebar
2. View all staff members with their roles and status
3. Add new staff by clicking "Add New Staff"
4. Edit or view staff details by clicking on a staff member
5. Assign appropriate roles (Manager, Staff)

Staff members can be given access to the system based on their roles.`,
      link: '/pharmacy-staff',
      linkText: 'Manage Staff'
    }
  ]);
}









