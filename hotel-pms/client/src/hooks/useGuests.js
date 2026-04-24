import { useQuery } from "@tanstack/react-query";
import { guestsApi } from "../api/guests.js";

export function useGuests(params) {
  return useQuery({
    queryKey: ["guests", params],
    queryFn: () => guestsApi.list(params),
  });
}

export function useGuest(id) {
  return useQuery({
    queryKey: ["guests", id],
    queryFn: () => guestsApi.get(id),
    enabled: Boolean(id),
  });
}
