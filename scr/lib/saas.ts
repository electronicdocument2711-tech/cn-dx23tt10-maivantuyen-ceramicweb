import axios, { AxiosInstance, AxiosRequestConfig, toFormData } from "axios";

import { get } from "./cookie";
import { COOKIE_KEY } from "@/const/global";
import { headers } from "next/headers";

const baseURL = process.env.SAAS_URL || "https://dentalx-saas.growthbold.co";

const getAuthorization = async (): Promise<string | null> => {
  try {
    const tokenFromCookie = await get(COOKIE_KEY.ACCESS_TOKEN);
    if (tokenFromCookie) return "Bearer " + tokenFromCookie;

    const tokenFormHeder = (await headers()).get("Authorization");

    if (tokenFormHeder) {
      return tokenFormHeder;
    }

    return null;
  } catch {
    return null;
  }
};

export const saas = axios.create({ baseURL }) as RestInstance;

saas.interceptors.request.use(async (config) => {
  const Authorization = await getAuthorization();

  if (config?.headers)
    if (Authorization !== null && !config.headers?.Authorization)
      config.headers.Authorization = Authorization;

  if (
    config.data &&
    !(config.data instanceof FormData) &&
    config.headers?.["Content-Type"] === "multipart/form-data"
  ) {
    config.data = toFormData(config.data);
  }
  return config;
});

saas.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(
      error?.response?.data?.error ? error?.response?.data?.error : error,
    );
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
