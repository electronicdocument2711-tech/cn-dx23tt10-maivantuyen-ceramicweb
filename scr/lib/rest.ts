import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { get } from "./cookie";

const baseURL =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api`
    : "/api";

const rest = axios.create({ baseURL, withCredentials: true }) as RestInstance;
rest.interceptors.request.use(async (config) => {
  const token = await get("access_token");

  if (config?.headers) {
    if (token && !config.headers?.Authorization)
      config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

rest.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    return Promise.reject(error);
  },
);

interface RestInstance extends AxiosInstance {
  request<T = any>(_config: AxiosRequestConfig): Promise<T>;
  get<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig,
  ): Promise<T>;
  put<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig,
  ): Promise<T>;
  patch<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig,
  ): Promise<T>;
}

export default rest;
