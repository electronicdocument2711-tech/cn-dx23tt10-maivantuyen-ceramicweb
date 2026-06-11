// Common TypeScript types used across the application

export interface User {
  id: string;
  name: string;
  Name: string;
  email: string;
  Email: string;
  avatar?: string;
  Avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  org_work_profiles: any;
  UserId: string;
  user_info?: { id: string; name: string };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  color?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type Theme = "light" | "dark";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";
