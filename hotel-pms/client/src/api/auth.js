import axiosClient from "./axiosClient.js";

export const authApi = {
  login: (credentials) =>
    axiosClient.post("/auth/login", credentials).then((r) => r.data),
  logout: () => axiosClient.post("/auth/logout").then((r) => r.data),
  me: () => axiosClient.get("/auth/me").then((r) => r.data),
};
