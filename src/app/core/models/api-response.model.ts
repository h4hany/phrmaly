/**
 * API Response Models
 * 
 * Standard response format from .NET backend
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  field?: string;
  message: string;
}

export interface ApiMeta {
  pagination?: PaginationMeta;
  traceId?: string;
  timestamp?: string;
  version?: string;
  durationMs?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated API Response
 * Convenience type for list endpoints with pagination
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    pagination: PaginationMeta;
  };
}

