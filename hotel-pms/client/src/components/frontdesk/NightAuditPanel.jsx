import { useState } from "react";
import { format } from "date-fns";

import { useNightAudit } from "../../hooks/useFrontDesk.js";
import { useAuthStore } from "../../store/authStore.js";
import { USER_ROLES } from "../../constants/userRoles.js";
import Button from "../ui/Button.jsx";
import { formatCurrency } from "./utils.js";

const CHECKLIST = [
  "All arrivals processed",
  "All departures processed",
  "No-shows marked",
  "Folios balanced",
  "Cash drawer counted",
  "Housekeeping report reviewed",
];

export default function NightAuditPanel() {
  const { data, isLoading } = useNightAudit();
  const [checks, setChecks] = useState(() => CHECKLIST.map(() => false));
  const canClose = useAuthStore((s) =>
    s.hasRole(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  );

  if (isLoading || !data) {
    return <p className="text-slate-500">Loading night audit…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-slate-100">Night audit</h2>
        <p className="text-sm text-slate-500">
          {format(new Date(data.date), "PPP")} · Run by {data.runBy ?? "—"} ·{" "}
          {format(new Date(data.time), "p")}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Arrivals today", data.totalArrivals],
          ["Departures today", data.totalDepartures],
          ["No-shows", data.noShows],
          ["In-house", data.inHouseCount],
          ["Rooms occupied", data.roomsOccupied],
          ["Occupancy %", `${data.occupancyPercent}%`],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-lg border border-navy-700 bg-navy-800/50 p-4"
          >
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-50">{val}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-4">
        <p className="mb-2 text-sm font-medium text-slate-200">Revenue</p>
        <ul className="space-y-1 text-sm text-slate-300">
          <li className="flex justify-between">
            <span>Room revenue</span>
            <span>{formatCurrency(data.roomRevenue)}</span>
          </li>
          <li className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(data.totalTax)}</span>
          </li>
          <li className="flex justify-between">
            <span>F&amp;B</span>
            <span>{formatCurrency(data.fAndBRevenue)}</span>
          </li>
          <li className="flex justify-between">
            <span>Other</span>
            <span>{formatCurrency(data.otherCharges)}</span>
          </li>
          <li className="flex justify-between border-t border-navy-700 pt-2 font-medium text-slate-100">
            <span>Total</span>
            <span>{formatCurrency(data.totalRevenueAll)}</span>
          </li>
        </ul>
      </div>
      <div className="rounded-lg border border-navy-700 bg-navy-800/40 p-4">
        <p className="mb-2 text-sm font-medium text-slate-200">
          Outstanding balances ({formatCurrency(data.outstandingBalances)})
        </p>
        <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
          {(data.outstandingList || []).map((o) => (
            <li key={o.id} className="flex justify-between text-slate-300">
              <span>
                {o.name} · {o.room}
              </span>
              <span>{formatCurrency(o.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-sm text-slate-400">Audit checklist</p>
        <ul className="space-y-2">
          {CHECKLIST.map((label, i) => (
            <label key={label} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) => {
                  const n = [...checks];
                  n[i] = e.target.checked;
                  setChecks(n);
                }}
              />
              {label}
            </label>
          ))}
        </ul>
        {canClose && (
          <Button
            className="mt-4"
            variant="secondary"
            type="button"
            onClick={() => {
              if (window.confirm("Close the day in the system?")) {
                // local confirmation only — wire to backend when audit model exists
              }
            }}
          >
            Close day
          </Button>
        )}
      </div>
    </div>
  );
}
