import axiosClient from "./axiosClient.js";

export const housekeepingApi = {
  listTasks: (params) =>
    axiosClient.get("/housekeeping/tasks", { params }).then((r) => r.data),
  createTask: (payload) =>
    axiosClient.post("/housekeeping/tasks", payload).then((r) => r.data),
  updateTask: (id, payload) =>
    axiosClient
      .patch(`/housekeeping/tasks/${id}`, payload)
      .then((r) => r.data),
};
