import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";

export default function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-900 text-slate-200">
        <Loader2 className="h-8 w-8 animate-spin text-teal-light" />
        <p className="text-sm font-medium text-slate-300">
          Loading your workspace…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
