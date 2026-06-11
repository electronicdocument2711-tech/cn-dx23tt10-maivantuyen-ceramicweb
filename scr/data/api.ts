// API configuration and functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}

class Api {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return {
        data: {} as T,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }
}

const api = new Api(API_BASE_URL);
export default api;
