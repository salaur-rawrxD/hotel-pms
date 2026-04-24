import { useMemo } from "react";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { KPICard } from "../ui/kpi-card.jsx";
import {
  useAssignments,
  useFloorMap,
  useMaintenanceRequests,
} from "../../hooks/useHousekeeping.js";

export default function HousekeepingStats() {
  const assignments = useAssignments();
  const floorMap = useFloorMap();
  const maintenance = useMaintenanceRequests();

  const isLoading =
    assignments.isLoading || floorMap.isLoading || maintenance.isLoading;

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

    return { dirty, inProgress, inspected, done, openMaint, staffOnDuty };
  }, [assignments.data, floorMap.data, maintenance.data]);

  return (
    <div className="kpi-grid">
      <KPICard
        title="Rooms to Clean"
        value={stats.dirty}
        icon={Sparkles}
        iconBg="bg-amber-100"
        iconColor="text-amber-600"
        loading={isLoading}
      />
      <KPICard
        title="In Progress"
        value={stats.inProgress}
        icon={Loader2}
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
        loading={isLoading}
      />
      <KPICard
        title="For Inspection"
        value={stats.inspected}
        icon={Eye}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        loading={isLoading}
      />
      <KPICard
        title="Completed"
        value={stats.done}
        icon={CheckCircle2}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        loading={isLoading}
      />
      <KPICard
        title="Maintenance"
        value={stats.openMaint}
        icon={Wrench}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
        loading={isLoading}
      />
      <KPICard
        title="Staff on Duty"
        value={stats.staffOnDuty}
        icon={Users}
        iconBg="bg-teal/10"
        iconColor="text-teal"
        loading={isLoading}
      />
    </div>
  );
}
