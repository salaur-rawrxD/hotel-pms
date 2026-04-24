import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, PartyPopper, Undo2 } from "lucide-react";

import {
  useInspectionQueue,
  useUpdateTaskStatus,
} from "../../hooks/useHousekeeping.js";
import { useAuthStore } from "../../store/authStore.js";
import { formatRelative } from "../../utils/formatDate.js";
import { getInitials } from "./helpers.js";

function QueueItem({ task, onPass, onSendBack, isManager, isPending }) {
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");

  const handleSendBack = async () => {
    if (!reason.trim()) {
      toast.error("Please add a reason");
      return;
    }
    await onSendBack(task.id, reason);
    setShowReason(false);
    setReason("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-14 shrink-0 place-items-center rounded-lg bg-blue-50 font-mono text-base font-bold text-blue-700 ring-1 ring-blue-100">
            {task.roomNumber}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy-900">
              Floor {task.floor} · {task.roomType ?? "—"}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-teal text-[9px] font-semibold text-white">
                {getInitials(task.assignedTo ?? "")}
              </span>
              Cleaned by{" "}
              <span className="font-medium text-slate-700">
                {task.assignedTo ?? "—"}
              </span>
              {task.completedAt && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>{formatRelative(task.completedAt)}</span>
                </>
              )}
              {!task.completedAt && task.startedAt && (
                <>
                  <span className="text-slate-300">·</span>
                  <span>started {formatRelative(task.startedAt)}</span>
                </>
              )}
            </div>
            {task.notes && (
              <p className="mt-2 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                {task.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 lg:shrink-0">
          <button
            type="button"
            disabled={isPending || !isManager}
            onClick={() => onPass(task.id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            title={!isManager ? "Manager/admin only" : undefined}
          >
            <CheckCircle2 className="h-4 w-4" />
            Pass Inspection
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setShowReason((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Undo2 className="h-4 w-4" />
            Send Back
          </button>
        </div>
      </div>
      {showReason && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
            Reason (required)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Bathroom floor still dirty, please re-clean."
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy-900 placeholder:text-slate-400"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowReason(false);
                setReason("");
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendBack}
              className="rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
            >
              Send Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InspectionQueue() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data, isLoading } = useInspectionQueue();
  const updateStatus = useUpdateTaskStatus();

  const handlePass = async (taskId) => {
    try {
      await updateStatus.mutateAsync({ taskId, status: "DONE" });
      toast.success("Inspection approved — room marked clean");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to approve");
    }
  };

  const handleSendBack = async (taskId, reason) => {
    try {
      await updateStatus.mutateAsync({
        taskId,
        status: "PENDING",
        notes: `Sent back from inspection: ${reason}`,
      });
      toast.success("Sent back to housekeeping");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to send back");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div>
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              Inspection Queue
            </h2>
            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
              {items.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Rooms marked ready by housekeeping staff appear here for manager
            final inspection.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-white py-14 text-center">
          <PartyPopper className="h-10 w-10 text-emerald-500" />
          <p className="mt-3 font-serif text-lg font-semibold text-navy-900">
            No rooms waiting for inspection
          </p>
          <p className="text-sm text-slate-500">All clean!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <QueueItem
              key={t.id}
              task={t}
              onPass={handlePass}
              onSendBack={handleSendBack}
              isManager={isManager}
              isPending={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
