import { useQuery } from "@tanstack/react-query";
import { roomsApi } from "../api/rooms.js";

export function useRooms(params) {
  return useQuery({
    queryKey: ["rooms", params],
    queryFn: () => roomsApi.list(params),
  });
}

export function useRoom(id) {
  return useQuery({
    queryKey: ["rooms", id],
    queryFn: () => roomsApi.get(id),
    enabled: Boolean(id),
  });
}
