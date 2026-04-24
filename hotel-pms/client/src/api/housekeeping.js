import axiosClient from "./axiosClient.js";

// ── boards / queues ──────────────────────────────────────
export const getAssignments = () =>
  axiosClient.get("/housekeeping/assignments");

export const getFloorMap = () =>
  axiosClient.get("/housekeeping/floor-map");

export const getInspectionQueue = () =>
  axiosClient.get("/housekeeping/inspection-queue");

// ── tasks + checklists ───────────────────────────────────
export const getTaskChecklist = (taskId) =>
  axiosClient.get(`/housekeeping/tasks/${taskId}/checklist`);

export const updateTaskStatus = (taskId, status, extra = {}) =>
  axiosClient.patch(`/housekeeping/tasks/${taskId}/status`, {
    status,
    ...extra,
  });

export const toggleChecklistItem = (checklistId, itemId) =>
  axiosClient.patch(
    `/housekeeping/checklist/${checklistId}/items/${itemId}`,
  );

export const assignTask = (data) =>
  axiosClient.post("/housekeeping/tasks/assign", data);

export const patchTaskAssignment = (taskId, staffId) =>
  axiosClient.patch(`/housekeeping/tasks/${taskId}/assignment`, { staffId });

// ── lost & found ─────────────────────────────────────────
export const getLostAndFound = () =>
  axiosClient.get("/housekeeping/lost-and-found");

export const createLostAndFound = (data) =>
  axiosClient.post("/housekeeping/lost-and-found", data);

export const updateLostAndFound = (id, data) =>
  axiosClient.patch(`/housekeeping/lost-and-found/${id}`, data);

// ── maintenance ──────────────────────────────────────────
export const getMaintenanceRequests = () =>
  axiosClient.get("/housekeeping/maintenance");

export const createMaintenanceRequest = (data) =>
  axiosClient.post("/housekeeping/maintenance", data);

export const updateMaintenanceRequest = (id, data) =>
  axiosClient.patch(`/housekeeping/maintenance/${id}`, data);

// ── supplies ─────────────────────────────────────────────
export const getSupplyRequests = () =>
  axiosClient.get("/housekeeping/supplies");

export const createSupplyRequest = (data) =>
  axiosClient.post("/housekeeping/supplies", data);

export const updateSupplyRequest = (id, data) =>
  axiosClient.patch(`/housekeeping/supplies/${id}`, data);
