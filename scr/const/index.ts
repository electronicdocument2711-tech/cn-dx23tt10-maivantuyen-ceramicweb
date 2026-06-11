// Application constants
// Export all constants here for easy imports

export const API_ENDPOINTS = {
  USERS: "/users",
  AUTH: "/auth",
  POSTS: "/posts",
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;

export const STORAGE_KEYS = {
  THEME: "theme",
  USER: "user",
  TOKEN: "auth_token",
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
} as const;

export const PRODUCT_NAME_MAPPING = {
  Free: "SINH VIÊN",
  Starter: "TIÊU CHUẨN",
  Growth: "CHUYÊN NGHIỆP",
  Chain: "CHUỖI NHA KHOA",
} as const;
