/**
 * Generic API Response
 * Represents the standard response format from the API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Paginated List Response
 * Used for endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/**
 * Pagination Parameters
 * Common parameters for list endpoints
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Sort Parameters
 * Common parameters for sorting results
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
