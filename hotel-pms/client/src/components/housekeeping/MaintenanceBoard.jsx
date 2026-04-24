import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
import {
  useCreateMaintenanceRequest,
  useFloorMap,
  useMaintenanceRequests,
  useUpdateMaintenanceRequest,
} from "../../hooks/useHousekeeping.js";
import { formatDateShort } from "../../utils/formatDate.js";
import { daysBetween, SEVERITY_META } from "./helpers.js";

const COLUMNS = [
  { key: "OPEN",        label: "Open",         tint: "border-rose-200" },
  { key: "IN_PROGRESS", label: "In Progress",  tint: "border-amber-200" },
  { key: "RESOLVED",    label: "Resolved",     tint: "border-emerald-200" },
];

function ReportIssueModal({ open, onClose, rooms }) {
  const user = useAuthStore((s) => s.user);
  const create = useCreateMaintenanceRequest();
  const [form, setForm] = useState({
    roomId: "",
    description: "",
    severity: "LOW",
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.description.trim()) {
      toast.error("Room and description are required");
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        reportedBy: user?.name ?? undefined,
      });
      toast.success("Issue reported");
      setForm({ roomId: "", description: "", severity: "LOW" });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit");
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-navy-900/40 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="font-serif text-xl font-bold text-navy-900">
                  Report Maintenance Issue
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Room *
                  </label>
                  <select
                    value={form.roomId}
                    onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                  >
                    <option value="">Select a room…</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Room {r.number} · Floor {r.floor}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Severity
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Your name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user?.name ?? ""}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={create.isPending}
                    className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

function MaintCard({ request, isManager }) {
  const update = useUpdateMaintenanceRequest();
  const [showResolve, setShowResolve] = useState(false);
  const [resolveNotes, setResolveNotes] = useState("");

  const sev = SEVERITY_META[request.severity] ?? SEVERITY_META.LOW;
  const days = daysBetween(request.createdAt);
  const isOpen = request.status === "OPEN";
  const isInProgress = request.status === "IN_PROGRESS";

  const move = async (status, extra = {}) => {
    try {
      await update.mutateAsync({ id: request.id, status, ...extra });
      toast.success(`Moved to ${status.replace("_", " ").toLowerCase()}`);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Unable to update");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-navy-900">
            Room {request.roomNumber}
            <span className="ml-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              · Floor {request.floor}
            </span>
          </p>
        </div>
        <span
          className={clsx(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            sev.bg,
            sev.text,
          )}
        >
          {sev.label}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
        {request.description}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>
          Reported by{" "}
          <span className="font-medium text-slate-600">
            {request.reportedBy || "—"}
          </span>{" "}
          · {formatDateShort(request.createdAt)}
        </span>
        {request.status !== "RESOLVED" && request.status !== "CLOSED" && (
          <span className={clsx(days > 2 ? "font-semibold text-rose-600" : "text-slate-500")}>
            {days}d open
          </span>
        )}
        {(request.status === "RESOLVED" || request.status === "CLOSED") && request.resolvedAt && (
          <span className="text-emerald-600">
            Resolved {formatDateShort(request.resolvedAt)}
          </span>
        )}
      </div>

      {isManager && (isOpen || isInProgress) && (
        <div className="mt-3 flex gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={() => move("IN_PROGRESS")}
              className="rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
            >
              Start Work
            </button>
          )}
          {isInProgress && !showResolve && (
            <button
              type="button"
              onClick={() => setShowResolve(true)}
              className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}

      {showResolve && (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-2">
          <textarea
            rows={2}
            placeholder="Resolution notes (optional)"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
          />
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => {
                setShowResolve(false);
                setResolveNotes("");
              }}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                await move("RESOLVED", resolveNotes ? { resolutionNotes: resolveNotes } : {});
                setShowResolve(false);
                setResolveNotes("");
              }}
              className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white"
            >
              Resolve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaintenanceBoard() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data, isLoading } = useMaintenanceRequests();
  const { data: floorData } = useFloorMap();
  const [openModal, setOpenModal] = useState(false);

  const rooms = useMemo(() => {
    const out = [];
    for (const floor of floorData ?? []) {
      for (const r of floor.rooms) out.push(r);
    }
    return out;
  }, [floorData]);

  const columns = useMemo(() => {
    const map = { OPEN: [], IN_PROGRESS: [], RESOLVED: [] };
    for (const r of data ?? []) {
      if (r.status === "CLOSED") map.RESOLVED.push(r);
      else if (map[r.status]) map[r.status].push(r);
    }
    return map;
  }, [data]);

  const openCount = (data ?? []).filter(
    (r) => r.status !== "RESOLVED" && r.status !== "CLOSED",
  ).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-bold text-navy-900">
              Maintenance
            </h2>
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
              {openCount} open
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Track repairs across housekeeping, engineering, and front-of-house.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
        >
          <Plus className="h-4 w-4" />
          Report Issue
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={clsx(
              "rounded-xl border-2 bg-slate-50/60 p-3",
              col.tint,
            )}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                {col.label}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {columns[col.key].length}
              </span>
            </div>
            <div className="space-y-2">
              {columns[col.key].map((req) => (
                <MaintCard key={req.id} request={req} isManager={isManager} />
              ))}
              {columns[col.key].length === 0 && (
                <div className="rounded-md border border-dashed border-slate-200 bg-white/60 px-3 py-6 text-center text-xs text-slate-400">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ReportIssueModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        rooms={rooms}
      />
    </div>
  );
}
