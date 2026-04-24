import axiosClient from "./axiosClient.js";

export const channelsApi = {
  list: (params) =>
    axiosClient.get("/channels", { params }).then((r) => r.data),
};
