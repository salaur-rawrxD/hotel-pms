import { AlertTriangle, BedDouble, LogIn, LogOut } from "lucide-react";
import toast from "react-hot-toast";

import { getChannelColor } from "../../utils/getChannelColor.js";
import { BOOKING_SOURCE_LABELS } from "../../constants/bookingSources.js";

function Initials({ name, tone = "teal" }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const palette =
    tone === "orange"
      ? { bg: "#ffedd5", fg: "#9a3412" }
      : { bg: "#e6f4f4", fg: "#0f766e" };
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
      style={{ background: palette.bg, color: palette.fg }}
    >
      {initials || "?"}
    </span>
  );
}

function SourceBadge({ source }) {
  const { bg, text } = getChannelColor(source);
  const label = BOOKING_SOURCE_LABELS[source] ?? source;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  );
}

function PaymentBadge({ depositPaid }) {
  const paid = Number(depositPaid) > 0;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={
        paid
          ? { background: "#d1fae5", color: "#065f46" }
          : { background: "#fee2e2", color: "#991b1b" }
      }
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

function ReservationRow({ record, variant }) {
  const { guestName, roomNumber, roomTypeName, nights, source, specialRequests, depositPaid } =
    record;
  const isDeparture = variant === "departure";
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 shadow-xs transition hover:border-slate-200 hover:shadow-sm">
      <Initials name={guestName} tone={isDeparture ? "orange" : "teal"} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-semibold text-navy-900">
            {guestName}
          </p>
          <SourceBadge source={source} />
          <PaymentBadge depositPaid={depositPaid} />
          {specialRequests && (
            <span
              title={specialRequests}
              className="inline-flex items-center gap-1 text-[11px] font-medium"
              style={{ color: "#92620c" }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Request
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <BedDouble className="h-3.5 w-3.5" />
          {roomTypeName ?? "Unassigned"}
          {roomNumber ? ` · Room ${roomNumber}` : ""}
          <span className="text-slate-300">·</span>
          <span>{nights} night{nights === 1 ? "" : "s"}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          toast(
            isDeparture
              ? "Checkout flow coming in Front Desk module"
              : "Check-in flow coming in Front Desk module",
          )
        }
        className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold transition hover:brightness-105"
        style={
          isDeparture
            ? { borderColor: "#fdba74", color: "#9a3412" }
            : { borderColor: "#5eead4", color: "#0f766e" }
        }
      >
        {isDeparture ? "Check Out" : "Check In"}
      </button>
    </div>
  );
}

function EmptyState({ variant }) {
  const Icon = variant === "departure" ? LogOut : LogIn;
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-8 text-slate-400">
      <Icon className="h-6 w-6" />
      <p className="text-xs">
        {variant === "departure" ? "No departures today" : "No arrivals today"}
      </p>
    </div>
  );
}

function Column({ title, count, tone, records, variant, isLoading }) {
  const toneStyles =
    tone === "orange"
      ? { bg: "#ffedd5", text: "#9a3412" }
      : { bg: "#e6f4f4", text: "#0f766e" };

  return (
    <div className="flex min-w-0 flex-col">
      <header className="mb-3 flex items-center gap-2">
        <h4 className="font-serif text-base font-semibold text-navy-900">
          {title}
        </h4>
        <span
          className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: toneStyles.bg, color: toneStyles.text }}
        >
          {count ?? 0}
        </span>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-slate-100"
            />
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
  layout = "columns", // "columns" | "stacked"
}) {
  const gridClass =
    layout === "stacked"
      ? "grid grid-cols-1 gap-6"
      : "grid grid-cols-1 gap-6 md:grid-cols-2";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={gridClass}>
        <Column
          title="Arrivals Today"
          tone="teal"
          count={arrivals?.length}
          records={arrivals ?? []}
          variant="arrival"
          isLoading={arrivalsLoading}
        />
        <Column
          title="Departures Today"
          tone="orange"
          count={departures?.length}
          records={departures ?? []}
          variant="departure"
          isLoading={departuresLoading}
        />
      </div>
    </section>
  );
}
