import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Package, Send } from "lucide-react";

import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { Textarea } from "../ui/textarea.jsx";
import { cn } from "../../lib/utils.js";
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
      <section className="section-card">
        <header className="section-card-header">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-teal" />
            <h2 className="section-card-title">Supply Requests</h2>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {pending.length} pending
          </span>
        </header>
        <div className="section-card-body">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
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
                      className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {r.items}
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Qty {r.quantity}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {r.requestedBy ?? "—"} · {formatRelative(r.createdAt)}
                        </p>
                        {r.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            meta.cls,
                          )}
                        >
                          {meta.label}
                        </span>
                        {isManager ? (
                          <Button
                            size="sm"
                            className="h-7 bg-emerald-600 text-white hover:bg-emerald-700"
                            onClick={() => fulfill(r.id)}
                          >
                            <CheckCircle2 />
                            Fulfill
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {pending.length === 0 && (
                  <div className="rounded-md border border-dashed px-3 py-8 text-center text-sm text-muted-foreground">
                    No pending requests.
                  </div>
                )}
              </div>

              {fulfilled.length > 0 && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                    Fulfilled ({fulfilled.length})
                  </summary>
                  <div className="mt-2 space-y-1.5">
                    {fulfilled.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-xs"
                      >
                        <span className="truncate text-muted-foreground">
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
        </div>
      </section>

      <section className="section-card">
        <header className="section-card-header">
          <h3 className="section-card-title">Request Supplies</h3>
        </header>
        <div className="section-card-body">
          <p className="mb-4 text-sm text-muted-foreground">
            Request cleaning supplies from the supervisor.
          </p>
          <form onSubmit={submit} className="form-section">
            <div>
              <Label className="field-label">Item name *</Label>
              <Input
                value={form.items}
                onChange={(e) =>
                  setForm((f) => ({ ...f, items: e.target.value }))
                }
                placeholder="e.g. Queen pillow cases"
              />
            </div>
            <div>
              <Label className="field-label">Quantity needed *</Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantity: e.target.value }))
                }
                placeholder="20"
              />
            </div>
            <div>
              <Label className="field-label">Urgency</Label>
              <RadioGroup
                value={form.urgency}
                onValueChange={(v) => setForm((f) => ({ ...f, urgency: v }))}
                className="flex gap-4"
              >
                <Label className="inline-flex items-center gap-2 text-sm font-normal">
                  <RadioGroupItem value="NORMAL" />
                  Normal
                </Label>
                <Label className="inline-flex items-center gap-2 text-sm font-normal">
                  <RadioGroupItem value="URGENT" />
                  Urgent
                </Label>
              </RadioGroup>
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
            <Button
              type="submit"
              disabled={create.isPending}
              className="w-full"
            >
              <Send />
              Submit Request
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
