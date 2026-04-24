import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:   "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline:     "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// ── Brand-specific badge helpers ─────────────────────────

const CHANNEL_MAP = {
  BOOKING:   ["channel-booking",   "Booking.com"],
  EXPEDIA:   ["channel-expedia",   "Expedia"],
  DIRECT:    ["channel-direct",    "Direct"],
  AIRBNB:    ["channel-airbnb",    "Airbnb"],
  CORPORATE: ["channel-corporate", "Corporate"],
  WALKIN:    ["channel-walkin",    "Walk-in"],
};

function ChannelBadge({ source, className }) {
  const [cls, label] = CHANNEL_MAP[source] ?? ["channel-walkin", source ?? "—"];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

const ROLE_MAP = {
  ADMIN:        ["bg-gold/20 text-amber-800 border border-gold/30", "Admin"],
  MANAGER:      ["bg-teal/10 text-teal border border-teal/20",      "Manager"],
  FRONT_DESK:   ["bg-blue-50 text-blue-700 border border-blue-100", "Front Desk"],
  HOUSEKEEPING: ["bg-purple-50 text-purple-700 border border-purple-100", "Housekeeping"],
};

function RoleBadge({ role, className }) {
  const [cls, label] = ROLE_MAP[role] ?? ["bg-slate-100 text-slate-600", role ?? "—"];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

const STATUS_MAP = {
  CONFIRMED:   ["status-confirmed",   "Confirmed"],
  CHECKED_IN:  ["status-checked-in",  "Checked In"],
  CHECKED_OUT: ["status-checked-out", "Checked Out"],
  CANCELLED:   ["status-cancelled",   "Cancelled"],
  NO_SHOW:     ["status-no-show",     "No Show"],
};

function StatusBadge({ status, className }) {
  const [cls, label] = STATUS_MAP[status] ?? ["bg-slate-100 text-slate-600", status ?? "—"];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

const TASK_MAP = {
  PENDING:     ["task-pending",     "Pending"],
  IN_PROGRESS: ["task-in-progress", "In Progress"],
  INSPECTED:   ["task-inspected",   "Inspected"],
  DONE:        ["task-done",        "Done"],
};

function TaskStatusBadge({ status, className }) {
  const [cls, label] = TASK_MAP[status] ?? ["task-pending", status ?? "—"];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
        cls,
        className,
      )}
    >
      {label}
    </span>
  );
}

export { Badge, badgeVariants, ChannelBadge, RoleBadge, StatusBadge, TaskStatusBadge };
