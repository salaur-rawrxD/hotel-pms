import axiosClient from "./axiosClient.js";

export const guestsApi = {
  list: (params) => axiosClient.get("/guests", { params }).then((r) => r.data),
  get: (id) => axiosClient.get(`/guests/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post("/guests", payload).then((r) => r.data),
  update: (id, payload) =>
    axiosClient.patch(`/guests/${id}`, payload).then((r) => r.data),
};
