import { useQuery } from "@tanstack/react-query";
import { reservationsApi } from "../api/reservations.js";

export function useReservations(params) {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: () => reservationsApi.list(params),
  });
}

export function useReservation(id) {
  return useQuery({
    queryKey: ["reservations", id],
    queryFn: () => reservationsApi.get(id),
    enabled: Boolean(id),
  });
}
