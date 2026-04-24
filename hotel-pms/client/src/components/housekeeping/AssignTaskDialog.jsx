import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Label } from "../ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import {
  useAssignableHousekeepingStaff,
  useAssignTask,
  usePatchTaskAssignment,
} from "../../hooks/useHousekeeping.js";
import { TASK_TYPE_META } from "./helpers.js";

export default function AssignTaskDialog({
  open,
  onOpenChange,
  user,
  target,
}) {
  const [staffId, setStaffId] = useState("");

  const staffQuery = useAssignableHousekeepingStaff(user, open);
  const assignNew = useAssignTask();
  const assignExisting = usePatchTaskAssignment();

  const staffList = staffQuery.data ?? [];

  useEffect(() => {
    if (!open) setStaffId("");
  }, [open, target]);

  const title = useMemo(() => {
    if (!target) return "Assign room";
    if (target.kind === "room") return `Assign room ${target.room.number}`;
    return `Assign room ${target.task.roomNumber}`;
  }, [target]);

  const description = useMemo(() => {
    if (!target) return "";
    if (target.kind === "task") {
      const meta =
        TASK_TYPE_META[target.task.taskType] ?? TASK_TYPE_META.CHECKOUT;
      return `Unassigned ${meta.label} task — pick a housekeeper.`;
    }
    return "Creates a housekeeping task and assigns it to the selected staff member.";
  }, [target]);

  const busy = assignNew.isPending || assignExisting.isPending;

  const handleSubmit = async () => {
    if (!target || !staffId) {
      toast.error("Select a staff member");
      return;
    }
    try {
      if (target.kind === "room") {
        await assignNew.mutateAsync({
          roomId: target.room.id,
          staffId,
          taskType: "CHECKOUT",
        });
        toast.success(`Room ${target.room.number} assigned`);
      } else {
        await assignExisting.mutateAsync({
          taskId: target.task.id,
          staffId,
        });
        toast.success(`Room ${target.task.roomNumber} assigned`);
      }
      onOpenChange(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        "Could not assign — try again.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {staffQuery.isLoading && (
          <div className="space-y-2 py-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        )}

        {staffQuery.isError && (
          <p className="text-sm text-destructive">
            Could not load staff. Check your connection and try again.
          </p>
        )}

        {!staffQuery.isLoading && !staffQuery.isError && (
          <div className="space-y-3 py-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              Housekeeper
            </Label>
            {staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No housekeeping users found. Add staff with the Housekeeping role
                in Settings (or your user directory).
              </p>
            ) : (
              <RadioGroup
                value={staffId}
                onValueChange={setStaffId}
                className="max-h-[240px] space-y-2 overflow-y-auto pr-1"
              >
                {staffList.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <RadioGroupItem value={s.id} id={`hk-${s.id}`} />
                    <Label
                      htmlFor={`hk-${s.id}`}
                      className="cursor-pointer text-sm font-medium leading-none"
                    >
                      {s.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              busy || !staffId || staffList.length === 0 || staffQuery.isLoading
            }
          >
            {busy ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
