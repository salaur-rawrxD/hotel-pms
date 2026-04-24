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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { cn } from "../../lib/utils.js";
import {
  useCreateLostAndFound,
  useFloorMap,
  useLostAndFound,
  useUpdateLostAndFound,
} from "../../hooks/useHousekeeping.js";
import { formatDateShort } from "../../utils/formatDate.js";
import { LF_STATUS_META } from "./helpers.js";

function LogItemModal({ open, onClose, rooms }) {
  const [form, setForm] = useState({
    roomId: "",
    description: "",
    foundBy: "",
    foundAt: new Date().toISOString().slice(0, 10),
    guestName: "",
    notes: "",
  });
  const create = useCreateLostAndFound();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.roomId || !form.description || !form.foundBy) {
      toast.error("Room, description, and found-by are required");
      return;
    }
    try {
      await create.mutateAsync({
        ...form,
        foundAt: form.foundAt ? new Date(form.foundAt).toISOString() : undefined,
      });
      toast.success("Item logged");
      setForm({
        roomId: "",
        description: "",
        foundBy: "",
        foundAt: new Date().toISOString().slice(0, 10),
        guestName: "",
        notes: "",
      });
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to log item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            Log Found Item
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
            <Label className="field-label">Item description *</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="e.g. Blue iPhone charger, Apple brand"
            />
          </div>
          <div className="form-row">
            <div>
              <Label className="field-label">Found by *</Label>
              <Input
                type="text"
                value={form.foundBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, foundBy: e.target.value }))
                }
                placeholder="Staff name"
              />
            </div>
            <div>
              <Label className="field-label">Date found</Label>
              <Input
                type="date"
                value={form.foundAt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, foundAt: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <Label className="field-label">Guest name (if known)</Label>
            <Input
              type="text"
              value={form.guestName}
              onChange={(e) =>
                setForm((f) => ({ ...f, guestName: e.target.value }))
              }
            />
          </div>
          <div>
            <Label className="field-label">Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              Log Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LafStatusBadge({ status }) {
  const meta = LF_STATUS_META[status] ?? LF_STATUS_META.UNCLAIMED;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.cls,
      )}
    >
      {meta.label}
    </span>
  );
}

function RowActions({ item }) {
  const update = useUpdateLostAndFound();
  const [showClaim, setShowClaim] = useState(false);
  const [guestName, setGuestName] = useState("");

  if (item.status === "UNCLAIMED") {
    return showClaim ? (
      <div className="flex items-center gap-1.5">
        <Input
          placeholder="Guest name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="h-8 w-32 text-xs"
        />
        <Button
          size="sm"
          className="h-8 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={async () => {
            if (!guestName.trim()) return toast.error("Guest name required");
            await update.mutateAsync({
              id: item.id,
              status: "CLAIMED",
              guestName,
            });
            toast.success("Marked as claimed");
            setShowClaim(false);
            setGuestName("");
          }}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => setShowClaim(false)}
        >
          Cancel
        </Button>
      </div>
    ) : (
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
        onClick={() => setShowClaim(true)}
      >
        Mark Claimed
      </Button>
    );
  }
  if (item.status === "CLAIMED") {
    return (
      <Button
        size="sm"
        variant="outline"
        className="h-8 border-teal/30 bg-teal/10 text-teal hover:bg-teal/20"
        onClick={async () => {
          await update.mutateAsync({ id: item.id, status: "RETURNED" });
          toast.success("Marked as returned");
        }}
      >
        Mark Returned
      </Button>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}

export default function LostAndFoundLog() {
  const { data, isLoading } = useLostAndFound();
  const { data: floorData } = useFloorMap();
  const [openModal, setOpenModal] = useState(false);

  const rooms = useMemo(() => {
    const out = [];
    for (const floor of floorData ?? []) {
      for (const r of floor.rooms) out.push(r);
    }
    return out;
  }, [floorData]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground">
            Lost &amp; Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"} logged
          </p>
        </div>
        <Button onClick={() => setOpenModal(true)}>
          <Plus />
          Log Found Item
        </Button>
      </header>

      <div className="section-card overflow-hidden">
        <Table className="data-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date Found</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Found By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell className="text-muted-foreground">
                  {formatDateShort(it.foundAt)}
                </TableCell>
                <TableCell className="font-mono font-semibold text-foreground">
                  {it.roomNumber}
                </TableCell>
                <TableCell className="text-foreground">
                  {it.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {it.foundBy}
                </TableCell>
                <TableCell>
                  <LafStatusBadge status={it.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {it.guestName ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <RowActions item={it} />
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Nothing logged yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LogItemModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        rooms={rooms}
      />
    </div>
  );
}
