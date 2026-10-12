export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}
