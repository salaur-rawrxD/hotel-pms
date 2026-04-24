import clsx from "clsx";
import { AlertCircle, Plus } from "lucide-react";

import { useAssignments } from "../../hooks/useHousekeeping.js";
import {
  getInitials,
  TASK_STATUS_META,
  TASK_TYPE_META,
} from "./helpers.js";

function ProgressBar({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const color =
    pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>
          {done} of {total} rooms done
        </span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={clsx("h-full rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TaskRow({ task, onOpen }) {
  const sMeta = TASK_STATUS_META[task.status] ?? TASK_STATUS_META.PENDING;
  const tMeta = TASK_TYPE_META[task.taskType] ?? TASK_TYPE_META.CHECKOUT;
  const spinClass = task.status === "IN_PROGRESS" ? "animate-spin" : "";

  return (
    <button
      type="button"
      onClick={() => onOpen(task.id)}
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-left transition hover:border-teal/40 hover:bg-white"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-md bg-white px-1.5 font-mono text-xs font-semibold text-navy-900 ring-1 ring-slate-200">
          {task.roomNumber}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium text-slate-500">
            {task.roomType ?? "—"}
          </p>
          <span
            className={clsx(
              "mt-0.5 inline-flex rounded-full px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide",
              tMeta.bg,
              tMeta.text,
            )}
          >
            {tMeta.label}
          </span>
        </div>
      </div>
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          sMeta.bg,
          sMeta.text,
        )}
        title={sMeta.label}
      >
        <span className={spinClass} aria-hidden>
          {sMeta.icon}
        </span>
      </span>
    </button>
  );
}

function StaffCard({ staff, onOpen }) {
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal text-sm font-semibold text-white">
          {getInitials(staff.staffName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-900">
            {staff.staffName}
          </p>
          <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700">
            {staff.role ?? "STAFF"}
          </span>
        </div>
      </header>

      <div className="mt-3">
        <ProgressBar done={staff.stats.done} total={staff.stats.total} />
      </div>

      <div className="mt-3 space-y-1.5">
        {staff.tasks.map((t) => (
          <TaskRow key={t.id} task={t} onOpen={onOpen} />
        ))}
        {staff.tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-slate-200 px-2 py-3 text-center text-[11px] text-slate-400">
            No rooms assigned
          </p>
        )}
      </div>

      <footer className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        {staff.stats.done} Done · {staff.stats.inProgress} In Progress ·{" "}
        {staff.stats.pending + staff.stats.inspected} Pending
      </footer>
    </div>
  );
}

function UnassignedColumn({ rooms, tasks, onOpen, onAssign }) {
  const isEmpty = rooms.length === 0 && tasks.length === 0;
  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-rose-200 bg-rose-50/40 p-4">
      <header className="flex items-center gap-2 text-rose-700">
        <AlertCircle className="h-4 w-4" />
        <h3 className="text-sm font-semibold uppercase tracking-wide">
          Unassigned
        </h3>
        <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {rooms.length + tasks.length}
        </span>
      </header>
      <div className="mt-3 space-y-1.5">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} onOpen={onOpen} />
        ))}
        {rooms.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-rose-200 bg-white px-2.5 py-2"
          >
            <div>
              <p className="font-mono text-sm font-semibold text-navy-900">
                {r.number}
              </p>
              <p className="text-[10px] text-slate-500">{r.roomType ?? "—"}</p>
            </div>
            <button
              type="button"
              onClick={() => onAssign(r)}
              className="inline-flex items-center gap-1 rounded-md bg-teal px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-teal-dark"
            >
              <Plus className="h-3 w-3" />
              Assign
            </button>
          </div>
        ))}
        {isEmpty && (
          <p className="rounded-md border border-dashed border-rose-200 bg-white px-2 py-3 text-center text-[11px] text-rose-400">
            Nothing unassigned 🎉
          </p>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-80 w-72 shrink-0 animate-pulse rounded-2xl bg-slate-100"
        />
      ))}
    </div>
  );
}

export default function StaffAssignmentBoard({ onOpenTask, onAssignRoom }) {
  const { data, isLoading } = useAssignments();

  if (isLoading) return <Skeleton />;
  if (!data) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
      {data.assignments.map((staff) => (
        <StaffCard
          key={staff.staffId}
          staff={staff}
          onOpen={onOpenTask}
        />
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
