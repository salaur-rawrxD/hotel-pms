import axiosClient from "./axiosClient.js";

export const loginRequest = (email, password) =>
  axiosClient.post("/auth/login", { email, password });

export const logoutRequest = () => axiosClient.post("/auth/logout");

export const getMeRequest = () => axiosClient.get("/auth/me");
