# Pharmly - Pharmacy Management System Frontend

A production-ready SaaS Pharmacy Management System built with Angular 19, featuring comprehensive inventory management, patient records, invoicing, and reporting capabilities.

## 🚀 Features

### Core Features
- **Multi-Pharmacy Support**: Account owners can manage multiple pharmacies, staff are locked to one pharmacy
- **Authentication & Authorization**: Role-based access control (Account Owner, Pharmacy Manager, Pharmacy Staff)
- **Patient Management**: Complete CRUD operations with medical notes and invoice history
- **Drug Inventory**: General drug catalog + pharmacy-specific pricing, stock, and expiry tracking
- **Purchase Management**: Track purchases from suppliers with FIFO/Average cost inventory costing
- **Sales Invoicing**: Create invoices with barcode scanning, bundles, and promo codes
- **Supplier Management**: Manage manufacturers and warehouses
- **Payment Tracking**: Track supplier payments and sales payments
- **Reports & Analytics**: Dashboard with KPIs, charts, and detailed reports
- **Theming**: Per-pharmacy customization (logo, colors, RTL support)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Angular 19** (Standalone components)
- **Tailwind CSS 3** (Utility-first styling)
- **RxJS** (Reactive programming)
- **Chart.js** (Data visualization)
- **TypeScript** (Type safety)
- **Docker** (Containerization)

## 📋 Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose (optional, for containerized deployment)

## 🏃 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

5. **Deploy to github pages**
   ```bash
   ng build --configuration production --base-href "/phrmaly/"
   npx angular-cli-ghpages --dir=dist/pharmly-frontend/browser
   
   ```
### Demo Credentials

The application includes mock authentication with the following demo accounts:

- **Account Owner**
  - Email/Username: `owner@pharmly.com` or `owner`
  - Phone: `+1234567890`
  - Password: `password`
  - Can switch between multiple pharmacies

- **Pharmacy Manager**
  - Email/Username: `manager@pharmly.com` or `manager`
  - Password: `password`
  - Locked to Main Pharmacy

- **Pharmacy Staff**
  - Email/Username: `staff@pharmly.com` or `staff`
  - Password: `password`
  - Locked to Main Pharmacy

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image**
   ```bash
   docker build -t pharmly-frontend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   Navigate to `http://localhost:80`

### Docker Compose

The `docker-compose.yml` file includes:
- Nginx web server
- Production-optimized build
- Automatic container restart
- Network configuration

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/             # Route guards
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # Core services (auth, theme, pharmacy context)
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── dashboard/          # Dashboard & KPIs
│   │   ├── patients/           # Patient management
│   │   ├── drugs/              # Drug inventory
│   │   ├── purchases/          # Purchase invoices
│   │   ├── invoices/           # Sales invoices
│   │   ├── suppliers/          # Supplier management
│   │   ├── payments/           # Payment tracking
│   │   ├── reports/            # Reports & analytics
│   │   └── settings/           # Settings
│   ├── layout/                 # Layout components
│   │   └── main-layout/        # Main application layout
│   ├── shared/                 # Shared components
│   │   └── components/         # Reusable UI components
│   │       ├── button/
│   │       ├── badge/
│   │       ├── modal/
│   │       ├── table/
│   │       ├── stat-card/
│   │       ├── alert/
│   │       ├── dropdown/
│   │       └── form-wrapper/
│   ├── app.component.ts        # Root component
│   ├── app.config.ts           # Application configuration
│   └── app.routes.ts           # Route configuration
└── styles.css                  # Global styles
```

## 🎨 Theming

The application supports per-pharmacy theming:

- **Logo**: Custom pharmacy logo
- **Primary Color**: Main brand color
- **Secondary Color**: Accent color
- **Sidebar Color**: Navigation sidebar color
- **RTL Support**: Right-to-left layout for Arabic

Themes are managed through CSS variables and applied via the `ThemeService`.

## 🔐 Authentication

The application supports multiple login methods:
- Email
- Username
- Phone number

All methods require a password. Authentication is currently mocked but can be easily replaced with a real backend API.

## 📊 Complete Feature Documentation

### 1. Authentication & Authorization (`/login`)

**Features:**
- Multiple login methods: Email, Username, or Phone number
- Password-based authentication
- Role-based access control with three user roles:
  - **Account Owner**: Can manage multiple pharmacies, full system access
  - **Pharmacy Manager**: Manages one pharmacy, full pharmacy access
  - **Pharmacy Staff**: Limited access, locked to one pharmacy
- Session management
- Route guards for protected pages

**Routes:**
- `/login` - Login page

---

### 2. Dashboard (`/dashboard`)

**Features:**
- **Key Performance Indicators (KPIs)**:
  - Total Revenue with trend indicators
  - Total Profit tracking
  - Total Cost monitoring
  - Average Order Value
- **Data Visualization**:
  - Revenue charts (bar charts) with time period selection
  - Orders by time (line charts) with weekly/monthly views
- **Recent Orders Table**:
  - Order ID, Medicine names, Prices
  - Order status badges (Paid/Pending)
  - Payment status tracking (Completed/Pending/In progress)
  - Quick action buttons

**Routes:**
- `/dashboard` - Main dashboard (default route)

---

### 3. Patient Management (`/patients`)

**Features:**
- **Full CRUD Operations**:
  - Create new patients
  - View patient list with search and filters
  - View patient details
  - Edit patient information
  - Delete patients
- **Patient Information**:
  - Full name, date of birth, gender
  - Contact information (phone, email)
  - Address details (city, area, street, notes)
  - Occupation tracking
  - Medical notes
  - Card ID with validity dates
- **Patient History**:
  - Invoice history linked to patient
  - Purchase history tracking

**Routes:**
- `/patients` - Patient list
- `/patients/new` - Create new patient
- `/patients/:id` - View patient details
- `/patients/:id/edit` - Edit patient

---

### 4. Drug Inventory Management (`/drugs`)

**Features:**
- **Two-Tier Drug System**:
  - **General Drugs**: Read-only catalog with international barcodes, manufacturer information
  - **Pharmacy Drugs**: Pharmacy-specific inventory with pricing, stock, and expiry tracking
- **Drug Management**:
  - Create pharmacy-specific drug entries
  - Edit drug information (price, stock, expiry)
  - View drug details with full history
  - Search and filter drugs
- **Barcode Support**:
  - International barcode support
  - Internal PLU (Price Look-Up) codes (6-8 digits)
  - Barcode scanning capability
- **Inventory Tracking**:
  - Stock quantity management
  - Minimum stock thresholds
  - Expiry date tracking
  - Status management (active, inactive, out of stock)
- **Cost Management**:
  - Cost layer tracking (FIFO/Average Cost methods)
  - Purchase cost history
  - Profit margin calculation

**Routes:**
- `/drugs` - Drugs list
- `/drugs/new` - Add new pharmacy drug
- `/drugs/:id` - View drug details
- `/drugs/:id/edit` - Edit drug

---

### 5. Inventory Alerts (`/inventory/alerts`)

**Features:**
- **Stock Alerts**:
  - Low stock warnings for drugs below minimum threshold
  - Out of stock notifications
- **Expiry Alerts**:
  - Expiring drugs warnings
  - Expired drugs tracking
- **Alert Management**:
  - View all inventory alerts in one place
  - Filter by alert type
  - Quick actions to purchase more stock

**Routes:**
- `/inventory/alerts` - Inventory alerts dashboard

---

### 6. Purchase Management (`/purchases`)

**Features:**
- **Purchase Invoice Creation**:
  - Create purchase invoices from suppliers
  - Select supplier (manufacturer or warehouse)
  - Add multiple items to purchase
  - Set purchase date and due date
- **Purchase Tracking**:
  - View all purchase invoices
  - Edit purchase invoices
  - View purchase details
  - Track payment status (pending, partial, paid)
- **Inventory Integration**:
  - Automatic stock increase on purchase
  - Cost layer creation for inventory costing
  - FIFO/Average cost calculation
- **Financial Tracking**:
  - Total amount tracking
  - Paid amount recording
  - Remaining amount calculation
  - Payment status management

**Routes:**
- `/purchases` - Purchase invoices list
- `/purchases/new` - Create new purchase invoice
- `/purchases/:id` - View purchase details
- `/purchases/:id/edit` - Edit purchase invoice

---

### 7. Sales Invoicing (`/invoices`)

**Features:**
- **Invoice Creation**:
  - Create sales invoices for patients
  - Select patient/customer
  - Add multiple items to invoice
  - Barcode/PLU scanning for quick item addition
- **Pricing & Discounts**:
  - Unit price management
  - Item-level discounts
  - Subtotal calculation
  - Promo code support
  - Total calculation
- **Bundle Support**:
  - Apply pre-configured bundles/offers
  - Bundle pricing
- **Payment Management**:
  - Payment status tracking (pending, partial, paid)
  - Payment method selection (cash, card, bank transfer)
  - Automatic stock decrease on sale
- **Invoice Management**:
  - View all invoices
  - Edit invoices
  - View invoice details
  - Invoice number generation

**Routes:**
- `/invoices` - Invoices list
- `/invoices/new` - Create new invoice
- `/invoices/:id` - View invoice details
- `/invoices/:id/edit` - Edit invoice

---

### 8. Supplier Management (`/suppliers`)

**Features:**
- **Supplier Types**:
  - Manufacturers
  - Warehouses
- **Supplier Management**:
  - Create new suppliers
  - Edit supplier information
  - View supplier list
  - Supplier status management (active/inactive)
- **Supplier Information**:
  - Name, type (manufacturer/warehouse)
  - Contact information (phone, email)
  - Address
  - Notes and additional information

**Routes:**
- `/suppliers` - Suppliers list
- `/suppliers/new` - Add new supplier
- `/suppliers/:id/edit` - Edit supplier

---

### 9. Payment Tracking (`/payments`)

**Features:**
- **Payment Overview**:
  - View all payments (supplier payments and sales payments)
  - Payment status tracking
  - Payment method tracking
  - Payment history
- **Payment Types**:
  - Supplier payments (from purchase invoices)
  - Sales payments (from sales invoices)
- **Financial Management**:
  - Outstanding payment tracking
  - Payment reconciliation

**Routes:**
- `/payments` - Payments list

---

### 10. Bundle Management (`/bundles`)

**Features:**
- **Bundle Creation**:
  - Create product bundles/offers
  - Set fixed bundle price
  - Add multiple drugs to bundle
  - Set quantities for each bundle item
- **Bundle Management**:
  - View all bundles
  - Edit bundle information
  - Activate/deactivate bundles
  - Bundle status management
- **Bundle Usage**:
  - Apply bundles to sales invoices
  - Automatic price calculation

**Routes:**
- `/bundles` - Bundles list
- `/bundles/new` - Create new bundle
- `/bundles/:id/edit` - Edit bundle

---

### 11. Pharmacy Staff Management (`/pharmacy-staff`)

**Features:**
- **Staff Management**:
  - Create new staff members
  - View staff list
  - View staff details
  - Edit staff information
  - Activate/deactivate staff accounts
- **Staff Information**:
  - Full name, email, phone
  - Username
  - Role assignment (Pharmacy Manager, Pharmacy Staff)
  - Status management (active/inactive)
  - Avatar/profile picture
- **Access Control**:
  - Role-based permissions
  - Pharmacy assignment

**Routes:**
- `/pharmacy-staff` - Staff list
- `/pharmacy-staff/new` - Add new staff member
- `/pharmacy-staff/:id` - View staff details
- `/pharmacy-staff/:id/edit` - Edit staff member

---

### 12. Reports & Support (`/reports`)

**Features:**
- **Support Tickets**:
  - Create support tickets with subject, description, and screen/page reference
  - Upload screenshots for issue reporting
  - View all tickets in a list
  - Ticket status tracking (open, in_progress, resolved, closed)
  - Priority levels (low, medium, high)
  - Real-time messaging with support team
  - Ticket conversation history
- **FAQ (Frequently Asked Questions)**:
  - Common questions and answers
  - Quick links to relevant pages
  - Help documentation for:
    - How to sell products (create invoices)
    - How to add new drugs
    - How to manage inventory alerts
    - How to add patients
    - How to track purchases
    - And more...

**Routes:**
- `/reports` - Reports and support (with Tickets and FAQ tabs)

---

### 13. Settings (`/settings`)

**Features:**
- **Account Information**:
  - Subscription information display
  - Subscription start and end dates
  - Days remaining calculation with visual warnings
  - Account statistics:
    - Total pharmacies count
    - Total staff members count
- **Theme Settings**:
  - **Primary Colors**: Primary background and text colors
  - **Sidebar Colors**: Sidebar background, text, active background, and active text
  - **Card Colors**: Card background and text
  - **Page Colors**: Page background
  - **Status Colors**: Success, warning, and danger colors (color, background, text for each)
  - **Other Colors**: Patient card colors, scrollbar colors
  - Real-time theme preview
  - Reset to default theme
  - Save theme preferences

**Routes:**
- `/settings` - Settings page (with Account Information and Theme Settings tabs)

---

### 14. Multi-Pharmacy Support

**Features:**
- **Pharmacy Context Switching**:
  - Account owners can switch between multiple pharmacies
  - Staff members are locked to their assigned pharmacy
- **Pharmacy-Specific Data**:
  - Each pharmacy has its own:
    - Drug inventory and pricing
    - Staff members
    - Patients
    - Invoices and purchases
    - Suppliers
    - Bundles
    - Theme customization
- **Pharmacy Isolation**:
  - Data separation between pharmacies
  - Independent inventory management
  - Separate financial tracking

---

### 15. Internationalization (i18n)

**Features:**
- **Language Support**:
  - English (en.json)
  - Arabic (ar.json)
- **RTL Support**:
  - Right-to-left layout for Arabic
  - Automatic text direction switching
  - Mirror-flipped UI elements
- **Translation Service**:
  - Centralized translation management
  - Dynamic language switching
  - Translation pipe for templates

---

### 16. Shared Components Library

**Reusable UI Components:**
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger), loading states, full-width option
- **Badge**: Status indicators (success, warning, danger, info, default)
- **Modal**: Dialog/modal component with header, body, footer, confirmation actions
- **Table**: Data table with pagination, sorting, and responsive design
- **StatCard**: KPI/metric cards with icons, labels, values, and trend indicators
- **Alert**: Notification alerts with types (success, warning, danger, info)
- **Dropdown**: Select dropdown component
- **FormWrapper**: Consistent form layout wrapper
- **Chart**: Chart.js integration for data visualization (bar, line, pie charts)
- **Tabs**: Tab navigation component
- **Autocomplete**: Autocomplete input component
- **Loading**: Loading spinner component
- **SVG Icon**: SVG icon component

---

### 17. Barcode Scanning

**Features:**
- **Barcode Scanner Directive**:
  - Barcode scanning support
  - PLU (Price Look-Up) code scanning (6-8 digits)
  - Integration with drug inventory
  - Quick item addition in invoices
- **Barcode Service**:
  - Barcode validation
  - Barcode lookup
  - Integration with drug management

---

### 18. Data Models & Services

**Core Models:**
- Patient, Drug (GeneralDrug, PharmacyDrug), Invoice, PurchaseInvoice
- Supplier, Bundle, PharmacyStaff, Ticket, User
- Common models (pagination, filters, etc.)

**Core Services:**
- Authentication Service
- API Service (base HTTP service)
- Theme Service
- Pharmacy Context Service
- Translation Service
- Feature-specific services (Patients, Drugs, Invoices, Purchases, Suppliers, Payments, Bundles, Pharmacy Staff, Tickets)

## 🔄 Data Strategy

Currently, the application uses mock data services. These can be easily replaced with real API calls:

1. Replace service methods with HTTP calls
2. Update models to match API responses
3. Add interceptors for authentication/error handling
4. Configure API base URL in environment files

## 🌐 RTL Support

The application supports both LTR (English) and RTL (Arabic) layouts:

- Toggle via theme settings
- Automatic text direction switching
- Mirror-flipped UI elements
- Language-specific formatting

## 📝 Environment Configuration

Create environment files for different configurations:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 🧪 Development Commands

```bash
# Development server
npm start

# Build for production
npm run build

# Build with watch mode
npm run watch

# Run tests
npm test

# Lint code
npm run lint
```

## 🚢 Production Build

```bash
npm run build
```

The production build will be output to `dist/pharmly-frontend/`.

## 📦 Dependencies

### Production
- `@angular/*` - Angular framework (v19)
- `rxjs` - Reactive extensions
- `chart.js` - Charting library
- `date-fns` - Date utilities

### Development
- `tailwindcss` - Utility-first CSS
- `typescript` - Type-safe JavaScript
- `@angular/cli` - Angular CLI tools

## 🔧 Configuration Files

- `angular.json` - Angular CLI configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `Dockerfile` - Docker build configuration
- `docker-compose.yml` - Docker Compose configuration
- `nginx.conf` - Nginx server configuration

## 🐛 Troubleshooting

### Build Errors
- Ensure Node.js 20+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Angular cache: `rm -rf .angular`

### Tailwind Not Working
- Verify `tailwind.config.js` includes correct content paths
- Check `postcss.config.js` is present
- Ensure `styles.css` includes Tailwind directives

### Docker Issues
- Ensure Docker is running
- Check port 80 is not in use
- Review Docker logs: `docker-compose logs`

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team/Contributors]

## 📞 Support

For support, please contact [your support email] or create an issue in the repository.

---

**Note**: This is a production-ready frontend application. Backend integration can be added by replacing mock services with HTTP calls to your API.
