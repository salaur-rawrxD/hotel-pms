import axiosClient from "./axiosClient.js";

export const ratesApi = {
  list: (params) => axiosClient.get("/rates", { params }).then((r) => r.data),
  bulkUpsert: (payload) =>
    axiosClient.put("/rates", payload).then((r) => r.data),
  listPlans: () => axiosClient.get("/rateplans").then((r) => r.data),
  createPlan: (payload) =>
    axiosClient.post("/rateplans", payload).then((r) => r.data),
};
