import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Check,
  CheckCheck,
  CheckCircle2,
  Eye,
  Play,
  RotateCcw,
  Undo2,
  X,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
import {
  useCreateMaintenanceRequest,
  useTaskChecklist,
  useToggleChecklistItem,
  useUpdateTaskStatus,
} from "../../hooks/useHousekeeping.js";
import { formatTime } from "../../utils/formatDate.js";
import {
  getInitials,
  TASK_STATUS_META,
  TASK_TYPE_META,
} from "./helpers.js";

function ChecklistCheckbox({ checked, onToggle, label, checkedAt }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "group flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition",
        checked ? "bg-emerald-50/60" : "hover:bg-slate-50",
      )}
    >
      <span
        className={clsx(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition",
          checked
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400",
        )}
        aria-hidden
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={clsx(
            "block text-sm",
            checked ? "text-slate-500 line-through" : "text-navy-900",
          )}
        >
          {label}
        </span>
        {checked && checkedAt && (
          <span className="mt-0.5 block text-[10px] text-emerald-700">
            Checked at {formatTime(checkedAt)}
          </span>
        )}
      </span>
    </button>
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
      primary: true,
      className: "bg-teal text-white hover:bg-teal-dark",
    });
  }
  if (task.status === "IN_PROGRESS") {
    buttons.push({
      key: "inspect",
      label: "Mark for Inspection",
      icon: Eye,
      to: "INSPECTED",
      primary: true,
      className: "bg-blue-600 text-white hover:bg-blue-700",
    });
  }
  if (task.status === "INSPECTED" && isManager) {
    buttons.push({
      key: "approve",
      label: "Approve & Mark Clean",
      icon: CheckCircle2,
      to: "DONE",
      primary: true,
      className: "bg-emerald-600 text-white hover:bg-emerald-700",
    });
  }
  if (task.status !== "PENDING") {
    buttons.push({
      key: "reset",
      label: "Reset to Pending",
      icon: Undo2,
      to: "PENDING",
      primary: false,
      className:
        "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map(({ key, label, icon: Icon, to, className }) => (
        <button
          key={key}
          type="button"
          onClick={() => onTransition(to)}
          className={clsx(
            "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold shadow-sm transition",
            className,
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
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
    <form
      onSubmit={submit}
      className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-3"
    >
      <textarea
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue…"
        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-navy-900 placeholder:text-slate-400"
      />
      <div className="flex items-center gap-2">
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button
          type="submit"
          disabled={createMaint.isPending}
          className="ml-auto inline-flex items-center gap-1 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60"
        >
          Report
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
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
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" aria-hidden />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-end">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
              {/* Header */}
              <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
                <div className="min-w-0">
                  {isLoading || !task ? (
                    <div className="h-10 w-48 animate-pulse rounded bg-slate-100" />
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <h2 className="font-serif text-3xl font-bold text-navy-900">
                          Room {task.roomNumber}
                        </h2>
                        <span className="text-sm text-slate-500">
                          · Floor {task.floor}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-500">{task.roomType}</span>
                        {task.taskType && (
                          <span
                            className={clsx(
                              "inline-flex rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                              TASK_TYPE_META[task.taskType]?.bg,
                              TASK_TYPE_META[task.taskType]?.text,
                            )}
                          >
                            {TASK_TYPE_META[task.taskType]?.label ?? task.taskType}
                          </span>
                        )}
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide",
                            TASK_STATUS_META[task.status]?.bg,
                            TASK_STATUS_META[task.status]?.text,
                          )}
                        >
                          {TASK_STATUS_META[task.status]?.icon}{" "}
                          {TASK_STATUS_META[task.status]?.label}
                        </span>
                      </div>
                      {task.assignedTo && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-teal text-[10px] font-semibold text-white">
                            {getInitials(task.assignedTo.name)}
                          </span>
                          Assigned to{" "}
                          <span className="font-semibold text-slate-700">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
                {isLoading || !task ? (
                  <div className="space-y-3">
                    <div className="h-10 animate-pulse rounded bg-slate-100" />
                    <div className="h-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-64 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : (
                  <>
                    <StatusActionButtons
                      task={task}
                      onTransition={handleTransition}
                      isManager={isManager}
                    />

                    {reservation && (
                      <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Current Guest
                        </h3>
                        <p className="mt-1 font-semibold text-navy-900">
                          {reservation.guestName}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400">Check-out:</span>{" "}
                            {formatTime(reservation.checkOut)}
                          </div>
                          <div>
                            <span className="text-slate-400">Guests:</span>{" "}
                            {reservation.adults} adult
                            {reservation.adults === 1 ? "" : "s"}
                            {reservation.children > 0
                              ? `, ${reservation.children} child${reservation.children === 1 ? "" : "ren"}`
                              : ""}
                          </div>
                        </div>
                        {reservation.specialRequests && (
                          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                            <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                            {reservation.specialRequests}
                          </div>
                        )}
                      </section>
                    )}

                    {/* Checklist */}
                    <section className="mt-5">
                      <div className="mb-3 flex items-end justify-between">
                        <h3 className="font-serif text-lg font-semibold text-navy-900">
                          Cleaning Checklist
                        </h3>
                        {checklist && (
                          <span className="text-xs text-slate-500">
                            {checklist.checkedItems} of {checklist.totalItems}{" "}
                            complete
                          </span>
                        )}
                      </div>
                      {checklist && (
                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-teal transition-all duration-300"
                            style={{ width: `${checklist.completionPercent}%` }}
                          />
                        </div>
                      )}

                      {checklist?.byCategory?.map((group) => (
                        <div key={group.category} className="mb-4">
                          <div className="mb-1 flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                          <div className="rounded-lg border border-slate-100 bg-white p-1">
                            {group.items.map((it) => (
                              <ChecklistCheckbox
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

                      {checklist &&
                        checklist.checkedItems > 0 && (
                          <button
                            type="button"
                            onClick={uncheckAll}
                            className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Uncheck all
                          </button>
                        )}
                    </section>

                    {/* Report issue */}
                    <section className="mt-6 border-t border-slate-200 pt-4">
                      {showIssueForm ? (
                        <IssueForm
                          roomId={task.roomId}
                          onClose={() => setShowIssueForm(false)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowIssueForm(true)}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Report Maintenance Issue
                        </button>
                      )}
                    </section>
                  </>
                )}
              </div>

              {/* Footer */}
              <footer className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
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
                  <p className="text-slate-400">Not yet started</p>
                )}
              </footer>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
