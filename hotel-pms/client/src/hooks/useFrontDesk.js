import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getArrivals,
  getDepartures,
  getInHouse,
  getGuestFolio,
  getNightAudit,
  checkInGuest,
  checkOutGuest,
  assignRoom,
  addFolioItem,
  removeFolioItem,
  createWalkIn,
  addGuestNote,
  updateQuickAction,
} from "../api/frontdesk.js";

const FD_KEY = "frontdesk";

export function useArrivals() {
  return useQuery({
    queryKey: [FD_KEY, "arrivals"],
    queryFn: () => getArrivals().then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useDepartures() {
  return useQuery({
    queryKey: [FD_KEY, "departures"],
    queryFn: () => getDepartures().then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useInHouse() {
  return useQuery({
    queryKey: [FD_KEY, "inhouse"],
    queryFn: () => getInHouse().then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useNightAudit() {
  return useQuery({
    queryKey: [FD_KEY, "nightaudit"],
    queryFn: () => getNightAudit().then((r) => r.data),
  });
}

export function useGuestFolioQuery(id) {
  return useQuery({
    queryKey: [FD_KEY, "folio", id],
    queryFn: () => getGuestFolio(id).then((r) => r.data),
    enabled: Boolean(id),
  });
}

function invalidateAll(qc) {
  qc.invalidateQueries({ queryKey: [FD_KEY] });
}

export function useCheckInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => checkInGuest(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCheckOutMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => checkOutGuest(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAssignRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roomId }) => assignRoom(id, roomId).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useFolioItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => addFolioItem(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRemoveFolioItemMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemId }) =>
      removeFolioItem(id, itemId).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useWalkInMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => createWalkIn(data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAddNoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => addGuestNote(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useQuickActionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateQuickAction(id, data).then((r) => r.data),
    onSuccess: () => invalidateAll(qc),
  });
}
