import { useMemo, useState } from "react";
import clsx from "clsx";

import { useAssignments, useFloorMap } from "../../hooks/useHousekeeping.js";
import { floorMapColor, getInitials } from "./helpers.js";

const FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "DIRTY",       label: "Dirty" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "INSPECTED",   label: "Inspected" },
  { key: "CLEAN",       label: "Clean" },
  { key: "VACANT",      label: "Vacant" },
];

const LEGEND = [
  { label: "Vacant",       color: "#f1f5f9" },
  { label: "Dirty",        color: "#f59e0b" },
  { label: "In Progress",  color: "#f97316" },
  { label: "Inspected",    color: "#3b82f6" },
  { label: "Clean",        color: "#10b981" },
  { label: "Occupied",     color: "#1a6b6b" },
  { label: "Out of Order", color: "#ef4444" },
];

function roomMatches(room, filter) {
  if (filter === "ALL") return true;
  if (filter === "IN_PROGRESS" || filter === "INSPECTED") {
    return room.currentTask?.status === filter;
  }
  return room.status === filter;
}

function RoomCell({ room, staffInitials, onOpen }) {
  const { bg, text } = floorMapColor({
    roomStatus: room.status,
    taskStatus: room.currentTask?.status,
  });

  const pct = room.currentTask?.completionPercent ?? 0;

  const tooltip = [
    `Room ${room.number} · ${room.roomType ?? "—"}`,
    `Status: ${room.status}`,
    room.currentTask?.status ? `Task: ${room.currentTask.status}` : null,
    room.currentTask?.assignedTo
      ? `Assigned to: ${room.currentTask.assignedTo}`
      : null,
    room.currentTask ? `Completion: ${pct}%` : null,
    room.currentGuest?.name ? `Guest: ${room.currentGuest.name}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const clickable = !!room.currentTask?.id;

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onOpen(room.currentTask.id)}
      title={tooltip}
      className={clsx(
        "group relative flex aspect-[4/3] items-center justify-center rounded-md text-xs font-semibold shadow-sm ring-1 ring-inset ring-black/5 transition",
        clickable ? "hover:scale-[1.04] hover:shadow-md" : "cursor-default",
      )}
      style={{ background: bg, color: text }}
    >
      <span>{room.number}</span>
      {staffInitials && (
        <span className="absolute bottom-0.5 right-0.5 rounded-sm bg-black/25 px-1 text-[9px] font-bold uppercase tracking-wider text-white">
          {staffInitials}
        </span>
      )}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="mb-2 h-4 w-20 rounded bg-slate-200" />
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 16 }).map((_, j) => (
              <div key={j} className="aspect-[4/3] rounded-md bg-slate-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FloorMapView({ onOpenTask }) {
  const { data, isLoading } = useFloorMap();
  const { data: assignments } = useAssignments();
  const [filter, setFilter] = useState("ALL");

  // Build a staffId -> initials map from assignments payload.
  const staffInitialsById = useMemo(() => {
    const map = new Map();
    for (const s of assignments?.assignments ?? []) {
      map.set(s.staffId, getInitials(s.staffName));
    }
    return map;
  }, [assignments]);

  const summary = useMemo(() => {
    let total = 0;
    let dirty = 0;
    let clean = 0;
    let inProgress = 0;
    let doneToday = 0;
    for (const floor of data ?? []) {
      for (const room of floor.rooms) {
        total += 1;
        if (room.status === "DIRTY") dirty += 1;
        if (room.status === "CLEAN") clean += 1;
        if (room.currentTask?.status === "IN_PROGRESS") inProgress += 1;
        if (room.currentTask?.status === "DONE") doneToday += 1;
      }
    }
    return { total, dirty, clean, inProgress, doneToday };
  }, [data]);

  if (isLoading) return <Skeleton />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Filters + Legend */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                filter === f.key
                  ? "bg-teal text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="inline-block h-3 w-3 rounded-sm ring-1 ring-inset ring-black/10"
                style={{ background: l.color }}
              />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Floors */}
      <div className="space-y-6">
        {data.map((floor) => {
          const visible = floor.rooms.filter((r) => roomMatches(r, filter));
          return (
            <div key={floor.floor} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-serif text-lg font-semibold text-navy-900">
                Floor {floor.floor}
              </h3>
              {visible.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">
                  No rooms match this filter.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                  {visible.map((room) => (
                    <RoomCell
                      key={room.id}
                      room={room}
                      staffInitials={staffInitialsById.get(
                        room.currentTask?.assignedToId,
                      )}
                      onOpen={onOpenTask}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-5">
        <div><span className="text-slate-400">Total:</span>{" "}<b>{summary.total}</b></div>
        <div><span className="text-slate-400">Dirty:</span>{" "}<b>{summary.dirty}</b></div>
        <div><span className="text-slate-400">Clean:</span>{" "}<b>{summary.clean}</b></div>
        <div><span className="text-slate-400">In Progress:</span>{" "}<b>{summary.inProgress}</b></div>
        <div><span className="text-slate-400">Done Today:</span>{" "}<b>{summary.doneToday}</b></div>
      </div>
    </div>
  );
}
