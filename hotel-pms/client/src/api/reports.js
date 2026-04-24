import axiosClient from "./axiosClient.js";

export const reportsApi = {
  dailySummary: (params) =>
    axiosClient.get("/reports/daily-summary", { params }).then((r) => r.data),
  occupancy: (params) =>
    axiosClient.get("/reports/occupancy", { params }).then((r) => r.data),
  revenue: (params) =>
    axiosClient.get("/reports/revenue", { params }).then((r) => r.data),
  arrivalsDepartures: (params) =>
    axiosClient
      .get("/reports/arrivals-departures", { params })
      .then((r) => r.data),
};
