export interface ResponseI<T = any> {
  Status: boolean;
  Message: string;
  ResultOnDb: T;
  MethodOnDb: string;
  TotalCountOnDb: number;
}

export interface PaginatedResponseI<T = any> extends ResponseI<T[]> {
  Page: number;
  PageSize: number;
  TotalPages: number;
}
