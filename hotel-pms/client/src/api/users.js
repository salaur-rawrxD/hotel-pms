import axiosClient from "./axiosClient.js";

export const getUsers = () => axiosClient.get("/users");
