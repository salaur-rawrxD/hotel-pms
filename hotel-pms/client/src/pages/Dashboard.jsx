import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import AlertsPanel from "../components/dashboard/AlertsPanel.jsx";
import ArrivalsList from "../components/dashboard/ArrivalsList.jsx";
import KPIBar from "../components/dashboard/KPIBar.jsx";
import RevenueChart from "../components/dashboard/RevenueChart.jsx";
import RoomGrid from "../components/dashboard/RoomGrid.jsx";
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

  // Advance the "last updated" stamp whenever any dashboard query finishes.
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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {greeting}, <span className="font-semibold">{displayName}</span>
            <span className="text-slate-300"> · </span>
            <span>{formatDate(new Date())}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-navy-900 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </header>

      {/* Row 1 — KPIs */}
      <KPIBar summary={summary.data} isLoading={summary.isLoading} />

      {/* Row 2 — Room grid + Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <RoomGrid floors={grid.data} isLoading={grid.isLoading} />
        <AlertsPanel alerts={alerts.data} isLoading={alerts.isLoading} />
      </div>

      {/* Row 3 — Chart + Arrivals/Departures */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[11fr_9fr]">
        <RevenueChart data={chart.data} isLoading={chart.isLoading} />
        <ArrivalsList
          arrivals={arrivals.data}
          departures={departures.data}
          arrivalsLoading={arrivals.isLoading}
          departuresLoading={departures.isLoading}
          layout="stacked"
        />
      </div>

      {/* Footer note */}
      <p className="text-right text-[11px] text-slate-400">
        Auto-refreshes every 60s · Last updated {formatTime(lastUpdated)}
      </p>
    </div>
  );
}
