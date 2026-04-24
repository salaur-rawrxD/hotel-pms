import { useAuthStore } from "../store/authStore.js";

/**
 * Small convenience hook that exposes the most common auth state + actions
 * from the Zustand store for components that prefer a hook API.
 *
 * The store is still the source of truth; components can import it directly
 * when they need finer control.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const hasRole = useAuthStore((s) => s.hasRole);

  return {
    user,
    token,
    isAuthenticated,
    isInitializing,
    login,
    logout,
    initializeAuth,
    hasRole,
  };
}
