import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ConciergeBell,
  Globe2,
  LayoutDashboard,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
import { useUiStore } from "../../store/uiStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FRONT_DESK],
  },
  {
    to: "/reservations",
    label: "Reservations",
    icon: CalendarDays,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FRONT_DESK],
  },
  {
    to: "/front-desk",
    label: "Front Desk",
    icon: ConciergeBell,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FRONT_DESK],
  },
  {
    to: "/housekeeping",
    label: "Housekeeping",
    icon: Sparkles,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.HOUSEKEEPING],
  },
  {
    to: "/rates",
    label: "Rates & Yield",
    icon: Wallet,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    to: "/channels",
    label: "Channels",
    icon: Globe2,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    to: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
  {
    to: "/guests",
    label: "Guests",
    icon: Users,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.FRONT_DESK],
  },
  {
    to: "/settings",
    label: "Settings",
    icon: SettingsIcon,
    roles: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  const items = NAV_ITEMS.filter(
    (item) => !user?.role || item.roles.includes(user.role),
  );

  return (
    <aside
      className={clsx(
        "flex h-screen shrink-0 flex-col border-r border-navy-700 bg-navy-900/95 transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={clsx(
          "flex h-16 items-center gap-3 border-b border-navy-700 px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gold text-navy-900 font-serif text-base font-black">
          M
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-serif text-sm font-bold tracking-wide text-slate-100">
              The Meridian
            </p>
            <p className="truncate text-[11px] uppercase tracking-widest text-slate-500">
              Hotel PMS
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 scrollbar-thin">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-teal/20 text-teal-light"
                  : "text-slate-300 hover:bg-navy-800 hover:text-slate-100",
                collapsed && "justify-center px-2",
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-navy-700 px-4 py-3 text-[11px] text-slate-500">
          v0.1.0 · Pre-release
        </div>
      )}
    </aside>
  );
}
