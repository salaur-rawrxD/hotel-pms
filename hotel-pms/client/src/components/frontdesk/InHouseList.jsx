import { useMemo, useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import clsx from "clsx";

import { useInHouse } from "../../hooks/useFrontDesk.js";
import { formatCurrency, loyaltyClass } from "./utils.js";
import { Menu as HeadlessMenu } from "@headlessui/react";
import { MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { roomsApi } from "../../api/rooms.js";

export default function InHouseList({ onFolio, onAddCharge, onNote, onQuick, onEarly }) {
  const { data, isLoading } = useInHouse();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const { data: allRooms = [] } = useQuery({
    queryKey: ["rooms", "inhouse-avail"],
    queryFn: () => roomsApi.list(),
  });

  const rows = useMemo(() => {
    let r = [...(data || [])];
    const qq = q.trim().toLowerCase();
    if (qq) {
      r = r.filter(
        (row) =>
          `${row.guest?.firstName} ${row.guest?.lastName}`
            .toLowerCase()
            .includes(qq) || row.room?.number?.toLowerCase().includes(qq),
      );
    }
    if (filter === "vip") r = r.filter((row) => row.vipGuest);
    if (filter === "late") r = r.filter((row) => row.lateCheckOut);
    if (filter === "bal") r = r.filter((row) => Number(row.balanceDue) > 0);
    if (filter === "dnd") r = r.filter((row) => row.doNotDisturb);
    return r;
  }, [data, q, filter]);

  if (isLoading) {
    return <p className="text-slate-500">Loading in-house list…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          placeholder="Name or room…"
          className="h-9 max-w-xs rounded-md border border-navy-600 bg-navy-800/40 px-3 text-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {["all", "vip", "late", "bal", "dnd"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-md px-2 py-1 text-xs capitalize",
              filter === f
                ? "bg-teal/20 text-teal-light"
                : "bg-navy-800 text-slate-400",
            )}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-lg border border-navy-700">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-navy-700 bg-navy-900/40 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-2">Room</th>
              <th className="p-2">Guest</th>
              <th className="p-2">In</th>
              <th className="p-2">Out</th>
              <th className="p-2">Nights</th>
              <th className="p-2">Balance</th>
              <th className="p-2">Status</th>
              <th className="p-2 w-24" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const co = row.checkOut ? new Date(row.checkOut) : null;
              const outLabel = co
                ? isToday(co)
                  ? "today"
                  : isTomorrow(co)
                    ? "tomorrow"
                    : format(co, "MMM d")
                : "—";
              const g = row.guest;
              const name = g ? `${g.firstName} ${g.lastName}` : "—";
              return (
                <tr key={row.id} className="border-b border-navy-800/80">
                  <td className="p-2">
                    <span className="rounded bg-teal/15 px-2 py-0.5 font-mono text-teal-light">
                      {row.room?.number}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200">{name}</span>
                      {g?.loyaltyTier && g.loyaltyTier !== "NONE" && (
                        <span
                          className={clsx(
                            "rounded px-1 text-[10px] font-medium",
                            loyaltyClass(g.loyaltyTier),
                          )}
                        >
                          {g.loyaltyTier[0]}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-slate-400">
                    {row.actualCheckIn
                      ? format(new Date(row.actualCheckIn), "MMM d")
                      : format(new Date(row.checkIn), "MMM d")}
                  </td>
                  <td
                    className={clsx(
                      "p-2",
                      co && isToday(co) && "text-rose-300",
                      co && isTomorrow(co) && "text-amber-200",
                    )}
                  >
                    {outLabel}
                  </td>
                  <td className="p-2 text-slate-300">{row.nightsRemaining}</td>
                  <td
                    className={clsx(
                      "p-2",
                      Number(row.balanceDue) > 0 && "font-medium text-rose-300",
                    )}
                  >
                    {formatCurrency(row.balanceDue)}
                  </td>
                  <td className="p-2 text-lg">
                    {row.vipGuest && <span title="VIP">🌟</span>}
                    {row.doNotDisturb && <span title="DND">🔕</span>}
                    {row.hasWakeUpCall && <span title="Wakeup">⏰</span>}
                    {row.lateCheckOut && <span title="Late CO">🕐</span>}
                  </td>
                  <td className="p-2">
                    <HeadlessMenu as="div" className="relative">
                      <HeadlessMenu.Button className="rounded p-1 text-slate-400 hover:bg-navy-700">
                        <MoreVertical className="h-4 w-4" />
                      </HeadlessMenu.Button>
                      <HeadlessMenu.Items className="absolute right-0 z-20 mt-1 w-44 rounded border border-navy-700 bg-navy-800 py-1 text-xs shadow-lg">
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                "w-full px-2 py-1.5 text-left",
                                active && "bg-navy-700",
                              )}
                              onClick={() => onFolio?.(row)}
                            >
                              View folio
                            </button>
                          )}
                        </HeadlessMenu.Item>
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                "w-full px-2 py-1.5 text-left",
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
                                "w-full px-2 py-1.5 text-left",
                                active && "bg-navy-700",
                              )}
                              onClick={() => onNote?.(row)}
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
                                "w-full px-2 py-1.5 text-left",
                                active && "bg-navy-700",
                              )}
                              onClick={() => onQuick?.(row)}
                            >
                              Quick actions
                            </button>
                          )}
                        </HeadlessMenu.Item>
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={clsx(
                                "w-full px-2 py-1.5 text-left",
                                active && "bg-navy-700",
                              )}
                              onClick={() => onEarly?.(row, allRooms)}
                            >
                              Early departure
                            </button>
                          )}
                        </HeadlessMenu.Item>
                      </HeadlessMenu.Items>
                    </HeadlessMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
