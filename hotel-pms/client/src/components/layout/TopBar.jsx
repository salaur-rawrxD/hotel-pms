import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";

const ROUTE_TITLES = {
  "/dashboard":    "Dashboard",
  "/reservations": "Reservations",
  "/front-desk":   "Front Desk",
  "/housekeeping": "Housekeeping",
  "/rates":        "Rates & Yield",
  "/channels":     "Channels",
  "/reports":      "Reports",
  "/guests":       "Guests",
  "/settings":     "Settings",
};

function titleFromPath(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const [, first] = pathname.split("/");
  if (!first) return "Dashboard";
  const pretty = first.replace(/-/g, " ");
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function buildCrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return [];
  return parts.map((p, i) => ({
    label: p.replace(/-/g, " "),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

function formatLiveDateTime(d) {
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const monthDay = d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${weekday}, ${monthDay} · ${time}`;
}

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

const NOTIFICATION_COUNT = 3;

export default function TopBar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const title = titleFromPath(location.pathname);
  const crumbs = buildCrumbs(location.pathname);

  return (
    <header className="topbar flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        <h1 className="truncate font-serif text-xl font-semibold text-navy-900">
          {title}
        </h1>
        {crumbs.length > 1 && (
          <p className="mt-0.5 truncate text-[11px] capitalize text-slate-500">
            {crumbs.map((c) => c.label).join(" / ")}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-xs font-medium text-slate-500 md:inline">
          {formatLiveDateTime(now)}
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Bell className="h-4 w-4" />
          {NOTIFICATION_COUNT > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-navy-900">
              {NOTIFICATION_COUNT}
            </span>
          )}
        </button>

        <span
          className="grid h-9 w-9 place-items-center rounded-full bg-teal text-xs font-semibold text-white"
          title={user?.name ?? ""}
        >
          {getInitials(user?.name)}
        </span>
      </div>
    </header>
  );
}
