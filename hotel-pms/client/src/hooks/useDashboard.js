import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAlerts,
  getArrivalsToday,
  getDashboardSummary,
  getDeparturesToday,
  getRevenueChart,
  getRoomGrid,
} from "../api/dashboard.js";

export const DASHBOARD_KEYS = {
  all: ["dashboard"],
  summary: ["dashboard", "summary"],
  revenueChart: ["dashboard", "revenue-chart"],
  arrivals: ["dashboard", "arrivals"],
  departures: ["dashboard", "departures"],
  alerts: ["dashboard", "alerts"],
  roomGrid: ["dashboard", "room-grid"],
};

export const useDashboardSummary = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.summary,
    queryFn: () => getDashboardSummary().then((r) => r.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

export const useRevenueChart = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.revenueChart,
    queryFn: () => getRevenueChart().then((r) => r.data),
    staleTime: 300_000,
  });

export const useArrivalsToday = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.arrivals,
    queryFn: () => getArrivalsToday().then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useDeparturesToday = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.departures,
    queryFn: () => getDeparturesToday().then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useAlerts = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.alerts,
    queryFn: () => getAlerts().then((r) => r.data),
    refetchInterval: 60_000,
  });

export const useRoomGrid = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.roomGrid,
    queryFn: () => getRoomGrid().then((r) => r.data),
    refetchInterval: 30_000,
  });

/**
 * Returns an invalidator for the whole dashboard scope. Useful for the
 * manual refresh button on the Dashboard page.
 */
export const useRefreshDashboard = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: DASHBOARD_KEYS.all });
};
