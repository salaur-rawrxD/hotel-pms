import axiosClient from "./axiosClient.js";

export const reservationsApi = {
  list: (params) =>
    axiosClient.get("/reservations", { params }).then((r) => r.data),
  get: (id) => axiosClient.get(`/reservations/${id}`).then((r) => r.data),
  create: (payload) =>
    axiosClient.post("/reservations", payload).then((r) => r.data),
  update: (id, payload) =>
    axiosClient.patch(`/reservations/${id}`, payload).then((r) => r.data),
  remove: (id) =>
    axiosClient.delete(`/reservations/${id}`).then((r) => r.data),
  checkin: (id) =>
    axiosClient.post(`/reservations/${id}/checkin`).then((r) => r.data),
  checkout: (id) =>
    axiosClient.post(`/reservations/${id}/checkout`).then((r) => r.data),
};
