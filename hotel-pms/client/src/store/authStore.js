import { create } from "zustand";

import axiosClient, { TOKEN_STORAGE_KEY } from "../api/axiosClient.js";
import {
  loginRequest,
  logoutRequest,
  getMeRequest,
} from "../api/auth.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,

  login: async (email, password) => {
    const response = await loginRequest(email, password);
    const { token, user } = response.data;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await logoutRequest();
    } catch {
      /* ignore network/token errors — local state still drops */
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axiosClient.defaults.headers.common.Authorization;
    set({ user: null, token: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  initializeAuth: async () => {
    set({ isInitializing: true });
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      set({ isInitializing: false });
      return;
    }
    try {
      axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      const response = await getMeRequest();
      set({
        user: response.data.user,
        token,
        isAuthenticated: true,
        isInitializing: false,
      });
    } catch {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      delete axiosClient.defaults.headers.common.Authorization;
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitializing: false,
      });
    }
  },

  hasRole: (...roles) => roles.includes(get().user?.role),
}));
