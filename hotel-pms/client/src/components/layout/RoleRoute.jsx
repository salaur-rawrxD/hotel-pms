import { Outlet } from "react-router-dom";

import { useAuthStore } from "../../store/authStore.js";
import Unauthorized from "../../pages/Unauthorized.jsx";

export default function RoleRoute({ allowedRoles = [] }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return <Outlet />;
}
