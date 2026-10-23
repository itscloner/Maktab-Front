import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { AUTH_EXPIRED_EVENT, tokenStore } from "@/lib/tokenStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
  // آرایه‌ها به‌صورت key=1&key=2 ارسال می‌شوند (فرمت متداول ASP.NET)
  paramsSerializer: { indexes: null },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const isLogin = (error.config?.url ?? "").toLowerCase().includes("user/login");
      if (!isLogin) window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);

export default api;
