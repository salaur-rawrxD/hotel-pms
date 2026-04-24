import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Eye,
  Play,
  RotateCcw,
  Undo2,
} from "lucide-react";

import { Button } from "../ui/button.jsx";
import { Checkbox } from "../ui/checkbox.jsx";
import { Label } from "../ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { UserAvatar } from "../ui/avatar.jsx";
import { cn } from "../../lib/utils.js";
import {
  useCreateMaintenanceRequest,
  useTaskChecklist,
  useToggleChecklistItem,
  useUpdateTaskStatus,
} from "../../hooks/useHousekeeping.js";
import { useAuthStore } from "../../store/authStore.js";
import { formatTime } from "../../utils/formatDate.js";
import { TASK_STATUS_META, TASK_TYPE_META } from "./helpers.js";

function ChecklistRow({ checked, onToggle, label, checkedAt }) {
  return (
    <div
      className={cn("checklist-item", checked && "checked")}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        className="mt-0.5"
      />
      <div className="flex-1">
        <span className="checklist-label">{label}</span>
        {checked && checkedAt && (
          <span className="checklist-timestamp block">
            Checked at {formatTime(checkedAt)}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusActionButtons({ task, onTransition, isManager }) {
  if (!task) return null;

  const buttons = [];
  if (task.status === "PENDING") {
    buttons.push({
      key: "start",
      label: "Start Cleaning",
      icon: Play,
      to: "IN_PROGRESS",
      variant: "default",
    });
  }
  if (task.status === "IN_PROGRESS") {
    buttons.push({
      key: "inspect",
      label: "Mark for Inspection",
      icon: Eye,
      to: "INSPECTED",
      variant: "default",
      className: "bg-blue-600 text-white hover:bg-blue-700",
    });
  }
  if (task.status === "INSPECTED" && isManager) {
    buttons.push({
      key: "approve",
      label: "Approve & Mark Clean",
      icon: CheckCircle2,
      to: "DONE",
      variant: "default",
      className: "bg-emerald-600 text-white hover:bg-emerald-700",
    });
  }
  if (task.status !== "PENDING") {
    buttons.push({
      key: "reset",
      label: "Reset to Pending",
      icon: Undo2,
      to: "PENDING",
      variant: "outline",
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ key, label, icon: Icon, to, variant, className }) => (
        <Button
          key={key}
          variant={variant}
          size="sm"
          className={className}
          onClick={() => onTransition(to)}
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
}

function IssueForm({ roomId, onClose }) {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("LOW");
  const createMaint = useCreateMaintenanceRequest();

  const submit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    try {
      await createMaint.mutateAsync({ roomId, description, severity });
      toast.success("Maintenance request submitted");
      setDescription("");
      setSeverity("LOW");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
      <Textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue…"
      />
      <div className="flex items-center gap-2">
        <Select value={severity} onValueChange={setSeverity}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={createMaint.isPending}
          className="ml-auto"
        >
          Report
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function RoomTaskDrawer({ taskId, open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data, isLoading } = useTaskChecklist(taskId);
  const toggleItem = useToggleChecklistItem();
  const updateStatus = useUpdateTaskStatus();

  const [showIssueForm, setShowIssueForm] = useState(false);
  useEffect(() => {
    if (!open) setShowIssueForm(false);
  }, [open]);

  const task = data?.task;
  const checklist = data?.checklist;
  const reservation = data?.reservation;

  const handleTransition = async (toStatus) => {
    try {
      await updateStatus.mutateAsync({ taskId, status: toStatus });
      toast.success(`Marked ${TASK_STATUS_META[toStatus]?.label ?? toStatus}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Unable to update status");
    }
  };

  const handleCheck = (itemId) => {
    toggleItem.mutate({ taskId, checklistId: checklist.id, itemId });
  };

  const checkAllInCategory = async (items) => {
    const unchecked = items.filter((i) => !i.isChecked);
    for (const item of unchecked) {
      // eslint-disable-next-line no-await-in-loop
      await toggleItem.mutateAsync({
        taskId,
        checklistId: checklist.id,
        itemId: item.id,
      });
    }
  };

  const uncheckAll = async () => {
    const allChecked = (checklist?.byCategory ?? []).flatMap((g) =>
      g.items.filter((i) => i.isChecked),
    );
    for (const item of allChecked) {
      // eslint-disable-next-line no-await-in-loop
      await toggleItem.mutateAsync({
        taskId,
        checklistId: checklist.id,
        itemId: item.id,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full max-w-xl p-0 sm:max-w-xl"
      >
        <div className="flex h-full flex-col">
          <SheetHeader className="task-drawer-header">
            {isLoading || !task ? (
              <Skeleton className="h-12 w-48" />
            ) : (
              <div>
                <div className="flex items-baseline gap-2">
                  <SheetTitle className="font-serif text-3xl">
                    Room {task.roomNumber}
                  </SheetTitle>
                  <span className="text-sm text-muted-foreground">
                    · Floor {task.floor}
                  </span>
                </div>
                <SheetDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span>{task.roomType}</span>
                  {task.taskType && (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                        TASK_TYPE_META[task.taskType]?.cls,
                      )}
                    >
                      {TASK_TYPE_META[task.taskType]?.label ?? task.taskType}
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                      TASK_STATUS_META[task.status]?.cls,
                    )}
                  >
                    {TASK_STATUS_META[task.status]?.icon}{" "}
                    {TASK_STATUS_META[task.status]?.label}
                  </span>
                </SheetDescription>
                {task.assignedTo && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <UserAvatar name={task.assignedTo.name} size="sm" />
                    Assigned to{" "}
                    <span className="font-semibold text-foreground">
                      {task.assignedTo.name}
                    </span>
                  </div>
                )}
              </div>
            )}
          </SheetHeader>

          <div className="task-drawer-body">
            {isLoading || !task ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-24" />
                <Skeleton className="h-64" />
              </div>
            ) : (
              <>
                <StatusActionButtons
                  task={task}
                  onTransition={handleTransition}
                  isManager={isManager}
                />

                {reservation && (
                  <section className="section-card">
                    <div className="section-card-body">
                      <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Current Guest
                      </h3>
                      <p className="mt-1 font-semibold text-foreground">
                        {reservation.guestName}
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div>
                          <span className="text-muted-foreground/60">
                            Check-out:
                          </span>{" "}
                          {formatTime(reservation.checkOut)}
                        </div>
                        <div>
                          <span className="text-muted-foreground/60">
                            Guests:
                          </span>{" "}
                          {reservation.adults} adult
                          {reservation.adults === 1 ? "" : "s"}
                          {reservation.children > 0
                            ? `, ${reservation.children} child${reservation.children === 1 ? "" : "ren"}`
                            : ""}
                        </div>
                      </div>
                      {reservation.specialRequests && (
                        <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          <span>{reservation.specialRequests}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-3 flex items-end justify-between">
                    <Label className="font-serif text-lg font-semibold text-foreground">
                      Cleaning Checklist
                    </Label>
                    {checklist && (
                      <span className="text-xs text-muted-foreground">
                        {checklist.checkedItems} of {checklist.totalItems} complete
                      </span>
                    )}
                  </div>
                  {checklist && (
                    <div className="progress-wrap mb-4">
                      <div
                        className={cn(
                          "progress-fill",
                          checklist.completionPercent === 100 && "complete",
                        )}
                        style={{ width: `${checklist.completionPercent}%` }}
                      />
                    </div>
                  )}

                  {checklist?.byCategory?.map((group) => (
                    <div key={group.category} className="checklist-category">
                      <div className="checklist-category-header">
                        <h4 className="checklist-category-title">
                          {group.category}
                        </h4>
                        <button
                          type="button"
                          onClick={() => checkAllInCategory(group.items)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-teal hover:bg-teal/10"
                        >
                          <CheckCheck className="h-3 w-3" />
                          Check all
                        </button>
                      </div>
                      <div className="rounded-lg border bg-card p-1">
                        {group.items.map((it) => (
                          <ChecklistRow
                            key={it.id}
                            checked={it.isChecked}
                            onToggle={() => handleCheck(it.id)}
                            label={it.label}
                            checkedAt={it.checkedAt}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {checklist && checklist.checkedItems > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={uncheckAll}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Uncheck all
                    </Button>
                  )}
                </section>

                <section className="border-t pt-4">
                  {showIssueForm ? (
                    <IssueForm
                      roomId={task.roomId}
                      onClose={() => setShowIssueForm(false)}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setShowIssueForm(true)}
                      className="border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100"
                    >
                      <AlertTriangle />
                      Report Maintenance Issue
                    </Button>
                  )}
                </section>
              </>
            )}
          </div>

          <footer className="border-t bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
            {task?.startedAt && (
              <p>Task started at {formatTime(task.startedAt)}</p>
            )}
            {task?.completedAt && (
              <p>
                Completed at {formatTime(task.completedAt)}
                {task?.assignedTo?.name ? ` · ${task.assignedTo.name}` : ""}
              </p>
            )}
            {!task?.startedAt && !task?.completedAt && (
              <p>Not yet started</p>
            )}
          </footer>
        </div>
      </SheetContent>
    </Sheet>
  );
}
