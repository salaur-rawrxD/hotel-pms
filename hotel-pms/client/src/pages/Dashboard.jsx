import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import AlertsPanel from "../components/dashboard/AlertsPanel.jsx";
import ArrivalsList from "../components/dashboard/ArrivalsList.jsx";
import KPIBar from "../components/dashboard/KPIBar.jsx";
import RevenueChart from "../components/dashboard/RevenueChart.jsx";
import RoomGrid from "../components/dashboard/RoomGrid.jsx";
import { Button } from "../components/ui/button.jsx";
import { useAuthStore } from "../store/authStore.js";
import {
  useAlerts,
  useArrivalsToday,
  useDashboardSummary,
  useDeparturesToday,
  useRefreshDashboard,
  useRevenueChart,
  useRoomGrid,
} from "../hooks/useDashboard.js";
import { formatDate, formatTime } from "../utils/formatDate.js";

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  const summary = useDashboardSummary();
  const chart = useRevenueChart();
  const arrivals = useArrivalsToday();
  const departures = useDeparturesToday();
  const alerts = useAlerts();
  const grid = useRoomGrid();

  const refresh = useRefreshDashboard();
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const anyFetching =
      summary.isFetching ||
      chart.isFetching ||
      arrivals.isFetching ||
      departures.isFetching ||
      alerts.isFetching ||
      grid.isFetching;
    if (!anyFetching) setLastUpdated(new Date());
  }, [
    summary.isFetching,
    chart.isFetching,
    arrivals.isFetching,
    departures.isFetching,
    alerts.isFetching,
    grid.isFetching,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success("Dashboard refreshed");
    } finally {
      setRefreshing(false);
    }
  };

  const greeting = greetingFor(new Date().getHours());
  const displayName = user?.name ?? "there";

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            {greeting}, <span className="font-semibold">{displayName}</span>
            <span className="text-border"> · </span>
            <span>{formatDate(new Date())}</span>
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={refreshing ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* KPI bar */}
      <KPIBar summary={summary.data} isLoading={summary.isLoading} />

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-3">
          <RoomGrid floors={grid.data} isLoading={grid.isLoading} />
          <RevenueChart data={chart.data} isLoading={chart.isLoading} />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <AlertsPanel alerts={alerts.data} isLoading={alerts.isLoading} />
          <ArrivalsList
            arrivals={arrivals.data}
            departures={departures.data}
            arrivalsLoading={arrivals.isLoading}
            departuresLoading={departures.isLoading}
            layout="stacked"
          />
        </div>
      </div>

      <p className="text-right text-[11px] text-muted-foreground">
        Auto-refreshes every 60s · Last updated {formatTime(lastUpdated)}
      </p>
    </div>
  );
}
