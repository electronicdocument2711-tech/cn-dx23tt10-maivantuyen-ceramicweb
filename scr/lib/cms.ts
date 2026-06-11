import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  toFormData,
} from "axios";
import { get } from "./cookie";
import { COOKIE_KEY } from "@/const/global";
import { headers } from "next/headers";

const baseURL = process.env.CMS_URL || "https://dentalx-api.growthbold.co";

// Sets a 2-second timeout for all
// axios.defaults.timeout = 2000;

// change 2->5s because some request take more than 2s
axios.defaults.timeout = 5000;

const getAuthorization = async (): Promise<string | null> => {
  try {
    // step 1: get token from cookie

    const tokenFromCookie = await get(COOKIE_KEY.ACCESS_TOKEN);
    if (tokenFromCookie) return "Bearer " + tokenFromCookie;

    const tokenFormHeder = (await headers()).get("Authorization");

    if (tokenFormHeder) {
      return tokenFormHeder;
    }

    return null;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
};

export const cms = axios.create({ baseURL }) as RestInstance;

cms.interceptors.request.use(async (config) => {
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

cms.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    //     const status = error.response?.status;
    //     const isExpired = status === 401;
    //     if (isExpired) {
    //       // remove("access_token");
    //       const cookiess = await cookies()
    //       cookiess.delete('access_token');

    //       if (typeof window !== "undefined") {
    //         window.location.replace("/auth/signin")
    //       };
    //     }
    return Promise.resolve(error);
  }
);

interface RestInstance extends AxiosInstance {
  request<T = any>(_config: AxiosRequestConfig): Promise<T>;
  get<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig
  ): Promise<T>;
  patch<T = any>(
    _url: string,
    _data?: any,
    _config?: AxiosRequestConfig
  ): Promise<T>;
}
