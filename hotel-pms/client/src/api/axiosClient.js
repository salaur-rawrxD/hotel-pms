import axios from "axios";

export const TOKEN_STORAGE_KEY = "pms_token";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

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

    const message =
      error?.response?.data?.message ?? "Something went wrong";
    const normalized = new Error(message);
    normalized.status = status;
    normalized.response = error?.response;
    normalized.original = error;
    return Promise.reject(normalized);
  },
);

export default axiosClient;
