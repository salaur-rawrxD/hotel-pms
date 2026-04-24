import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import RoleRoute from "./components/layout/RoleRoute.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reservations from "./pages/Reservations.jsx";
import FrontDesk from "./pages/FrontDesk.jsx";
import Housekeeping from "./pages/Housekeeping.jsx";
import RatesYield from "./pages/RatesYield.jsx";
import Channels from "./pages/Channels.jsx";
import Reports from "./pages/Reports.jsx";
import Guests from "./pages/Guests.jsx";
import Settings from "./pages/Settings.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import NotFound from "./pages/NotFound.jsx";

import { useAuthStore } from "./store/authStore.js";

export default function App() {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route
            element={
              <RoleRoute
                allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}
              />
            }
          >
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/front-desk" element={<FrontDesk />} />
            <Route path="/guests" element={<Guests />} />
          </Route>

          <Route
            element={
              <RoleRoute
                allowedRoles={["ADMIN", "MANAGER", "HOUSEKEEPING"]}
              />
            }
          >
            <Route path="/housekeeping" element={<Housekeeping />} />
          </Route>

          <Route
            element={<RoleRoute allowedRoles={["ADMIN", "MANAGER"]} />}
          >
            <Route path="/rates" element={<RatesYield />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
