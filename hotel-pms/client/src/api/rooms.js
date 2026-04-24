import axiosClient from "./axiosClient.js";

export const roomsApi = {
  list: (params) => axiosClient.get("/rooms", { params }).then((r) => r.data),
  get: (id) => axiosClient.get(`/rooms/${id}`).then((r) => r.data),
  updateStatus: (id, status) =>
    axiosClient.patch(`/rooms/${id}/status`, { status }).then((r) => r.data),
};
