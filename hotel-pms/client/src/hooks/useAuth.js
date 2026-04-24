import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { authApi } from "../api/auth.js";
import { useAuthStore } from "../store/authStore.js";

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, setSession, logout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({ user: data.user, token: data.token });
      toast.success(`Welcome back, ${data.user?.name ?? "there"}.`);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ?? "Invalid email or password.";
      toast.error(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout();
      navigate("/login", { replace: true });
    },
  });

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
  };
}
