import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignTask,
  createLostAndFound,
  createMaintenanceRequest,
  createSupplyRequest,
  getAssignments,
  getFloorMap,
  getInspectionQueue,
  getLostAndFound,
  getMaintenanceRequests,
  getSupplyRequests,
  getTaskChecklist,
  patchTaskAssignment,
  toggleChecklistItem,
  updateLostAndFound,
  updateMaintenanceRequest,
  updateSupplyRequest,
  updateTaskStatus,
} from "../api/housekeeping.js";
import { getUsers } from "../api/users.js";

export const HK_KEYS = {
  all: ["housekeeping"],
  assignments: ["housekeeping", "assignments"],
  floorMap: ["housekeeping", "floor-map"],
  inspection: ["housekeeping", "inspection-queue"],
  lostFound: ["housekeeping", "lost-found"],
  maintenance: ["housekeeping", "maintenance"],
  supplies: ["housekeeping", "supplies"],
  checklist: (taskId) => ["housekeeping", "checklist", taskId],
};

// ── queries ──────────────────────────────────────────────

export const useAssignments = () =>
  useQuery({
    queryKey: HK_KEYS.assignments,
    queryFn: () => getAssignments().then((r) => r.data),
    refetchInterval: 30_000,
  });

/** Housekeeping staff eligible for assignment (managers/admins only). */
export const useAssignableHousekeepingStaff = (user, enabled = true) =>
  useQuery({
    queryKey: ["users", "assign-hk", user?.id, user?.propertyId],
    queryFn: () => getUsers().then((r) => r.data),
    enabled:
      !!enabled &&
      !!user &&
      ["ADMIN", "MANAGER"].includes(user.role),
    select: (users) =>
      users.filter((u) => {
        if (u.role !== "HOUSEKEEPING") return false;
        if (!user.propertyId) return true;
        return u.propertyId === user.propertyId;
      }),
  });

export const useFloorMap = () =>
  useQuery({
    queryKey: HK_KEYS.floorMap,
    queryFn: () => getFloorMap().then((r) => r.data),
    refetchInterval: 30_000,
  });

export const useInspectionQueue = () =>
  useQuery({
    queryKey: HK_KEYS.inspection,
    queryFn: () => getInspectionQueue().then((r) => r.data),
    refetchInterval: 20_000,
  });

export const useTaskChecklist = (taskId) =>
  useQuery({
    queryKey: HK_KEYS.checklist(taskId),
    queryFn: () => getTaskChecklist(taskId).then((r) => r.data),
    enabled: !!taskId,
  });

export const useLostAndFound = () =>
  useQuery({
    queryKey: HK_KEYS.lostFound,
    queryFn: () => getLostAndFound().then((r) => r.data),
  });

export const useMaintenanceRequests = () =>
  useQuery({
    queryKey: HK_KEYS.maintenance,
    queryFn: () => getMaintenanceRequests().then((r) => r.data),
    refetchInterval: 60_000,
  });

export const useSupplyRequests = () =>
  useQuery({
    queryKey: HK_KEYS.supplies,
    queryFn: () => getSupplyRequests().then((r) => r.data),
  });

// ── mutations ────────────────────────────────────────────

export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status, notes }) =>
      updateTaskStatus(taskId, status, notes !== undefined ? { notes } : {}).then(
        (r) => r.data,
      ),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.assignments });
      qc.invalidateQueries({ queryKey: HK_KEYS.floorMap });
      qc.invalidateQueries({ queryKey: HK_KEYS.inspection });
      if (vars?.taskId) {
        qc.invalidateQueries({ queryKey: HK_KEYS.checklist(vars.taskId) });
      }
    },
  });
};

export const useToggleChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, checklistId, itemId }) =>
      toggleChecklistItem(checklistId, itemId).then((r) => ({
        ...r.data,
        taskId,
      })),
    // Optimistic: flip item's isChecked immediately in the checklist cache.
    onMutate: async ({ taskId, itemId }) => {
      await qc.cancelQueries({ queryKey: HK_KEYS.checklist(taskId) });
      const prev = qc.getQueryData(HK_KEYS.checklist(taskId));
      if (!prev) return { prev };
      const next = structuredClone(prev);
      let checkedCount = 0;
      let total = 0;
      for (const group of next.checklist?.byCategory ?? []) {
        for (const it of group.items) {
          if (it.id === itemId) {
            it.isChecked = !it.isChecked;
            it.checkedAt = it.isChecked ? new Date().toISOString() : null;
          }
          total += 1;
          if (it.isChecked) checkedCount += 1;
        }
      }
      if (next.checklist) {
        next.checklist.totalItems = total;
        next.checklist.checkedItems = checkedCount;
        next.checklist.completionPercent =
          total === 0 ? 0 : Math.round((checkedCount / total) * 100);
      }
      qc.setQueryData(HK_KEYS.checklist(taskId), next);
      return { prev };
    },
    onError: (_err, { taskId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(HK_KEYS.checklist(taskId), ctx.prev);
    },
    onSettled: (_data, _err, { taskId }) => {
      qc.invalidateQueries({ queryKey: HK_KEYS.checklist(taskId) });
      qc.invalidateQueries({ queryKey: HK_KEYS.assignments });
      qc.invalidateQueries({ queryKey: HK_KEYS.floorMap });
    },
  });
};

export const useAssignTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => assignTask(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HK_KEYS.all });
    },
  });
};

export const usePatchTaskAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, staffId }) =>
      patchTaskAssignment(taskId, staffId).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HK_KEYS.all });
    },
  });
};

export const useCreateLostAndFound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createLostAndFound(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.lostFound }),
  });
};

export const useUpdateLostAndFound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateLostAndFound(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.lostFound }),
  });
};

export const useCreateMaintenanceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createMaintenanceRequest(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.maintenance }),
  });
};

export const useUpdateMaintenanceRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateMaintenanceRequest(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.maintenance }),
  });
};

export const useCreateSupplyRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createSupplyRequest(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.supplies }),
  });
};

export const useUpdateSupplyRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      updateSupplyRequest(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: HK_KEYS.supplies }),
  });
};

export const useRefreshHousekeeping = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: HK_KEYS.all });
};
