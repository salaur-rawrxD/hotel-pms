import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

import LegacyButton from "../ui/LegacyButton.jsx";
import {
  useGuestFolioQuery,
  useFolioItemMutation,
  useRemoveFolioItemMutation,
} from "../../hooks/useFrontDesk.js";
import { useAuthStore } from "../../store/authStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";
import { formatCurrency } from "./utils.js";

export default function FolioDrawer({ open, onClose, reservationId, guestName }) {
  const { data, isLoading, refetch } = useGuestFolioQuery(
    open ? reservationId : null,
  );
  const [d, setD] = useState("");
  const [a, setA] = useState("");
  const [t, setT] = useState("OTHER");
  const add = useFolioItemMutation();
  const remove = useRemoveFolioItemMutation();
  const canVoid = useAuthStore((s) =>
    s.hasRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  );

  async function postCharge() {
    if (!d || !a) {
      toast.error("Description and amount required");
      return;
    }
    try {
      await add.mutateAsync({
        id: reservationId,
        data: { description: d, amount: a, type: t },
      });
      setD("");
      setA("");
      refetch();
    } catch (e) {
      toast.error(e?.response?.data?.message ?? "Failed");
    }
  }

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
          <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex justify-end p-0">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="flex h-full w-full max-w-md flex-col border-l border-navy-700 bg-navy-800 shadow-2xl">
              <div className="flex items-center justify-between border-b border-navy-700 px-4 py-3">
                <div>
                  <Dialog.Title className="font-serif text-lg text-slate-50">
                    Folio — {guestName}
                  </Dialog.Title>
                  {data && (
                    <p className="text-xs text-slate-500">
                      {data.room?.number} · {data.roomType?.name} · {data.status}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1 text-slate-400 hover:bg-navy-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4 text-sm">
                {isLoading && <p className="text-slate-500">Loading…</p>}
                {data?.folioItems && (
                  <ul className="space-y-2">
                    {data.folioItems.map((line) => (
                      <li
                        key={line.id}
                        className="flex justify-between gap-2 border-b border-navy-800/80 py-1"
                      >
                        <div>
                          <p className="text-slate-200">{line.description}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(line.postedAt), "MMM d p")} ·{" "}
                            {line.type}
                            {line.postedBy?.name && ` · ${line.postedBy.name}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>{formatCurrency(line.amount)}</p>
                          {canVoid && (
                            <button
                              type="button"
                              className="text-xs text-rose-300"
                              onClick={() => {
                                if (window.confirm("Void this line?")) {
                                  remove.mutate(
                                    { id: reservationId, itemId: line.id },
                                    { onSuccess: () => refetch() },
                                  );
                                }
                              }}
                            >
                              void
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border-t border-navy-700 bg-navy-900/40 p-4 text-sm">
                <p className="text-xs text-slate-500">Running totals</p>
                <p>Room {formatCurrency(data?.totalRoomCharges)}</p>
                <p>Tax {formatCurrency(data?.totalTax)}</p>
                <p className="font-bold text-slate-100">
                  Balance {formatCurrency(data?.balanceDue)}
                </p>
                <div className="mt-3 space-y-1">
                  <input
                    className="w-full rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
                    placeholder="Description"
                    value={d}
                    onChange={(e) => setD(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded border border-navy-600 bg-navy-900/40 px-2 py-1"
                      placeholder="Amount"
                      value={a}
                      onChange={(e) => setA(e.target.value)}
                    />
                    <select
                      className="rounded border border-navy-600 bg-navy-900/40 px-1"
                      value={t}
                      onChange={(e) => setT(e.target.value)}
                    >
                      <option value="ROOM">Room</option>
                      <option value="FOOD">F&amp;B</option>
                      <option value="PARKING">Parking</option>
                      <option value="OTHER">Other</option>
                      <option value="DISCOUNT">Discount</option>
                    </select>
                  </div>
                  <LegacyButton
                    type="button"
                    size="sm"
                    onClick={postCharge}
                    loading={add.isPending}
                  >
                    Post charge
                  </LegacyButton>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
