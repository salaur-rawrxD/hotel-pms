import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { format } from "date-fns";

import Modal from "../layout/Modal.jsx";
import LegacyButton from "../ui/LegacyButton.jsx";
import {
  useFolioItemMutation,
  useCheckOutMutation,
  useGuestFolioQuery,
} from "../../hooks/useFrontDesk.js";
import { useAuthStore } from "../../store/authStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";
import { useRemoveFolioItemMutation } from "../../hooks/useFrontDesk.js";
import { formatCurrency } from "./utils.js";

function groupLabel(type) {
  if (type === "ROOM") return "Room charges";
  if (type === "TAX") return "Tax";
  if (type === "FOOD" || type === "BEVERAGE") return "Food & beverage";
  if (type === "PAYMENT") return "Payments";
  return "Other";
}

export default function CheckOutModal({ open, onClose, reservation, onSuccess }) {
  const [paymentMode, setPaymentMode] = useState("CARD");
  const [amountPay, setAmountPay] = useState("");
  const [rating, setRating] = useState(0);
  const [emailReceipt, setEmailReceipt] = useState(true);
  const [feedback, setFeedback] = useState("");
  const addFolio = useFolioItemMutation();
  const checkOutM = useCheckOutMutation();
  const removeFolio = useRemoveFolioItemMutation();
  const canVoid = useAuthStore((s) =>
    s.hasRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  );
  const { data: folioData, refetch: refetchFolio } = useGuestFolioQuery(
    open && reservation?.id ? reservation.id : null,
  );

  const res = reservation;
  const items = (
    folioData?.folioItems ||
    (res?.folio || []).map((f) => ({ ...f, postedBy: null }))
  ).filter((f) => !f.voidedAt);
  const balance = useMemo(
    () => items.reduce((s, f) => s + Number(f.amount), 0),
    [items],
  );
  const room = res?.room;

  function itemsByType() {
    const m = new Map();
    for (const f of items) {
      const key = groupLabel(f.type);
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(f);
    }
    return m;
  }

  async function payAndCheckout() {
    if (!res) return;
    try {
      if (balance > 0.01) {
        if (paymentMode === "OTA") {
          await addFolio.mutateAsync({
            id: res.id,
            data: {
              description: "OTA collect / prepaid",
              amount: (-Math.abs(balance)).toFixed(2),
              type: "PAYMENT",
            },
          });
        } else if (
          paymentMode === "CARD" ||
          paymentMode === "CASH" ||
          paymentMode === "BILL"
        ) {
          const pay = amountPay ? Number(amountPay) : balance;
          await addFolio.mutateAsync({
            id: res.id,
            data: {
              description: `Payment — ${paymentMode}`,
              amount: (-Math.abs(pay)).toFixed(2),
              type: "PAYMENT",
            },
          });
        }
        await refetchFolio();
      }
      await checkOutM.mutateAsync({
        id: res.id,
        data: {
          paymentCaptured: true,
          rating,
          feedback: feedback || undefined,
          stayNote: emailReceipt
            ? `Email receipt: ${res.guest?.email ?? ""}`
            : undefined,
        },
      });
      onSuccess?.();
      toast.success(
        `${res.guest?.firstName ?? "Guest"} checked out from room ${room?.number ?? "—"}`,
      );
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Check-out failed");
    }
  }

  if (!res) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Checkout — room ${room?.number}`} size="lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-200">Final folio</h3>
          <div className="max-h-64 space-y-3 overflow-y-auto pr-1 text-sm">
            {[...itemsByType().entries()].map(([label, list]) => (
              <div key={label}>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <ul className="mt-1 space-y-1">
                  {list.map((line) => (
                    <li
                      key={line.id}
                      className="flex justify-between gap-2 border-b border-navy-800/80 py-0.5"
                    >
                      <span className="text-slate-300">
                        {format(new Date(line.postedAt), "MMM d p")} —{" "}
                        {line.description}
                      </span>
                      <span
                        className={clsx(
                          Number(line.amount) < 0
                            ? "text-emerald-300"
                            : "text-slate-200",
                        )}
                      >
                        {formatCurrency(line.amount)}
                      </span>
                      {canVoid && line.type !== "PAYMENT" && (
                        <button
                          type="button"
                          className="text-xs text-rose-300"
                            onClick={() => {
                            if (window.confirm("Void this line?")) {
                              removeFolio.mutate(
                                { id: res.id, itemId: line.id },
                                { onSuccess: () => refetchFolio() },
                              );
                            }
                          }}
                        >
                          void
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p
            className={clsx(
              "mt-4 text-lg font-bold",
              balance > 0.01 ? "text-rose-300" : "text-emerald-300",
            )}
          >
            Balance due: {formatCurrency(balance)}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-slate-200">Payment &amp; close</p>
          <div className="space-y-1">
            {[
              ["Card on file", "CARD"],
              ["Cash", "CASH"],
              ["Direct bill", "BILL"],
              ["Already paid (OTA)", "OTA"],
            ].map(([label, val]) => (
              <label
                key={val}
                className="flex items-center gap-2"
              >
                <input
                  type="radio"
                  name="pm"
                  checked={paymentMode === val}
                  onChange={() => setPaymentMode(val)}
                />
                {label}
              </label>
            ))}
          </div>
          {Math.abs(balance) < 0.01 ? (
            <p className="text-emerald-300">Fully settled — ready to check out</p>
          ) : (
            <div>
              <label className="text-xs text-slate-500">Amount to post</label>
              <input
                className="mt-1 w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
                value={amountPay}
                placeholder={String(balance.toFixed(2))}
                onChange={(e) => setAmountPay(e.target.value)}
              />
            </div>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={emailReceipt}
              onChange={(e) => setEmailReceipt(e.target.checked)}
            />
            Email receipt to {res.guest?.email ?? "guest"}
          </label>
          <p className="text-xs text-slate-500">How was the stay? (optional)</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={clsx(
                  "h-8 w-8 rounded",
                  rating === n ? "bg-gold/30 text-gold" : "bg-navy-800",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {["Great stay", "Clean room", "Friendly staff"].map((t) => (
              <button
                key={t}
                type="button"
                className="rounded border border-navy-600 px-2 py-0.5"
                onClick={() => setFeedback(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <LegacyButton
            variant="gold"
            className="!w-full"
            type="button"
            loading={addFolio.isPending || checkOutM.isPending}
            onClick={payAndCheckout}
          >
            Complete check-out
          </LegacyButton>
        </div>
      </div>
    </Modal>
  );
}
