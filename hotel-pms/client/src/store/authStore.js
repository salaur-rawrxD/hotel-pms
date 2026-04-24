import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setSession: ({ user, token }) => set({ user, token }),
      updateUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => {
        const { token } = useAuthStore.getState();
        return Boolean(token);
      },
      hasRole: (roles) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        if (!roles || roles.length === 0) return true;
        return roles.includes(user.role);
      },
    }),
    {
      name: "hotel-pms-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
