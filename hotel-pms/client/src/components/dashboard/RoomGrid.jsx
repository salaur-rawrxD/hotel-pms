import { useMemo } from "react";

import { cn } from "../../lib/utils.js";
import { formatDateShort } from "../../utils/formatDate.js";

const LEGEND = [
  { status: "OCCUPIED",     label: "Occupied" },
  { status: "VACANT",       label: "Vacant" },
  { status: "DIRTY",        label: "Dirty" },
  { status: "DUE_IN",       label: "Due In" },
  { status: "DUE_OUT",      label: "Due Out" },
  { status: "OUT_OF_ORDER", label: "Out of Order" },
  { status: "CLEAN",        label: "Clean" },
];

function buildTooltipText(room) {
  const guestName = room.currentGuest
    ? `${room.currentGuest.firstName} ${room.currentGuest.lastName}`.trim()
    : null;
  const upcomingName = room.upcomingGuest
    ? `${room.upcomingGuest.firstName} ${room.upcomingGuest.lastName}`.trim()
    : null;

  switch (room.status) {
    case "OCCUPIED":
      return guestName
        ? `Room ${room.number} — ${guestName}\nCheckout: ${formatDateShort(room.currentGuest.checkOut)}`
        : `Room ${room.number} — Occupied`;
    case "DUE_OUT":
      return guestName
        ? `Room ${room.number} — ${guestName} (checking out today)`
        : `Room ${room.number} — Due out`;
    case "VACANT":
      return `Room ${room.number} — Vacant${room.roomType?.name ? `\n${room.roomType.name}` : ""}`;
    case "CLEAN":
      return `Room ${room.number} — Clean, ready to sell`;
    case "DIRTY":
      return `Room ${room.number} — Needs cleaning`;
    case "DUE_IN":
      return upcomingName
        ? `Room ${room.number} — ${upcomingName} arriving today`
        : `Room ${room.number} — Arrival expected`;
    case "OUT_OF_ORDER":
      return `Room ${room.number} — Out of order`;
    default:
      return `Room ${room.number}`;
  }
}

function LegendSwatch({ status, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("room-cell", status)} style={{ width: 14, height: 14, fontSize: 0 }} />
      {label}
    </div>
  );
}

function RoomCell({ room }) {
  const title = buildTooltipText(room);
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={cn("room-cell", room.status)}
    >
      <span>{room.number}</span>
    </button>
  );
}

function FloorRow({ floor, rooms }) {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Floor {floor}
      </h4>
      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => (
          <RoomCell key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((f) => (
        <div key={f}>
          <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="h-14 w-14 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoomGrid({ floors, isLoading }) {
  const stats = useMemo(() => {
    if (!floors) return null;
    const totals = { OCCUPIED: 0, VACANT: 0, DIRTY: 0, DUE_IN: 0 };
    for (const floor of floors) {
      for (const room of floor.rooms) {
        if (room.status in totals) totals[room.status] += 1;
      }
    }
    return totals;
  }, [floors]);

  return (
    <section className="section-card">
      <header className="section-card-header flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="section-card-title">Room Status</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Live view of every room across the property
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {LEGEND.map((item) => (
            <LegendSwatch key={item.status} {...item} />
          ))}
        </div>
      </header>

      <div className="section-card-body">
        {isLoading || !floors ? (
          <SkeletonBlock />
        ) : (
          <div className="space-y-5">
            {floors.map((f) => (
              <FloorRow key={f.floor} floor={f.floor} rooms={f.rooms} />
            ))}
          </div>
        )}

        {stats && (
          <footer className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{stats.OCCUPIED}</strong> Occupied
            </span>
            <span className="text-border">·</span>
            <span>
              <strong className="text-foreground">{stats.VACANT}</strong> Vacant
            </span>
            <span className="text-border">·</span>
            <span>
              <strong className="text-foreground">{stats.DIRTY}</strong> Dirty
            </span>
            <span className="text-border">·</span>
            <span>
              <strong className="text-foreground">{stats.DUE_IN}</strong> Due In
            </span>
          </footer>
        )}
      </div>
    </section>
  );
}
