import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ConciergeBell,
  LayoutDashboard,
  LogOut,
  Moon,
  Radio,
  Settings as SettingsIcon,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { cn } from "../../lib/utils.js";
import { useAuthStore } from "../../store/authStore.js";
import {
  getInspectionQueue,
  getMaintenanceRequests,
} from "../../api/housekeeping.js";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog.jsx";
import { Separator } from "../ui/separator.jsx";
import { RoleBadge } from "../ui/badge.jsx";
import { UserAvatar } from "../ui/avatar.jsx";

const OPERATIONS_NAV = [
  { to: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "FRONT_DESK", "HOUSEKEEPING"] },
  { to: "/reservations", label: "Reservations",  icon: CalendarDays,    roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
  { to: "/front-desk",   label: "Front Desk",    icon: ConciergeBell,   roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
  { to: "/housekeeping", label: "Housekeeping",  icon: Sparkles,        roles: ["ADMIN", "MANAGER", "HOUSEKEEPING"] },
  { to: "/rates",        label: "Rates & Yield", icon: TrendingUp,      roles: ["ADMIN", "MANAGER"] },
  { to: "/channels",     label: "Channels",      icon: Radio,           roles: ["ADMIN", "MANAGER"] },
  { to: "/reports",      label: "Reports",       icon: BarChart3,       roles: ["ADMIN", "MANAGER"] },
  { to: "/guests",       label: "Guests",        icon: Users,           roles: ["ADMIN", "MANAGER", "FRONT_DESK"] },
];

const ADMIN_NAV = [
  { to: "/settings", label: "Settings", icon: SettingsIcon, roles: ["ADMIN"] },
];

function SidebarBadge({ count, tone = "blue" }) {
  if (!count) return null;
  const toneClass =
    tone === "rose"
      ? "bg-rose-500 text-white"
      : tone === "amber"
      ? "bg-amber-500 text-white"
      : "bg-blue-500 text-white";
  return (
    <span
      className={cn(
        "ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
        toneClass,
      )}
    >
      {count}
    </span>
  );
}

function SidebarNavItem({ item, badge, badgeTone }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn("sidebar-item", isActive && "active")
      }
    >
      <Icon className="sidebar-icon" />
      <span className="truncate">{item.label}</span>
      <SidebarBadge count={badge} tone={badgeTone} />
    </NavLink>
  );
}

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const logout = useAuthStore((s) => s.logout);

  // Lightweight live counters for the housekeeping nav badge.
  // Only fetched for roles that can access housekeeping.
  const canSeeHousekeeping = hasRole("ADMIN", "MANAGER", "HOUSEKEEPING");
  const inspection = useQuery({
    queryKey: ["housekeeping", "inspection-queue"],
    queryFn: () => getInspectionQueue().then((r) => r.data),
    enabled: canSeeHousekeeping,
    refetchInterval: 60_000,
  });
  const maintenance = useQuery({
    queryKey: ["housekeeping", "maintenance"],
    queryFn: () => getMaintenanceRequests().then((r) => r.data),
    enabled: canSeeHousekeeping,
    refetchInterval: 60_000,
  });

  const hkBadge =
    (inspection.data?.length ?? 0) +
    (maintenance.data ?? []).filter(
      (m) => m.status !== "RESOLVED" && m.status !== "CLOSED",
    ).length;

  const ops = OPERATIONS_NAV.filter((i) => hasRole(...i.roles));
  const admin = ADMIN_NAV.filter((i) => hasRole(...i.roles));

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ background: "hsl(var(--gold) / 0.15)" }}
        >
          <Building2 className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="sidebar-logo-text">
            Fair<span>bridge</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">
            PMS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <p className="sidebar-section-label">Operations</p>
        <div className="space-y-0.5">
          {ops.map((item) => (
            <SidebarNavItem
              key={item.to}
              item={item}
              badge={item.to === "/housekeeping" ? hkBadge : 0}
              badgeTone="amber"
            />
          ))}
        </div>

        {admin.length > 0 && (
          <>
            <p className="sidebar-section-label mt-4">Admin</p>
            <div className="space-y-0.5">
              {admin.map((item) => (
                <SidebarNavItem key={item.to} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button type="button" className="night-audit-btn">
          <Moon className="h-4 w-4" />
          Night Audit
        </button>

        <Separator style={{ background: "hsl(var(--sidebar-border))" }} />

        <div className="flex items-center gap-3">
          <UserAvatar name={user?.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.name ?? "Unknown"}
            </p>
            <div className="mt-0.5">
              <RoleBadge role={user?.role} />
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out of Fairbridge PMS?</AlertDialogTitle>
                <AlertDialogDescription>
                  You&apos;ll need to sign in again to access the dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => logout()}>
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </aside>
  );
}
