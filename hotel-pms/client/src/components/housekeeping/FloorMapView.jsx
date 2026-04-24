import { useMemo, useState } from "react";

import { Skeleton } from "../ui/skeleton.jsx";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../ui/toggle-group.jsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.jsx";
import { cn } from "../../lib/utils.js";
import { useAssignments, useFloorMap } from "../../hooks/useHousekeeping.js";
import { floorMapClass, getInitials } from "./helpers.js";

const FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "DIRTY",       label: "Dirty" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "INSPECTED",   label: "Inspected" },
  { key: "CLEAN",       label: "Clean" },
  { key: "VACANT",      label: "Vacant" },
];

const LEGEND = [
  { label: "Vacant",       cls: "VACANT" },
  { label: "Dirty",        cls: "DIRTY" },
  { label: "In Progress",  cls: "IN_PROGRESS" },
  { label: "Inspected",    cls: "INSPECTED" },
  { label: "Clean",        cls: "CLEAN" },
  { label: "Occupied",     cls: "OCCUPIED" },
  { label: "Out of Order", cls: "OUT_OF_ORDER" },
];

function roomMatches(room, filter) {
  if (filter === "ALL") return true;
  if (filter === "IN_PROGRESS" || filter === "INSPECTED") {
    return room.currentTask?.status === filter;
  }
  return room.status === filter;
}

function RoomCell({ room, staffInitials, onOpen }) {
  const stateCls = floorMapClass({
    roomStatus: room.status,
    taskStatus: room.currentTask?.status,
  });
  const clickable = !!room.currentTask?.id;
  const pct = room.currentTask?.completionPercent ?? 0;

  const cell = (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onOpen(room.currentTask.id)}
      className={cn("room-cell relative", stateCls, !clickable && "cursor-default")}
    >
      <span>{room.number}</span>
      {staffInitials && (
        <span className="absolute bottom-0.5 right-0.5 rounded-sm bg-black/25 px-1 text-[9px] font-bold uppercase tracking-wider text-white">
          {staffInitials}
        </span>
      )}
    </button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-semibold">
          Room {room.number} · {room.roomType ?? "—"}
        </p>
        <p>Status: {room.status}</p>
        {room.currentTask?.status && <p>Task: {room.currentTask.status}</p>}
        {room.currentTask?.assignedTo && (
          <p>Assigned: {room.currentTask.assignedTo}</p>
        )}
        {room.currentTask && <p>Completion: {pct}%</p>}
        {room.currentGuest?.name && <p>Guest: {room.currentGuest.name}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

function LoadingMap() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 16 }).map((_, j) => (
              <Skeleton key={j} className="h-14 w-14 rounded-lg" />
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

  const staffInitialsById = useMemo(() => {
    const map = new Map();
    for (const s of assignments?.assignments ?? []) {
      map.set(s.staffId, getInitials(s.staffName));
    }
    return map;
  }, [assignments]);

  const summary = useMemo(() => {
    let total = 0, dirty = 0, clean = 0, inProgress = 0, doneToday = 0;
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

  if (isLoading) return <LoadingMap />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="section-card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => v && setFilter(v)}
          variant="outline"
          size="sm"
        >
          {FILTERS.map((f) => (
            <ToggleGroupItem key={f.key} value={f.key} className="text-xs">
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={cn("inline-block h-3 w-3 rounded-sm", l.cls)}
                style={{
                  background:
                    l.cls === "VACANT"
                      ? "#f1f5f9"
                      : l.cls === "DIRTY"
                      ? "#f59e0b"
                      : l.cls === "IN_PROGRESS"
                      ? "#f97316"
                      : l.cls === "INSPECTED"
                      ? "#3b82f6"
                      : l.cls === "CLEAN"
                      ? "#10b981"
                      : l.cls === "OCCUPIED"
                      ? "#1a6b6b"
                      : "#ef4444",
                }}
              />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {data.map((floor) => {
          const visible = floor.rooms.filter((r) => roomMatches(r, filter));
          return (
            <section key={floor.floor} className="section-card">
              <header className="section-card-header">
                <h3 className="section-card-title">Floor {floor.floor}</h3>
                <span className="text-xs text-muted-foreground">
                  {visible.length} rooms
                </span>
              </header>
              <div className="section-card-body">
                {visible.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No rooms match this filter.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
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
            </section>
          );
        })}
      </div>

      <div className="section-card grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-5">
        <div>
          <span className="text-muted-foreground">Total:</span>{" "}
          <b>{summary.total}</b>
        </div>
        <div>
          <span className="text-muted-foreground">Dirty:</span>{" "}
          <b>{summary.dirty}</b>
        </div>
        <div>
          <span className="text-muted-foreground">Clean:</span>{" "}
          <b>{summary.clean}</b>
        </div>
        <div>
          <span className="text-muted-foreground">In Progress:</span>{" "}
          <b>{summary.inProgress}</b>
        </div>
        <div>
          <span className="text-muted-foreground">Done Today:</span>{" "}
          <b>{summary.doneToday}</b>
        </div>
      </div>
    </div>
  );
}
