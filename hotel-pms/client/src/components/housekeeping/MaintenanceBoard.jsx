import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "../ui/button.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { cn } from "../../lib/utils.js";
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
  { key: "OPEN",        label: "Open" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESOLVED",    label: "Resolved" },
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Report Maintenance Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label className="field-label">Room *</Label>
            <Select
              value={form.roomId}
              onValueChange={(v) => setForm((f) => ({ ...f, roomId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a room…" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    Room {r.number} · Floor {r.floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="field-label">Description *</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="field-label">Severity</Label>
            <Select
              value={form.severity}
              onValueChange={(v) => setForm((f) => ({ ...f, severity: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="field-label">Your name</Label>
            <Input readOnly value={user?.name ?? ""} className="bg-muted/40" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={create.isPending}
            >
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    <div className="kanban-card">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-bold text-foreground">
          Room {request.roomNumber}
          <span className="ml-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            · Floor {request.floor}
          </span>
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            sev.cls,
          )}
        >
          {sev.label}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
        {request.description}
      </p>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Reported by{" "}
          <span className="font-medium text-foreground">
            {request.reportedBy || "—"}
          </span>{" "}
          · {formatDateShort(request.createdAt)}
        </span>
        {request.status !== "RESOLVED" && request.status !== "CLOSED" && (
          <span className={cn(days > 2 && "font-semibold text-rose-600")}>
            {days}d open
          </span>
        )}
        {(request.status === "RESOLVED" || request.status === "CLOSED") &&
          request.resolvedAt && (
            <span className="text-emerald-600">
              Resolved {formatDateShort(request.resolvedAt)}
            </span>
          )}
      </div>

      {isManager && (isOpen || isInProgress) && (
        <div className="mt-3 flex gap-2">
          {isOpen && (
            <Button
              size="sm"
              className="h-7 bg-amber-500 text-white hover:bg-amber-600"
              onClick={() => move("IN_PROGRESS")}
            >
              Start Work
            </Button>
          )}
          {isInProgress && !showResolve && (
            <Button
              size="sm"
              className="h-7 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => setShowResolve(true)}
            >
              Mark Resolved
            </Button>
          )}
        </div>
      )}

      {showResolve && (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50/60 p-2">
          <Textarea
            rows={2}
            placeholder="Resolution notes (optional)"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            className="bg-white text-xs"
          />
          <div className="mt-2 flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7"
              onClick={() => {
                setShowResolve(false);
                setResolveNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-7 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={async () => {
                await move(
                  "RESOLVED",
                  resolveNotes ? { resolutionNotes: resolveNotes } : {},
                );
                setShowResolve(false);
                setResolveNotes("");
              }}
            >
              Resolve
            </Button>
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
      <div className="kanban-board">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Maintenance
            </h2>
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
              {openCount} open
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Track repairs across housekeeping, engineering, and front-of-house.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setOpenModal(true)}>
          <Plus />
          Report Issue
        </Button>
      </header>

      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div key={col.key} className="kanban-column">
            <div className="kanban-column-header">
              <h3 className="kanban-column-title">{col.label}</h3>
              <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border">
                {columns[col.key].length}
              </span>
            </div>
            <div>
              {columns[col.key].map((req) => (
                <MaintCard key={req.id} request={req} isManager={isManager} />
              ))}
              {columns[col.key].length === 0 && (
                <div className="rounded-md border border-dashed bg-card/60 px-3 py-6 text-center text-xs text-muted-foreground">
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
