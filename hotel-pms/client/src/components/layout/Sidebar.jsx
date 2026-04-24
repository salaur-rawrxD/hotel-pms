import { useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import {
  BarChart3,
  CalendarDays,
  ConciergeBell,
  Globe2,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";

const NAV_ITEMS = [
  { to: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "FRONT_DESK", "HOUSEKEEPING"] },
  { to: "/reservations", label: "Reservations",  icon: CalendarDays,    roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
  { to: "/front-desk",   label: "Front Desk",    icon: ConciergeBell,   roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
  { to: "/housekeeping", label: "Housekeeping",  icon: Sparkles,        roles: ["ADMIN", "MANAGER", "HOUSEKEEPING"] },
  { to: "/rates",        label: "Rates & Yield", icon: Wallet,          roles: ["ADMIN", "MANAGER"] },
  { to: "/channels",     label: "Channels",      icon: Globe2,          roles: ["ADMIN", "MANAGER"] },
  { to: "/reports",      label: "Reports",       icon: BarChart3,       roles: ["ADMIN", "MANAGER"] },
  { to: "/guests",       label: "Guests",        icon: Users,           roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
  { to: "/settings",     label: "Settings",      icon: SettingsIcon,    roles: ["ADMIN"] },
];

const ROLE_BADGE = {
  ADMIN:        { label: "Admin",        className: "bg-gold text-navy-900" },
  MANAGER:      { label: "Manager",      className: "bg-teal text-white" },
  FRONT_DESK:   { label: "Front Desk",   className: "bg-blue-500 text-white" },
  HOUSEKEEPING: { label: "Housekeeping", className: "bg-purple-500 text-white" },
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const logout = useAuthStore((s) => s.logout);

  const [confirmingSignOut, setConfirmingSignOut] = useState(false);

  const items = NAV_ITEMS.filter((item) => hasRole(...item.roles));
  const propertyName = user?.property?.name ?? "The Meridian";
  const badge = ROLE_BADGE[user?.role] ?? { label: user?.role ?? "—", className: "bg-slate-600 text-white" };

  return (
    <aside className="sidebar flex h-screen w-64 shrink-0 flex-col border-r border-navy-700 bg-navy-900 text-slate-100">
      {/* Brand */}
      <div className="flex flex-col gap-1 border-b border-navy-700 px-6 py-5">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-xl font-black tracking-tight text-white">
            FairCloud
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            PMS
          </span>
        </div>
        <p className="truncate font-serif text-xs font-semibold text-gold">
          {propertyName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4 scrollbar-thin">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal/15 text-teal-light"
                  : "text-white/70 hover:bg-navy-800 hover:text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-teal-light"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Night Audit + user + sign-out */}
      <div className="space-y-3 border-t border-navy-700 px-4 py-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-navy-900 shadow-sm transition-colors hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-navy-900"
        >
          <Moon className="h-4 w-4" />
          Night Audit
        </button>

        <div className="h-px bg-navy-700" />

        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white">
            {getInitials(user?.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name ?? "Unknown"}
            </p>
            <span
              className={clsx(
                "mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {!confirmingSignOut ? (
          <button
            type="button"
            onClick={() => setConfirmingSignOut(true)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-navy-700 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-navy-800 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        ) : (
          <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2">
            <p className="mb-2 text-center text-[11px] font-medium text-rose-200">
              Confirm sign out?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => logout()}
                className="flex-1 rounded-md bg-rose-500 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-rose-400"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingSignOut(false)}
                className="flex-1 rounded-md border border-navy-700 px-2 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-navy-800"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
