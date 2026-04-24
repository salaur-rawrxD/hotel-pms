import { Menu as HeadlessMenu } from "@headlessui/react";
import { Clock, MoreVertical } from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";

import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";

import { formatCurrency, loyaltyClass } from "./utils.js";

export default function DepartureCard({
  row,
  onCheckOut,
  onViewFolio,
  onLateFee,
  onAddCharge,
  onAddNote,
}) {
  const g = row.guest;
  const name = g ? `${g.firstName} ${g.lastName}` : "Guest";
  const bal = Number(row.balanceDue ?? 0);
  const roomNum = row.room?.number;
  const floor = row.room?.floor;
  const tier = g?.loyaltyTier;
  const showTier = tier && tier !== "NONE";

  return (
    <div className="flex flex-col rounded-xl border border-navy-700 bg-navy-800/50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex items-start gap-3">
          <Avatar name={name} className="h-12 w-12 text-sm" />
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
            <p className="mt-1 text-3xl font-bold text-teal-light">{roomNum}</p>
            <p className="text-xs text-slate-500">Floor {floor}</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1 text-sm text-slate-300">
          <p>
            Nights {row.nightsStayed ?? "—"}{" "}
            {row.checkIn
              ? `· in ${format(new Date(row.checkIn), "MMM d")}`
              : ""}{" "}
            → out today
          </p>
          <p className="text-2xl font-bold text-rose-300">
            Balance {formatCurrency(bal)}
          </p>
          <p className="text-xs text-slate-500">Room {formatCurrency(row.roomTotal || 0)}</p>
          <p className="text-xs text-slate-500">Extras {formatCurrency(row.extrasTotal || 0)}</p>
          <p className="text-xs text-slate-500">Tax {formatCurrency(row.taxTotal || 0)}</p>
          <p className="font-medium text-slate-100">Total due {formatCurrency(row.totalDue ?? row.totalCharges)}</p>
        </div>

        <div className="w-full min-w-0 text-sm lg:max-w-xs lg:text-right">
          {row.lateCheckOut && (
            <p className="mb-1 inline-flex items-center justify-end gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-amber-100">
              <Clock className="h-3.5 w-3.5" />
              Late checkout
            </p>
          )}
          {row.doNotDisturb && (
            <p className="mb-1 text-slate-400">
              DND
            </p>
          )}
          <p className="text-slate-400">Payment: {row.paymentMethod ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-navy-700 pt-3">
        <Button
          variant="danger"
          type="button"
          onClick={() => onCheckOut?.(row)}
        >
          Check out{bal > 0 ? ` ${formatCurrency(bal)}` : ""}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={() => onViewFolio?.(row)}
        >
          View folio
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => onLateFee?.(row)}
        >
          Late checkout
        </Button>
        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-navy-600 text-slate-300 hover:bg-navy-700">
            <MoreVertical className="h-4 w-4" />
          </HeadlessMenu.Button>
          <HeadlessMenu.Items className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-navy-700 bg-navy-800 py-1 shadow-xl focus:outline-none">
            <HeadlessMenu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={clsx(
                    "w-full px-3 py-2 text-left text-sm",
                    active && "bg-navy-700",
                  )}
                  onClick={() => onAddCharge?.(row)}
                >
                  Add charge
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
                  onClick={() => onAddNote?.(row)}
                >
                  Add note
                </button>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <span
                  className={clsx(
                    "block px-3 py-2 text-xs text-slate-500",
                    active && "bg-navy-700",
                  )}
                >
                  Print folio (browser)
                </span>
              )}
            </HeadlessMenu.Item>
            <HeadlessMenu.Item>
              {({ active }) => (
                <span
                  className={clsx(
                    "block px-3 py-2 text-xs text-slate-500",
                    active && "bg-navy-700",
                  )}
                >
                  Extend stay (use reservation)
                </span>
              )}
            </HeadlessMenu.Item>
          </HeadlessMenu.Items>
        </HeadlessMenu>
      </div>
    </div>
  );
}
