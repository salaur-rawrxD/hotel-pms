import axios from "axios";
import toast from "react-hot-toast";

import { useAuthStore } from "../store/authStore.js";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

const axiosClient = axios.create({
  baseURL,
  timeout: 15_000,
});

axiosClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ??
      error?.response?.data?.error ??
      error?.message ??
      "Request failed";

    if (status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    } else if (status >= 500) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
