export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface SelectOption {
  label: string;
  value: number;
}
