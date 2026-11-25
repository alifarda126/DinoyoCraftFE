import axios, { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menyisipkan token pada setiap request
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || Cookies.get("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor untuk menangani error respons dari server, retry otomatis GET transien, & menyertakan requestId
api.interceptors.response.use(
  (response) => {
    const reqId = response.headers?.["x-request-id"];
    if (reqId && response.data && typeof response.data === "object") {
      response.data._requestId = reqId;
    }
    return response;
  },
  async (error) => {
    const reqId = error.response?.headers?.["x-request-id"];
    if (reqId) {
      error.requestId = reqId;
    }

    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const method = (config?.method || "get").toLowerCase();
    const status = error.response?.status;
    const isTransient =
      !error.response ||
      error.code === "ECONNABORTED" ||
      status === 502 ||
      status === 503 ||
      status === 504;

    if (config && method === "get" && !config._retried && isTransient) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 800));
      return api(config);
    }

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        Cookies.remove("token");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
