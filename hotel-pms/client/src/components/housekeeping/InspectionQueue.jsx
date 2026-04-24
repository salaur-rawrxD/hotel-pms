import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, PartyPopper, Undo2 } from "lucide-react";

import { Button } from "../ui/button.jsx";
import { Card, CardContent } from "../ui/card.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { UserAvatar } from "../ui/avatar.jsx";
import {
  useInspectionQueue,
  useUpdateTaskStatus,
} from "../../hooks/useHousekeeping.js";
import { useAuthStore } from "../../store/authStore.js";
import { formatRelative } from "../../utils/formatDate.js";

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
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-14 shrink-0 place-items-center rounded-lg bg-blue-50 font-mono text-base font-bold text-blue-700 ring-1 ring-blue-100">
              {task.roomNumber}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Floor {task.floor} · {task.roomType ?? "—"}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <UserAvatar name={task.assignedTo ?? ""} size="sm" />
                Cleaned by{" "}
                <span className="font-medium text-foreground">
                  {task.assignedTo ?? "—"}
                </span>
                {task.completedAt && (
                  <>
                    <span>·</span>
                    <span>{formatRelative(task.completedAt)}</span>
                  </>
                )}
              </div>
              {task.notes && (
                <p className="mt-2 rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                  {task.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 lg:shrink-0">
            <Button
              size="sm"
              disabled={isPending || !isManager}
              onClick={() => onPass(task.id)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              title={!isManager ? "Manager/admin only" : undefined}
            >
              <CheckCircle2 />
              Pass
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setShowReason((v) => !v)}
            >
              <Undo2 />
              Send Back
            </Button>
          </div>
        </div>
        {showReason && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
              Reason (required)
            </label>
            <Textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bathroom floor still dirty, please re-clean."
              className="mt-1 bg-white"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowReason(false);
                  setReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleSendBack}
              >
                Send Back
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div>
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Inspection Queue
          </h2>
          <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
            {items.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Rooms marked ready by housekeeping staff appear here for final
          inspection.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon bg-emerald-100">
            <PartyPopper className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="empty-state-title">
            No rooms waiting for inspection
          </p>
          <p className="empty-state-desc">All clean.</p>
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
