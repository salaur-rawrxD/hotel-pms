import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "HOUSEKEEPING" ? "/housekeeping" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
