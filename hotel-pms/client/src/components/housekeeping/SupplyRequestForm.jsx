import { useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { CheckCircle2, Package, Send } from "lucide-react";

import { useAuthStore } from "../../store/authStore.js";
import {
  useCreateSupplyRequest,
  useSupplyRequests,
  useUpdateSupplyRequest,
} from "../../hooks/useHousekeeping.js";
import { formatRelative } from "../../utils/formatDate.js";
import { URGENCY_META } from "./helpers.js";

export default function SupplyRequestForm() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data, isLoading } = useSupplyRequests();
  const create = useCreateSupplyRequest();
  const update = useUpdateSupplyRequest();

  const [form, setForm] = useState({
    items: "",
    quantity: "",
    urgency: "NORMAL",
    notes: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.items.trim() || !form.quantity.trim()) {
      toast.error("Item and quantity are required");
      return;
    }
    try {
      await create.mutateAsync({ ...form, requestedBy: user?.name });
      toast.success("Request submitted");
      setForm({ items: "", quantity: "", urgency: "NORMAL", notes: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to submit");
    }
  };

  const fulfill = async (id) => {
    try {
      await update.mutateAsync({ id, status: "FULFILLED" });
      toast.success("Marked fulfilled");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Unable to update");
    }
  };

  const items = data ?? [];
  const pending = items.filter((i) => i.status === "PENDING");
  const fulfilled = items.filter((i) => i.status === "FULFILLED");

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      {/* Active requests list */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <header className="mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-teal" />
          <h2 className="font-serif text-xl font-bold text-navy-900">
            Supply Requests
          </h2>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {pending.length} pending
          </span>
        </header>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {pending.map((r) => {
                const meta = URGENCY_META[r.urgency] ?? URGENCY_META.NORMAL;
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/40 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-900">
                        {r.items}
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          Qty {r.quantity}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {r.requestedBy ?? "—"} · {formatRelative(r.createdAt)}
                      </p>
                      {r.notes && (
                        <p className="mt-1 text-xs text-slate-600">{r.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={clsx(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          meta.bg,
                          meta.text,
                        )}
                      >
                        {meta.label}
                      </span>
                      {isManager ? (
                        <button
                          type="button"
                          onClick={() => fulfill(r.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Fulfill
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {pending.length === 0 && (
                <div className="rounded-md border border-dashed border-slate-200 px-3 py-8 text-center text-sm text-slate-400">
                  No pending requests.
                </div>
              )}
            </div>

            {fulfilled.length > 0 && (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700">
                  Fulfilled ({fulfilled.length})
                </summary>
                <div className="mt-2 space-y-1.5">
                  {fulfilled.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50/40 px-3 py-1.5 text-xs"
                    >
                      <span className="truncate text-slate-600">
                        {r.items} · qty {r.quantity}
                      </span>
                      <span className="text-emerald-600">
                        ✓ {formatRelative(r.fulfilledAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </section>

      {/* New request form */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-serif text-lg font-bold text-navy-900">
          Request Supplies
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Use this form to request cleaning supplies from the supervisor.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Item name *
            </label>
            <input
              type="text"
              value={form.items}
              onChange={(e) => setForm((f) => ({ ...f, items: e.target.value }))}
              placeholder="e.g. Queen pillow cases"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quantity needed *
            </label>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              placeholder="20"
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Urgency
            </span>
            <div className="mt-1 flex gap-4 text-sm">
              {["NORMAL", "URGENT"].map((u) => (
                <label key={u} className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="urgency"
                    value={u}
                    checked={form.urgency === u}
                    onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                    className="text-teal focus:ring-teal"
                  />
                  {u === "URGENT" ? "Urgent" : "Normal"}
                </label>
              ))}
            </div>
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
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-dark disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Submit Request
          </button>
        </form>
      </section>
    </div>
  );
}
