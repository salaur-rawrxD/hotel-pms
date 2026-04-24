import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AppShell from "./components/layout/AppShell.jsx";

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
import NotFound from "./pages/NotFound.jsx";

import { USER_ROLES } from "./constants/userRoles.js";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.FRONT_DESK,
              ]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.FRONT_DESK,
              ]}
            >
              <Reservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/front-desk"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.FRONT_DESK,
              ]}
            >
              <FrontDesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/housekeeping"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.HOUSEKEEPING,
              ]}
            >
              <Housekeeping />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rates"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}
            >
              <RatesYield />
            </ProtectedRoute>
          }
        />
        <Route
          path="/channels"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}
            >
              <Channels />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}
            >
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guests"
          element={
            <ProtectedRoute
              allowedRoles={[
                USER_ROLES.ADMIN,
                USER_ROLES.MANAGER,
                USER_ROLES.FRONT_DESK,
              ]}
            >
              <Guests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute
              allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]}
            >
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
