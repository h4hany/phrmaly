# Common Requirements - Backend Requirements

## Overview
Common requirements that apply across all modules: pagination, file uploads, barcode scanning, real-time updates, search, filtering, and other shared functionality.

---

## Features

### 1. Pagination
- Standard pagination across all list endpoints
- Configurable page size
- Sorting support
- Total count and page information

### 2. File Uploads
- Image uploads (logos, avatars, drug images)
- Document uploads (invoices, prescriptions, attachments)
- File validation (type, size)
- File storage and retrieval
- File preview support

### 3. Barcode Scanning
- Barcode lookup endpoints
- Internal barcode (PLU) support
- International barcode (EAN/UPC) support
- Fast barcode search

### 4. Search & Filtering
- Full-text search
- Advanced filtering
- Multi-field search
- Search result ranking

### 5. Real-time Updates
- WebSocket/SSE support (implied for alerts)
- Real-time notifications
- Live data updates

### 6. Internationalization (i18n)
- Multi-language support (English, Arabic)
- RTL support
- Locale-specific formatting

### 7. Error Handling
- Standardized error responses
- Error codes and messages
- Validation error details

### 8. Authentication & Authorization
- JWT token authentication
- Role-based access control
- Permission checking
- Token refresh

---

## API Contracts

### File Upload Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/upload/image` | Upload image | User | `FormData` (file) | `{ url: string, thumbnailUrl?: string }` |
| POST | `/api/upload/document` | Upload document | User | `FormData` (file) | `{ url: string, filename: string, size: number }` |
| DELETE | `/api/upload/:fileId` | Delete file | User | - | `{ success: boolean }` |
| GET | `/api/upload/:fileId` | Get file | User | - | File stream |

### Barcode Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| GET | `/api/barcode/:barcode` | Lookup barcode | User | - | `{ drugId?: string, drug?: PharmacyDrug, found: boolean }` |
| POST | `/api/barcode/validate` | Validate barcode format | User | `{ barcode: string, type: 'internal'\|'international' }` | `{ valid: boolean, format?: string }` |

### Search Endpoints

| Method | Endpoint | Description | Auth | Request Body | Response |
|--------|----------|-------------|------|--------------|----------|
| POST | `/api/search` | Global search | User | `{ query: string, types?: string[], limit?: number }` | `SearchResults` |

---

## Data Models

### PaginationParams
```typescript
interface PaginationParams {
  page: number; // Default: 1
  pageSize: number; // Default: 10
  sortBy?: string; // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Default: 'asc'
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### ApiResponse
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

### SearchResults
```typescript
interface SearchResults {
  query: string;
  results: Array<{
    type: string; // 'drug', 'patient', 'invoice', etc.
    id: string;
    title: string;
    description?: string;
    score: number; // Relevance score
  }>;
  total: number;
}
```

---

## Query Parameters

### Standard Pagination
- `page`: number (default: 1, min: 1)
- `pageSize`: number (default: 10, min: 1, max: 100)
- `sortBy`: string (field name)
- `sortOrder`: 'asc' | 'desc' (default: 'asc')

### Standard Filters
- `search`: string (full-text search)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `status`: string (status filter)
- `pharmacyId`: string (pharmacy filter, from context if not provided)

---

## Business Rules

### Pagination
- Default page size: 10
- Maximum page size: 100
- Page numbers start at 1
- Total pages = ceil(total / pageSize)

### File Uploads
- Maximum file size: 10MB for images, 50MB for documents
- Allowed image types: jpg, jpeg, png, gif, webp
- Allowed document types: pdf, doc, docx, xls, xlsx, csv
- Files stored in cloud storage (S3, Azure Blob, etc.)
- File URLs should be signed/expiring for security

### Barcode Scanning
- Internal barcode (PLU): 6-8 digits, numeric
- International barcode (EAN/UPC): 8, 12, or 13 digits
- Barcode lookup should be fast (< 100ms)
- Barcode must be indexed in database

### Search
- Full-text search across relevant fields
- Search should be case-insensitive
- Search results ranked by relevance
- Search supports partial matches

### Real-time Updates
- WebSocket connection for live updates
- Subscribe to specific channels (pharmacy, user, etc.)
- Push notifications for alerts
- Real-time stock updates

---

## Technical Requirements

### File Storage
- Cloud storage recommended (AWS S3, Azure Blob, Google Cloud Storage)
- CDN for file delivery
- Image optimization/thumbnails
- File access control (signed URLs)

### Caching
- Redis/Memcached for frequently accessed data
- Cache invalidation strategy
- Cache TTL configuration

### Database
- Indexed fields for fast queries:
  - Barcodes (unique index)
  - Search fields (full-text index)
  - Foreign keys
  - Date fields (for filtering)

### Performance
- API response time < 200ms for most endpoints
- Pagination limits to prevent large queries
- Database query optimization
- Connection pooling

### Security
- Input validation and sanitization
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting
- File upload validation

---

## Missing/Unclear Requirements

1. **WebSocket Implementation**: No explicit WebSocket endpoints defined
2. **Push Notifications**: No push notification service integration
3. **Email Service**: No email service integration details
4. **SMS Service**: No SMS service integration details
5. **PDF Generation**: No PDF generation library/service
6. **Excel Export**: No Excel generation library/service
7. **Image Processing**: No image processing library (resize, crop, etc.)
8. **CDN Configuration**: No CDN configuration details
9. **Cache Strategy**: No explicit caching strategy
10. **Rate Limiting**: No rate limiting configuration
11. **API Versioning**: No API versioning strategy
12. **Request Logging**: No request logging requirements
13. **Monitoring**: No monitoring/alerting requirements
14. **Backup Strategy**: No backup requirements

---

## Notes

- All endpoints should follow RESTful conventions
- All dates should be in ISO 8601 format
- All monetary values should be in smallest currency unit (cents) or decimal
- All responses should include appropriate HTTP status codes
- Error responses should be consistent across all endpoints
- File uploads should support progress tracking (for large files)
- Barcode scanning is client-side, but backend must support fast lookup
- Search should support multiple languages (English, Arabic)

---

## Standard Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Standard Success Responses

### 200 OK (Single Resource)
```json
{
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### 200 OK (List)
```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

### 201 Created
```json
{
  "data": { ... },
  "message": "Resource created successfully"
}
```

### 204 No Content
(Empty response body for DELETE operations)

