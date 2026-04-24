import { AlertTriangle, BedDouble, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { cn } from "../../lib/utils.js";
import { ChannelBadge } from "../ui/badge.jsx";
import { UserAvatar } from "../ui/avatar.jsx";
import { Button } from "../ui/button.jsx";

function PaymentBadge({ depositPaid }) {
  const paid = Number(depositPaid) > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold",
        paid
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-red-50 text-red-700 border-red-200",
      )}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

function ReservationRow({ record, variant }) {
  const {
    guestName,
    roomNumber,
    roomTypeName,
    nights,
    source,
    specialRequests,
    depositPaid,
  } = record;
  const isDeparture = variant === "departure";

  return (
    <div className="flex items-start gap-3 rounded-md border border-border/60 bg-card px-3 py-2.5 transition hover:border-border hover:shadow-sm">
      <UserAvatar name={guestName} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {guestName}
          </p>
          <ChannelBadge source={source} />
          <PaymentBadge depositPaid={depositPaid} />
          {specialRequests && (
            <span
              title={specialRequests}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Request
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <BedDouble className="h-3.5 w-3.5" />
          {roomTypeName ?? "Unassigned"}
          {roomNumber ? ` · Room ${roomNumber}` : ""}
          <span className="text-border">·</span>
          <span>
            {nights} night{nights === 1 ? "" : "s"}
          </span>
        </p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          toast(
            isDeparture
              ? "Checkout flow coming in Front Desk module"
              : "Check-in flow coming in Front Desk module",
          )
        }
      >
        {isDeparture ? "Check Out" : "Check In"}
      </Button>
    </div>
  );
}

function EmptyState({ variant }) {
  const Icon = variant === "departure" ? LogOut : LogIn;
  return (
    <div className="empty-state py-10">
      <div className="empty-state-icon">
        <Icon className="h-5 w-5" />
      </div>
      <p className="empty-state-title">
        {variant === "departure" ? "No departures" : "No arrivals"}
      </p>
      <p className="empty-state-desc">
        {variant === "departure"
          ? "No guests are checking out today."
          : "No guests are arriving today."}
      </p>
    </div>
  );
}

function Column({ title, count, records, variant, isLoading }) {
  return (
    <div className="flex min-w-0 flex-col">
      <header className="mb-3 flex items-center gap-2">
        <h4 className="font-serif text-base font-semibold text-foreground">
          {title}
        </h4>
        <span
          className={cn(
            "inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
            variant === "departure"
              ? "bg-orange-50 text-orange-700"
              : "bg-teal-muted text-teal",
          )}
        >
          {count ?? 0}
        </span>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState variant={variant} />
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <ReservationRow key={r.id} record={r} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArrivalsList({
  arrivals,
  departures,
  arrivalsLoading,
  departuresLoading,
  layout = "columns",
}) {
  const gridClass =
    layout === "stacked"
      ? "grid grid-cols-1 gap-6"
      : "grid grid-cols-1 gap-6 md:grid-cols-2";

  return (
    <section className="section-card">
      <header className="section-card-header">
        <h3 className="section-card-title">Today&apos;s Traffic</h3>
      </header>
      <div className="section-card-body">
        <div className={gridClass}>
          <Column
            title="Arrivals"
            count={arrivals?.length}
            records={arrivals ?? []}
            variant="arrival"
            isLoading={arrivalsLoading}
          />
          <Column
            title="Departures"
            count={departures?.length}
            records={departures ?? []}
            variant="departure"
            isLoading={departuresLoading}
          />
        </div>
      </div>
    </section>
  );
}
