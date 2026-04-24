import axiosClient from "./axiosClient.js";

export const getArrivals = () => axiosClient.get("/frontdesk/arrivals");
export const getDepartures = () => axiosClient.get("/frontdesk/departures");
export const getInHouse = () => axiosClient.get("/frontdesk/in-house");
export const getNightAudit = () => axiosClient.get("/frontdesk/night-audit");

export const checkInGuest = (id, data) =>
  axiosClient.post(`/frontdesk/${id}/checkin`, data);
export const checkOutGuest = (id, data) =>
  axiosClient.post(`/frontdesk/${id}/checkout`, data);
export const assignRoom = (id, roomId) =>
  axiosClient.post(`/frontdesk/${id}/assign-room`, { roomId });
export const addFolioItem = (id, data) =>
  axiosClient.post(`/frontdesk/${id}/folio/add`, data);
export const removeFolioItem = (id, itemId) =>
  axiosClient.delete(`/frontdesk/${id}/folio/${itemId}`);
export const createWalkIn = (data) =>
  axiosClient.post("/frontdesk/walk-in", data);
export const addGuestNote = (id, data) =>
  axiosClient.post(`/frontdesk/${id}/note`, data);
export const getGuestFolio = (id) => axiosClient.get(`/frontdesk/${id}/folio`);
export const updateQuickAction = (id, data) =>
  axiosClient.patch(`/frontdesk/${id}/quick-action`, data);
