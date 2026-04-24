import { Fragment, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { Plus, X } from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
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
                  Log Found Item
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
                    Item description *
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Blue iPhone charger, Apple brand"
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Found by *
                    </label>
                    <input
                      type="text"
                      value={form.foundBy}
                      onChange={(e) => setForm((f) => ({ ...f, foundBy: e.target.value }))}
                      placeholder="Staff name"
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date found
                    </label>
                    <input
                      type="date"
                      value={form.foundAt}
                      onChange={(e) => setForm((f) => ({ ...f, foundAt: e.target.value }))}
                      className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Guest name (if known)
                  </label>
                  <input
                    type="text"
                    value={form.guestName}
                    onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
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
                    className="rounded-md bg-teal px-3 py-2 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
                  >
                    Log Item
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

function StatusBadge({ status }) {
  const meta = LF_STATUS_META[status] ?? LF_STATUS_META.UNCLAIMED;
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.bg,
        meta.text,
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
        <input
          type="text"
          placeholder="Guest name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          className="w-28 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
        />
        <button
          type="button"
          onClick={async () => {
            if (!guestName.trim()) return toast.error("Guest name required");
            await update.mutateAsync({ id: item.id, status: "CLAIMED", guestName });
            toast.success("Marked as claimed");
            setShowClaim(false);
            setGuestName("");
          }}
          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setShowClaim(false)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => setShowClaim(true)}
        className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
      >
        Mark Claimed
      </button>
    );
  }
  if (item.status === "CLAIMED") {
    return (
      <button
        type="button"
        onClick={async () => {
          await update.mutateAsync({ id: item.id, status: "RETURNED" });
          toast.success("Marked as returned");
        }}
        className="rounded-md bg-teal/10 px-2 py-1 text-xs font-semibold text-teal-dark hover:bg-teal/20"
      >
        Mark Returned
      </button>
    );
  }
  return <span className="text-xs text-slate-400">—</span>;
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
          <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-navy-900">
            Lost &amp; Found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"} logged
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Log Found Item
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Date Found</th>
              <th className="px-4 py-2.5">Room</th>
              <th className="px-4 py-2.5">Description</th>
              <th className="px-4 py-2.5">Found By</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Guest</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-600">
                  {formatDateShort(it.foundAt)}
                </td>
                <td className="px-4 py-3 font-mono font-semibold text-navy-900">
                  {it.roomNumber}
                </td>
                <td className="px-4 py-3 text-navy-900">{it.description}</td>
                <td className="px-4 py-3 text-slate-600">{it.foundBy}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={it.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {it.guestName ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <RowActions item={it} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-400"
                >
                  Nothing logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <LogItemModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        rooms={rooms}
      />
    </div>
  );
}
