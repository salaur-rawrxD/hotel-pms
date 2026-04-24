import { useMemo } from "react";
import {
  BedDouble,
  CheckCircle2,
  Eye,
  Loader2,
  Users,
  Wrench,
} from "lucide-react";

import {
  useAssignments,
  useFloorMap,
  useMaintenanceRequests,
} from "../../hooks/useHousekeeping.js";

function StatCard({ icon: Icon, value, label, tint = "text-teal" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className={`grid h-10 w-10 place-items-center rounded-lg bg-slate-50 ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-serif text-2xl font-bold leading-none text-navy-900">
          {value}
        </p>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function HousekeepingStats() {
  const assignments = useAssignments();
  const floorMap = useFloorMap();
  const maintenance = useMaintenanceRequests();

  const stats = useMemo(() => {
    let dirty = 0;
    let inProgress = 0;
    let inspected = 0;
    let done = 0;
    for (const floor of floorMap.data ?? []) {
      for (const room of floor.rooms ?? []) {
        if (room.status === "DIRTY") dirty += 1;
      }
    }
    for (const s of assignments.data?.assignments ?? []) {
      inProgress += s.stats?.inProgress ?? 0;
      inspected  += s.stats?.inspected  ?? 0;
      done       += s.stats?.done       ?? 0;
    }
    const openMaint = (maintenance.data ?? []).filter(
      (m) => m.status !== "RESOLVED" && m.status !== "CLOSED",
    ).length;
    const staffOnDuty = (assignments.data?.assignments ?? []).length;

    return {
      dirty,
      inProgress,
      inspected,
      done,
      openMaint,
      staffOnDuty,
    };
  }, [assignments.data, floorMap.data, maintenance.data]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard icon={BedDouble}    value={stats.dirty}        label="Rooms to Clean"    tint="text-amber-600" />
      <StatCard icon={Loader2}      value={stats.inProgress}   label="In Progress"       tint="text-orange-600" />
      <StatCard icon={Eye}          value={stats.inspected}    label="Awaiting Inspection" tint="text-blue-600" />
      <StatCard icon={CheckCircle2} value={stats.done}         label="Completed Today"   tint="text-emerald-600" />
      <StatCard icon={Wrench}       value={stats.openMaint}    label="Maintenance Open"  tint="text-rose-600" />
      <StatCard icon={Users}        value={stats.staffOnDuty}  label="Staff on Duty"     tint="text-teal" />
    </div>
  );
}
