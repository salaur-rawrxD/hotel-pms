import { AlertCircle, Plus } from "lucide-react";

import { UserAvatar } from "../ui/avatar.jsx";
import { Badge } from "../ui/badge.jsx";
import { Button } from "../ui/button.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { cn } from "../../lib/utils.js";
import { useAssignments } from "../../hooks/useHousekeeping.js";
import { TASK_STATUS_META, TASK_TYPE_META } from "./helpers.js";

function ProgressBar({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = pct === 100;
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>
          {done} of {total} done
        </span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="progress-wrap mt-1">
        <div
          className={cn("progress-fill", complete && "complete")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TaskRow({ task, onOpen }) {
  const sMeta = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.PENDING;
  const tMeta = TASK_TYPE_META[task.taskType] ?? TASK_TYPE_META.CHECKOUT;
  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className="staff-room-row w-full"
    >
      <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-md bg-muted px-1.5 font-mono text-xs font-semibold text-foreground">
        {task.roomNumber}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-muted-foreground">
          {task.roomType ?? "—"}
        </p>
        <span
          className={cn(
            "inline-flex rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide",
            tMeta.cls,
          )}
        >
          {tMeta.label}
        </span>
      </div>
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
          sMeta.cls,
        )}
        title={sMeta.label}
      >
        {sMeta.icon}
      </span>
    </button>
  );
}

function StaffCard({ staff, onOpen }) {
  return (
    <div className="staff-card">
      <header className="staff-card-header flex items-center gap-3">
        <UserAvatar name={staff.staffName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">
            {staff.staffName}
          </p>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {staff.role ?? "STAFF"}
          </Badge>
        </div>
      </header>

      <div className="px-4 py-3">
        <ProgressBar done={staff.stats.done} total={staff.stats.total} />
      </div>

      <div className="staff-card-body">
        {staff.tasks.map((t) => (
          <TaskRow key={t.id} task={t} onOpen={onOpen} />
        ))}
        {staff.tasks.length === 0 && (
          <p className="rounded-md border border-dashed px-2 py-3 text-center text-[11px] text-muted-foreground">
            No rooms assigned
          </p>
        )}
      </div>

      <footer className="border-t px-4 py-2 text-[11px] text-muted-foreground">
        {staff.stats.done} Done · {staff.stats.inProgress} In Progress ·{" "}
        {staff.stats.pending + staff.stats.inspected} Pending
      </footer>
    </div>
  );
}

function UnassignedColumn({ rooms, tasks, onOpen, onAssign }) {
  const isEmpty = rooms.length === 0 && tasks.length === 0;
  return (
    <div className="staff-card border-rose-200 bg-rose-50/40">
      <header className="staff-card-header flex items-center gap-2 text-rose-700">
        <AlertCircle className="h-4 w-4" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Unassigned
        </h3>
        <Badge className="ml-auto bg-rose-500 text-white hover:bg-rose-500">
          {rooms.length + tasks.length}
        </Badge>
      </header>
      <div className="staff-card-body">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} onOpen={onOpen} />
        ))}
        {rooms.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-md border bg-card px-2.5 py-2"
          >
            <div>
              <p className="font-mono text-sm font-semibold text-foreground">
                {r.number}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {r.roomType ?? "—"}
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              className="h-7 px-2 text-[11px]"
              onClick={() => onAssign(r)}
            >
              <Plus className="h-3 w-3" />
              Assign
            </Button>
          </div>
        ))}
        {isEmpty && (
          <p className="rounded-md border border-dashed border-rose-200 px-2 py-3 text-center text-[11px] text-rose-400">
            Nothing unassigned
          </p>
        )}
      </div>
    </div>
  );
}

function LoadingBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-80 w-[260px] shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

export default function StaffAssignmentBoard({ onOpenTask, onAssignRoom }) {
  const { data, isLoading } = useAssignments();

  if (isLoading) return <LoadingBoard />;
  if (!data) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-3">
      {data.assignments.map((staff) => (
        <StaffCard key={staff.staffId} staff={staff} onOpen={onOpenTask} />
      ))}
      <UnassignedColumn
        rooms={data.unassigned.rooms}
        tasks={data.unassigned.tasks}
        onOpen={onOpenTask}
        onAssign={onAssignRoom}
      />
    </div>
  );
}
