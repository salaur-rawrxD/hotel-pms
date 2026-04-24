import { Menu as HeadlessMenu } from "@headlessui/react";
import { AlertCircle, CheckCircle, MoreVertical, Star } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";

import LegacyButton from "../ui/LegacyButton.jsx";
import InitialsAvatar from "../ui/InitialsAvatar.jsx";
import SimpleTooltip from "../ui/SimpleTooltip.jsx";
import { reservationsApi } from "../../api/reservations.js";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";

import ChannelBadge from "./ChannelBadge.jsx";
import { formatCurrency, loyaltyClass } from "./utils.js";
import { useQuickActionMutation } from "../../hooks/useFrontDesk.js";

export default function ArrivalCard({
  row,
  onCheckIn,
  onViewFolio,
  onAssignRoom,
  onAddNote,
}) {
  const qc = useQueryClient();
  const g = row.guest;
  const name = g ? `${g.firstName} ${g.lastName}` : "Guest";
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const qm = useQuickActionMutation();
  const canCancel = useAuthStore((s) =>
    s.hasRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  );

  const tier = g?.loyaltyTier;
  const roomNum = row.room?.number;
  const hasRoom = Boolean(row.roomId);
  const balance = Number(row.balanceDue ?? 0);
  const deposit = Number(row.depositPaid ?? 0);
  const total = Number(row.totalAmount ?? 0);
  const paid = deposit > 0 && total > 0 && deposit >= total * 0.99;
  const showTier = tier && tier !== "NONE";

  async function markVip() {
    try {
      await qm.mutateAsync({ id: row.id, data: { action: "vipGuest" } });
      toast.success("VIP updated");
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

  async function cancelRes() {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await reservationsApi.update(row.id, { status: "CANCELLED" });
      toast.success("Reservation cancelled");
      qc.invalidateQueries({ queryKey: ["frontdesk"] });
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed to cancel");
    }
  }

  function submitNote() {
    onAddNote?.(noteText);
    setNoteText("");
    setNoteOpen(false);
  }

  return (
    <div
      className={clsx(
        "flex flex-col rounded-xl border border-navy-700 bg-navy-800/50 p-4 shadow-sm",
        row.vipGuest && "ring-1 ring-gold/30",
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={clsx(
              "relative",
              row.vipGuest && "rounded-full p-0.5 ring-2 ring-gold",
            )}
          >
            <InitialsAvatar name={name} className="h-12 w-12 text-sm" />
          </div>
          <div>
            <p className="font-serif text-base font-semibold text-slate-50">
              {name}
            </p>
            {showTier && (
              <span
                className={clsx(
                  "mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium",
                  loyaltyClass(tier),
                )}
              >
                {tier}
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="text-xs text-slate-500">
            Conf. {row.confirmationNumber}
          </p>
          <p className="text-slate-300">
            {row.roomType?.name ?? "Room type"}{" "}
            {row.earlyCheckIn && (
              <span className="ml-1 rounded bg-teal/20 px-1.5 text-xs text-teal-light">
                Early check-in
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {hasRoom ? (
              <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-sm font-medium text-emerald-300">
                {roomNum}
              </span>
            ) : (
              <>
                <span className="inline-flex items-center rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-200">
                  No room
                </span>
                <LegacyButton
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => onAssignRoom?.(row)}
                >
                  Assign room
                </LegacyButton>
              </>
            )}
          </div>
          <p className="text-slate-400">
            {row.nightsStaying ?? "—"} nights · {row.adults}A{" "}
            {row.children ? `${row.children}C` : ""} · out{" "}
            {row.checkOut
              ? format(new Date(row.checkOut), "MMM d, yyyy")
              : "—"}
          </p>
        </div>

        <div className="w-full min-w-0 text-sm lg:max-w-xs lg:text-right">
          <div className="mb-1 flex flex-wrap items-center justify-end gap-1">
            <ChannelBadge source={row.source} />
            {row.ratePlan && (
              <span className="text-slate-400">{row.ratePlan.name}</span>
            )}
          </div>
          {row.specialRequests && (
            <SimpleTooltip
              content={row.specialRequests}
              side="left"
            >
              <span className="mb-1 inline-flex cursor-default items-center gap-1 text-amber-200">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">Special requests</span>
              </span>
            </SimpleTooltip>
          )}
          {row.vipGuest && (
            <span className="mb-1 flex items-center justify-end gap-1 text-gold text-xs">
              <Star className="h-3.5 w-3.5" /> VIP
            </span>
          )}
          <div>
            {paid || balance <= 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <CheckCircle className="h-4 w-4" />
                {deposit > 0 ? "Deposit paid" : "Balance OK"}
              </span>
            ) : (
              <span className="font-medium text-rose-300">
                Balance {formatCurrency(balance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {noteOpen && (
        <div className="mt-3 space-y-2 border-t border-navy-700 pt-3">
          <label className="text-xs text-slate-400">Add note</label>
          <textarea
            className="w-full rounded-md border border-navy-600 bg-navy-900/40 px-3 py-2 text-sm text-slate-100"
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex gap-2">
            <LegacyButton
              type="button"
              size="sm"
              onClick={submitNote}
            >
              Save
            </LegacyButton>
            <LegacyButton
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setNoteOpen(false)}
            >
              Cancel
            </LegacyButton>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-700 pt-3">
        <LegacyButton
          variant="primary"
          type="button"
          disabled={!hasRoom}
          onClick={() => onCheckIn?.(row)}
        >
          Check in
        </LegacyButton>
        <LegacyButton
          variant="secondary"
          type="button"
          onClick={() => onViewFolio?.(row)}
        >
          View folio
        </LegacyButton>
        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-navy-600 text-slate-300 hover:bg-navy-700">
            <MoreVertical className="h-4 w-4" />
          </HeadlessMenu.Button>
          <HeadlessMenu.Items className="absolute right-0 z-20 mt-1 w-52 rounded-md border border-navy-700 bg-navy-800 py-1 shadow-xl focus:outline-none">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm",
                    active && "bg-navy-700",
                  )}
                  onClick={() => setNoteOpen((v) => !v)}
                >
                  Add note
                </button>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm",
                    active && "bg-navy-700",
                  )}
                  onClick={() => onAssignRoom?.(row)}
                >
                  Assign room
                </button>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm",
                    active && "bg-navy-700",
                  )}
                  onClick={markVip}
                >
                  Mark VIP
                </button>
              )}
            </HeadlessMenu.Item>
            {canCancel && (
              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    className={clsx(
                      "w-full px-3 py-2 text-left text-sm text-rose-200",
                      active && "bg-navy-700",
                    )}
                    onClick={cancelRes}
                  >
                    Cancel reservation
                  </button>
                )}
              </HeadlessMenu.Item>
            )}
          </HeadlessMenu.Items>
        </HeadlessMenu>
      </div>
    </div>
  );
}
