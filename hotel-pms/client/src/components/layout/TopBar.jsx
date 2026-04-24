import { useEffect, useState } from "react";
import { Menu, LogOut, Search, Bell } from "lucide-react";
import { Menu as HeadlessMenu } from "@headlessui/react";
import clsx from "clsx";

import Avatar from "../ui/Avatar.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../store/uiStore.js";
import { USER_ROLE_LABELS } from "../../constants/userRoles.js";
import { formatDateTime } from "../../utils/formatDate.js";

const PROPERTY_NAME = "The Meridian Hotel";

export default function TopBar() {
  const { user, logout } = useAuth();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-navy-700 bg-navy-900/80 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-md p-2 text-slate-300 hover:bg-navy-800 hover:text-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search reservations, guests, rooms…"
            className="h-9 w-80 rounded-md border border-navy-700 bg-navy-800/60 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-teal-light focus:outline-none focus:ring-1 focus:ring-teal-light"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden flex-col items-end leading-tight lg:flex">
          <span className="font-serif text-sm font-semibold text-slate-100">
            {PROPERTY_NAME}
          </span>
          <span className="text-[11px] text-slate-400">
            {formatDateTime(now, "EEE, MMM d · h:mm a")}
          </span>
        </div>
        <button
          type="button"
          className="relative rounded-md p-2 text-slate-300 hover:bg-navy-800 hover:text-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>

        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-navy-800">
            <Avatar name={user?.name} size="sm" />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-100">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-xs text-slate-500">
                {USER_ROLE_LABELS[user?.role] ?? "—"}
              </p>
            </div>
          </HeadlessMenu.Button>
          <HeadlessMenu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md border border-navy-700 bg-navy-800 p-1 shadow-xl focus:outline-none">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => logout()}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-navy-700 text-slate-100"
                      : "text-slate-300",
                  )}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </HeadlessMenu.Item>
          </HeadlessMenu.Items>
        </HeadlessMenu>
      </div>
    </header>
  );
}
