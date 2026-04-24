import axios from "axios";

export const TOKEN_STORAGE_KEY = "pms_token";

/** Deployed API (fairbridge-pms-server). Override with VITE_API_BASE_URL when needed. */
const PRODUCTION_API_BASE =
  "https://fairbridge-pms-server.vercel.app/api";

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  (import.meta.env.PROD ? PRODUCTION_API_BASE : "http://localhost:3001/api");

const axiosClient = axios.create({
  baseURL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete axiosClient.defaults.headers.common.Authorization;
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
    }

    const data = error?.response?.data;
    const fromBody =
      typeof data === "string"
        ? data
        : data?.message ?? data?.error ?? data?.errors?.[0];
    const message =
      fromBody ??
      (error?.code === "ERR_NETWORK" || error?.message === "Network Error"
        ? "Network error — check CORS, API URL, and that the server is up."
        : null) ??
      error?.message ??
      (status != null ? `Request failed (${status})` : "Something went wrong");
    const normalized = new Error(message);
    normalized.status = status;
    normalized.response = error?.response;
    normalized.original = error;
    return Promise.reject(normalized);
  },
);

export default axiosClient;
