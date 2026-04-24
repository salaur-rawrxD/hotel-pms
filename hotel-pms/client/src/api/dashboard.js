import axiosClient from "./axiosClient.js";

export const getDashboardSummary = () =>
  axiosClient.get("/dashboard/summary");

export const getRevenueChart = () =>
  axiosClient.get("/dashboard/revenue-chart");

export const getArrivalsToday = () =>
  axiosClient.get("/dashboard/arrivals-today");

export const getDeparturesToday = () =>
  axiosClient.get("/dashboard/departures-today");

export const getAlerts = () => axiosClient.get("/dashboard/alerts");

export const getRoomGrid = () => axiosClient.get("/dashboard/room-grid");
