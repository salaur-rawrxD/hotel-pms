import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Clock3,
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
import { Button } from "../ui/button.jsx";
import { Separator } from "../ui/separator.jsx";
import { UserAvatar } from "../ui/avatar.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.jsx";

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

function formatLiveDateTime(d) {
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${weekday} · ${time}`;
}

const NOTIFICATION_COUNT = 3;

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const title = titleFromPath(location.pathname);

  return (
    <header className="topbar">
      <h1 className="topbar-title truncate">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
          <Clock3 className="h-3.5 w-3.5" />
          {formatLiveDateTime(now)}
        </span>

        <Separator orientation="vertical" className="hidden h-6 md:block" />

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {NOTIFICATION_COUNT > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
              {NOTIFICATION_COUNT}
            </span>
          )}
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 pl-1.5 pr-2 h-9">
              <UserAvatar name={user?.name} size="sm" />
              <span className="hidden text-sm font-medium text-foreground md:inline">
                {user?.name ?? "Unknown"}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span>{user?.name ?? "Unknown"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user?.email ?? ""}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/guests")}>
              <UserIcon /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => logout()}
            >
              <LogOut /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
